const REFRESH_BUFFER_SECONDS = 60;

let accessToken: string | null = null;
let expiresAt = 0;
let refreshPromise: Promise<string> | null = null;

function getConsumerKey(): string {
  return process.env.ALLIANZ_CONSUMER_KEY ?? '';
}

function getConsumerSecret(): string {
  return process.env.ALLIANZ_CONSUMER_SECRET ?? '';
}

function getTokenUrl(): string {
  const baseUrl =
    process.env.ALLIANZ_BASE_URL ?? 'https://asia-uat-malaysia.apis.allianz.com';
  return `${baseUrl}/v1/oauth/accesstoken`;
}

async function fetchNewToken(): Promise<string> {
  const consumerKey = getConsumerKey();
  const consumerSecret = getConsumerSecret();

  if (!consumerKey || !consumerSecret) {
    throw new Error('ALLIANZ_CONSUMER_KEY and ALLIANZ_CONSUMER_SECRET must be set');
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(getTokenUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const { access_token, expires_in } = data;

  accessToken = access_token;
  expiresAt = Date.now() + (parseInt(expires_in, 10) - REFRESH_BUFFER_SECONDS) * 1000;

  console.log(
    `[Auth] Token acquired, expires in ${expires_in}s (refreshing at ${REFRESH_BUFFER_SECONDS}s before expiry)`,
  );

  return access_token;
}

export async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < expiresAt) {
    return accessToken;
  }

  if (!refreshPromise) {
    refreshPromise = fetchNewToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export function isConfigured(): boolean {
  return !!(getConsumerKey() && getConsumerSecret());
}
