"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const axios_1 = __importDefault(require("axios"));
function errorHandler(err, _req, res, _next) {
    if (axios_1.default.isAxiosError(err)) {
        const status = err.response?.status ?? 502;
        const body = err.response?.data;
        res.status(status).json({
            status,
            code: body?.errorCode ?? 'ALLIANZ_ERROR',
            message: body?.errorMessage ?? err.message,
        });
        return;
    }
    if (err instanceof Error) {
        console.error('[Error]', err.message);
        res.status(500).json({
            status: 500,
            code: 'INTERNAL_ERROR',
            message: err.message,
        });
        return;
    }
    res.status(500).json({
        status: 500,
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
    });
}
//# sourceMappingURL=error-handler.js.map