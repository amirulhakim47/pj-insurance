"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenManager = void 0;
const axios_1 = __importDefault(require("axios"));
const REFRESH_BUFFER_SECONDS = 60;
class AllianzTokenManager {
    accessToken = null;
    expiresAt = 0;
    refreshPromise = null;
    consumerKey;
    consumerSecret;
    tokenUrl;
    constructor() {
        this.consumerKey = process.env.ALLIANZ_CONSUMER_KEY ?? '';
        this.consumerSecret = process.env.ALLIANZ_CONSUMER_SECRET ?? '';
        const baseUrl = process.env.ALLIANZ_BASE_URL ??
            'https://asia-uat-malaysia.apis.allianz.com';
        this.tokenUrl = `${baseUrl}/v1/oauth/accesstoken`;
    }
    async getAccessToken() {
        if (this.accessToken && Date.now() < this.expiresAt) {
            return this.accessToken;
        }
        if (!this.refreshPromise) {
            this.refreshPromise = this.fetchNewToken();
        }
        try {
            const token = await this.refreshPromise;
            return token;
        }
        finally {
            this.refreshPromise = null;
        }
    }
    async fetchNewToken() {
        if (!this.consumerKey || !this.consumerSecret) {
            throw new Error('ALLIANZ_CONSUMER_KEY and ALLIANZ_CONSUMER_SECRET must be set');
        }
        const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
        const response = await axios_1.default.post(this.tokenUrl, 'grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const { access_token, expires_in } = response.data;
        this.accessToken = access_token;
        this.expiresAt =
            Date.now() + (parseInt(expires_in, 10) - REFRESH_BUFFER_SECONDS) * 1000;
        console.log(`[Auth] Token acquired, expires in ${expires_in}s (refreshing at ${REFRESH_BUFFER_SECONDS}s before expiry)`);
        return access_token;
    }
    isConfigured() {
        return !!(this.consumerKey && this.consumerSecret);
    }
}
exports.tokenManager = new AllianzTokenManager();
//# sourceMappingURL=allianz-auth.js.map