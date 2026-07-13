import type { Request, Response, NextFunction } from 'express';
export interface ApiError {
    status: number;
    code: string;
    message: string;
}
export declare function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error-handler.d.ts.map