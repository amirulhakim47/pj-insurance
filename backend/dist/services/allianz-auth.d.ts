declare class AllianzTokenManager {
    private accessToken;
    private expiresAt;
    private refreshPromise;
    private readonly consumerKey;
    private readonly consumerSecret;
    private readonly tokenUrl;
    constructor();
    getAccessToken(): Promise<string>;
    private fetchNewToken;
    isConfigured(): boolean;
}
export declare const tokenManager: AllianzTokenManager;
export {};
//# sourceMappingURL=allianz-auth.d.ts.map