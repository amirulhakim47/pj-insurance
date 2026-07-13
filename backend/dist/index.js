"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const allianz_auth_1 = require("./services/allianz-auth");
const error_handler_1 = require("./middleware/error-handler");
const rate_limiter_1 = require("./middleware/rate-limiter");
const vehicle_1 = __importDefault(require("./routes/vehicle"));
const ubb_1 = __importDefault(require("./routes/ubb"));
const quote_1 = __importDefault(require("./routes/quote"));
const submission_1 = __importDefault(require("./routes/submission"));
const lov_1 = __importDefault(require("./routes/lov"));
const callback_1 = __importDefault(require("./routes/callback"));
const payment_1 = __importDefault(require("./routes/payment"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
app.use((0, helmet_1.default)());
app.disable('x-powered-by');
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '100kb' }));
app.use(rate_limiter_1.generalLimiter);
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} [${req.ip}]`);
    next();
});
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        allianzConfigured: allianz_auth_1.tokenManager.isConfigured(),
        timestamp: new Date().toISOString(),
    });
});
app.use('/api', vehicle_1.default);
app.use('/api', ubb_1.default);
app.use('/api', rate_limiter_1.quoteLimiter, quote_1.default);
app.use('/api', rate_limiter_1.submissionLimiter, submission_1.default);
app.use('/api', lov_1.default);
app.use('/api', callback_1.default);
app.use('/api', payment_1.default);
app.use(error_handler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`\n[Server] Backend running on http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Server] Allianz credentials: ${allianz_auth_1.tokenManager.isConfigured() ? 'configured' : 'NOT configured - set ALLIANZ_CONSUMER_KEY and ALLIANZ_CONSUMER_SECRET'}`);
    console.log(`[Server] CORS origins: ${allowedOrigins.join(', ')}\n`);
});
exports.default = app;
//# sourceMappingURL=index.js.map