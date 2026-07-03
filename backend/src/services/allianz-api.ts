import axios, { type AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { tokenManager } from './allianz-auth';
import type {
  GetVehicleDetailsRequest,
  GetVehicleDetailsResponse,
  GetNcdDetailsRequest,
  GetNcdDetailsResponse,
  CheckUBBRequest,
  CheckUBBResponse,
  GetPlanRecommendationRequest,
  UpdatePlanRecommendationRequest,
  GetPlanRecommendationResponse,
  SubmitTransactionRequest,
  SubmitTransactionResponse,
  GetAllianzMakeListResponse,
  GetAllianzModelListResponse,
  GetAllianzVariantListResponse,
  GetAVMakeListResponse,
  GetAVModelListResponse,
  GetAVVariantListResponse,
  Region,
} from '../types/allianz';

class AllianzApiService {
  private client: AxiosInstance;

  constructor() {
    const baseUrl =
      process.env.ALLIANZ_BASE_URL ??
      'https://asia-uat-malaysia.apis.allianz.com';

    this.client = axios.create({
      baseURL: `${baseUrl}/v1/openapi/mci`,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use(async (config) => {
      const token = await tokenManager.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['X-Request-ID'] = uuidv4();

      console.log(
        `[Allianz] ${config.method?.toUpperCase()} ${config.url} | X-Request-ID: ${config.headers['X-Request-ID']}`,
      );
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        console.log(
          `[Allianz] Response ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}:`,
          JSON.stringify(response.data, null, 2),
        );
        return response;
      },
      (error) => {
        if (axios.isAxiosError(error)) {
          console.error(
            `[Allianz] Error ${error.response?.status}: ${JSON.stringify(error.response?.data)}`,
          );
        }
        throw error;
      },
    );
  }

  // ── Vehicle Details ──

  async getVehicleDetails(
    body: GetVehicleDetailsRequest,
  ): Promise<GetVehicleDetailsResponse> {
    const { data } = await this.client.post<GetVehicleDetailsResponse>(
      '/vehicleDetails',
      body,
    );
    return data;
  }

  // ── NCD Details ──

  async getNcdDetails(
    body: GetNcdDetailsRequest,
  ): Promise<GetNcdDetailsResponse> {
    const { data } = await this.client.post<GetNcdDetailsResponse>(
      '/ncdDetails',
      body,
    );
    return data;
  }

  // ── Check UBB ──

  async checkUBB(body: CheckUBBRequest): Promise<CheckUBBResponse> {
    const { data } = await this.client.post<CheckUBBResponse>(
      '/checkUBB',
      body,
    );
    return data;
  }

  // ── Generate Quotation ──

  async generateQuote(
    body: GetPlanRecommendationRequest,
  ): Promise<GetPlanRecommendationResponse> {
    const { data } = await this.client.post<GetPlanRecommendationResponse>(
      '/quote',
      body,
    );
    return data;
  }

  // ── Update Quotation ──

  async updateQuote(
    body: UpdatePlanRecommendationRequest,
  ): Promise<GetPlanRecommendationResponse> {
    const { data } = await this.client.put<GetPlanRecommendationResponse>(
      '/quote',
      body,
    );
    return data;
  }

  // ── Submission ──

  async submitTransaction(
    body: SubmitTransactionRequest,
  ): Promise<SubmitTransactionResponse> {
    const { data } = await this.client.post<SubmitTransactionResponse>(
      '/submission',
      body,
    );
    return data;
  }

  // ── LOV: Allianz Make ──

  async getAllianzMakeList(
    makeCode?: string,
  ): Promise<GetAllianzMakeListResponse> {
    const params: Record<string, string> = {};
    if (makeCode) params.makeCode = makeCode;

    const { data } = await this.client.get<GetAllianzMakeListResponse>(
      '/lov/allianzMake',
      { params },
    );
    return data;
  }

  // ── LOV: Allianz Model ──

  async getAllianzModelList(
    makeCode: string,
    modelCode?: string,
  ): Promise<GetAllianzModelListResponse> {
    const params: Record<string, string> = { makeCode };
    if (modelCode) params.modelCode = modelCode;

    const { data } = await this.client.get<GetAllianzModelListResponse>(
      '/lov/allianzModel',
      { params },
    );
    return data;
  }

  // ── LOV: Allianz Variant ──

  async getAllianzVariantList(
    makeCode: string,
    modelCode?: string,
  ): Promise<GetAllianzVariantListResponse> {
    const params: Record<string, string> = { makeCode };
    if (modelCode) params.modelCode = modelCode;

    const { data } = await this.client.get<GetAllianzVariantListResponse>(
      '/lov/allianzVariant',
      { params },
    );
    return data;
  }

  // ── LOV: Agreed Value Make ──

  async getAVMakeList(
    region: Region,
    makeCode?: string,
  ): Promise<GetAVMakeListResponse> {
    const params: Record<string, string> = { region };
    if (makeCode) params.makeCode = makeCode;

    const { data } = await this.client.get<GetAVMakeListResponse>(
      '/lov/avMake',
      { params },
    );
    return data;
  }

  // ── LOV: Agreed Value Model ──

  async getAVModelList(
    region: Region,
    makeCode: string,
    modelCode?: string,
  ): Promise<GetAVModelListResponse> {
    const params: Record<string, string> = { region, makeCode };
    if (modelCode) params.modelCode = modelCode;

    const { data } = await this.client.get<GetAVModelListResponse>(
      '/lov/avModel',
      { params },
    );
    return data;
  }

  // ── LOV: Agreed Value Variant ──

  async getAVVariantList(
    region: Region,
    makeCode: string,
    modelCode?: string,
    makeYear?: string,
  ): Promise<GetAVVariantListResponse> {
    const params: Record<string, string> = { region, makeCode };
    if (modelCode) params.modelCode = modelCode;
    if (makeYear) params.makeYear = makeYear;

    const { data } = await this.client.get<GetAVVariantListResponse>(
      '/lov/avVariant',
      { params },
    );
    return data;
  }
}

export const allianzApi = new AllianzApiService();
