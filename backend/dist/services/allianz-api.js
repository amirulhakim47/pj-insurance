"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allianzApi = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const allianz_auth_1 = require("./allianz-auth");
class AllianzApiService {
    client;
    constructor() {
        const baseUrl = process.env.ALLIANZ_BASE_URL ??
            'https://asia-uat-malaysia.apis.allianz.com';
        this.client = axios_1.default.create({
            baseURL: `${baseUrl}/v1/openapi/mci`,
            headers: { 'Content-Type': 'application/json' },
        });
        this.client.interceptors.request.use(async (config) => {
            const token = await allianz_auth_1.tokenManager.getAccessToken();
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['X-Request-ID'] = (0, uuid_1.v4)();
            console.log(`[Allianz] ${config.method?.toUpperCase()} ${config.url} | X-Request-ID: ${config.headers['X-Request-ID']}`);
            return config;
        });
        this.client.interceptors.response.use((response) => {
            console.log(`[Allianz] Response ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}:`, JSON.stringify(response.data, null, 2));
            return response;
        }, (error) => {
            if (axios_1.default.isAxiosError(error)) {
                console.error(`[Allianz] Error ${error.response?.status}: ${JSON.stringify(error.response?.data)}`);
            }
            throw error;
        });
    }
    // ── Vehicle Details ──
    async getVehicleDetails(body) {
        const { data } = await this.client.post('/vehicleDetails', body);
        return data;
    }
    // ── NCD Details ──
    async getNcdDetails(body) {
        const { data } = await this.client.post('/ncdDetails', body);
        return data;
    }
    // ── Check UBB ──
    async checkUBB(body) {
        const { data } = await this.client.post('/checkUBB', body);
        return data;
    }
    // ── Generate Quotation ──
    async generateQuote(body) {
        const { data } = await this.client.post('/quote', body);
        return data;
    }
    // ── Update Quotation ──
    async updateQuote(body) {
        const { data } = await this.client.put('/quote', body);
        return data;
    }
    // ── Submission ──
    async submitTransaction(body) {
        const { data } = await this.client.post('/submission', body);
        return data;
    }
    // ── LOV: Allianz Make ──
    async getAllianzMakeList(makeCode) {
        const params = {};
        if (makeCode)
            params.makeCode = makeCode;
        const { data } = await this.client.get('/lov/allianzMake', { params });
        return data;
    }
    // ── LOV: Allianz Model ──
    async getAllianzModelList(makeCode, modelCode) {
        const params = { makeCode };
        if (modelCode)
            params.modelCode = modelCode;
        const { data } = await this.client.get('/lov/allianzModel', { params });
        return data;
    }
    // ── LOV: Allianz Variant ──
    async getAllianzVariantList(makeCode, modelCode) {
        const params = { makeCode };
        if (modelCode)
            params.modelCode = modelCode;
        const { data } = await this.client.get('/lov/allianzVariant', { params });
        return data;
    }
    // ── LOV: Agreed Value Make ──
    async getAVMakeList(region, makeCode) {
        const params = { region };
        if (makeCode)
            params.makeCode = makeCode;
        const { data } = await this.client.get('/lov/avMake', { params });
        return data;
    }
    // ── LOV: Agreed Value Model ──
    async getAVModelList(region, makeCode, modelCode) {
        const params = { region, makeCode };
        if (modelCode)
            params.modelCode = modelCode;
        const { data } = await this.client.get('/lov/avModel', { params });
        return data;
    }
    // ── LOV: Agreed Value Variant ──
    async getAVVariantList(region, makeCode, modelCode, makeYear) {
        const params = { region, makeCode };
        if (modelCode)
            params.modelCode = modelCode;
        if (makeYear)
            params.makeYear = makeYear;
        const { data } = await this.client.get('/lov/avVariant', { params });
        return data;
    }
}
exports.allianzApi = new AllianzApiService();
//# sourceMappingURL=allianz-api.js.map