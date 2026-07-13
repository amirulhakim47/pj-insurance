import type { GetVehicleDetailsRequest, GetVehicleDetailsResponse, GetNcdDetailsRequest, GetNcdDetailsResponse, CheckUBBRequest, CheckUBBResponse, GetPlanRecommendationRequest, UpdatePlanRecommendationRequest, GetPlanRecommendationResponse, SubmitTransactionRequest, SubmitTransactionResponse, GetAllianzMakeListResponse, GetAllianzModelListResponse, GetAllianzVariantListResponse, GetAVMakeListResponse, GetAVModelListResponse, GetAVVariantListResponse, Region } from '../types/allianz';
declare class AllianzApiService {
    private client;
    constructor();
    getVehicleDetails(body: GetVehicleDetailsRequest): Promise<GetVehicleDetailsResponse>;
    getNcdDetails(body: GetNcdDetailsRequest): Promise<GetNcdDetailsResponse>;
    checkUBB(body: CheckUBBRequest): Promise<CheckUBBResponse>;
    generateQuote(body: GetPlanRecommendationRequest): Promise<GetPlanRecommendationResponse>;
    updateQuote(body: UpdatePlanRecommendationRequest): Promise<GetPlanRecommendationResponse>;
    submitTransaction(body: SubmitTransactionRequest): Promise<SubmitTransactionResponse>;
    getAllianzMakeList(makeCode?: string): Promise<GetAllianzMakeListResponse>;
    getAllianzModelList(makeCode: string, modelCode?: string): Promise<GetAllianzModelListResponse>;
    getAllianzVariantList(makeCode: string, modelCode?: string): Promise<GetAllianzVariantListResponse>;
    getAVMakeList(region: Region, makeCode?: string): Promise<GetAVMakeListResponse>;
    getAVModelList(region: Region, makeCode: string, modelCode?: string): Promise<GetAVModelListResponse>;
    getAVVariantList(region: Region, makeCode: string, modelCode?: string, makeYear?: string): Promise<GetAVVariantListResponse>;
}
export declare const allianzApi: AllianzApiService;
export {};
//# sourceMappingURL=allianz-api.d.ts.map