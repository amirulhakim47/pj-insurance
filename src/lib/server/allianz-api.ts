import { getAccessToken } from './allianz-auth';

function getBaseUrl(): string {
  const base =
    process.env.ALLIANZ_BASE_URL ?? 'https://asia-uat-malaysia.apis.allianz.com';
  return `${base}/v1/openapi/mci`;
}

function generateRequestId(): string {
  return crypto.randomUUID();
}

async function allianzFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; params?: Record<string, string> } = {},
): Promise<T> {
  const token = await getAccessToken();
  const requestId = generateRequestId();
  const method = options.method ?? 'GET';

  let url = `${getBaseUrl()}${path}`;
  if (options.params) {
    const qs = new URLSearchParams(options.params).toString();
    if (qs) url += `?${qs}`;
  }

  console.log(`[Allianz] ${method} ${path} | X-Request-ID: ${requestId}`);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Request-ID': requestId,
  };

  const fetchOptions: RequestInit = { method, headers };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  const data = await response.json();

  if (!response.ok) {
    console.error(`[Allianz] Error ${response.status}:`, JSON.stringify(data));
    const error: any = new Error(`Allianz API error: ${response.status}`);
    error.status = response.status;
    error.response = { data };
    throw error;
  }

  console.log(`[Allianz] Response ${response.status} ${method} ${path}:`, JSON.stringify(data, null, 2));
  return data as T;
}

export async function getVehicleDetails(body: unknown) {
  return allianzFetch('/vehicleDetails', { method: 'POST', body });
}

export async function getNcdDetails(body: unknown) {
  return allianzFetch('/ncdDetails', { method: 'POST', body });
}

export async function checkUBB(body: unknown) {
  return allianzFetch('/checkUBB', { method: 'POST', body });
}

export async function generateQuote(body: unknown) {
  return allianzFetch('/quote', { method: 'POST', body });
}

export async function updateQuote(body: unknown) {
  return allianzFetch('/quote', { method: 'PUT', body });
}

export async function submitTransaction(body: unknown) {
  return allianzFetch('/submission', { method: 'POST', body });
}

export async function getAllianzMakeList(params?: Record<string, string>) {
  return allianzFetch('/lov/allianzMake', { params });
}

export async function getAllianzModelList(params: Record<string, string>) {
  return allianzFetch('/lov/allianzModel', { params });
}

export async function getAllianzVariantList(params: Record<string, string>) {
  return allianzFetch('/lov/allianzVariant', { params });
}

export async function getAVMakeList(params: Record<string, string>) {
  return allianzFetch('/lov/avMake', { params });
}

export async function getAVModelList(params: Record<string, string>) {
  return allianzFetch('/lov/avModel', { params });
}

export async function getAVVariantList(params: Record<string, string>) {
  return allianzFetch('/lov/avVariant', { params });
}
