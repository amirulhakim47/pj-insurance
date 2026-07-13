"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionLimiter = exports.quoteLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        code: 'RATE_LIMIT',
        message: 'Too many requests, please try again later.',
    },
});
exports.quoteLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        code: 'RATE_LIMIT',
        message: 'Too many quote requests. Please wait a moment before trying again.',
    },
});
exports.submissionLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        code: 'RATE_LIMIT',
        message: 'Too many submission attempts. Please wait before trying again.',
    },
});
//# sourceMappingURL=rate-limiter.js.map