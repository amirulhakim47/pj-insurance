import axios from 'axios';
import type { AllianzTokenResponse } from '../types/allianz';

const REFRESH_BUFFER_SECONDS = 60;

class AllianzTokenManager {
  private accessToken: string | null = null;
  private expiresAt = 0;
  private refreshPromise: Promise<string> | null = null;

  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly tokenUrl: string;

  constructor() {
    this.consumerKey = process.env.ALLIANZ_CONSUMER_KEY ?? '';
    this.consumerSecret = process.env.ALLIANZ_CONSUMER_SECRET ?? '';
    const baseUrl =
      process.env.ALLIANZ_BASE_URL ??
      'https://asia-uat-malaysia.apis.allianz.com';
    this.tokenUrl = `${baseUrl}/v1/oauth/accesstoken`;
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.fetchNewToken();
    }

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async fetchNewToken(): Promise<string> {
    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error(
        'ALLIANZ_CONSUMER_KEY and ALLIANZ_CONSUMER_SECRET must be set',
      );
    }

    const credentials = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`,
    ).toString('base64');

    const response = await axios.post<AllianzTokenResponse>(
      this.tokenUrl,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { access_token, expires_in } = response.data;

    this.accessToken = access_token;
    this.expiresAt =
      Date.now() + (parseInt(expires_in, 10) - REFRESH_BUFFER_SECONDS) * 1000;

    console.log(
      `[Auth] Token acquired, expires in ${expires_in}s (refreshing at ${REFRESH_BUFFER_SECONDS}s before expiry)`,
    );

    return access_token;
  }

  isConfigured(): boolean {
    return !!(this.consumerKey && this.consumerSecret);
  }
}

export const tokenManager = new AllianzTokenManager();
