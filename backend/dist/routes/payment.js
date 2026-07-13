"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
function hmacSha256(key, data) {
    return crypto_1.default.createHmac('sha256', key).update(data).digest('hex');
}
function getSecretKey() {
    const key = process.env.SENANGPAY_SECRET_KEY;
    if (!key)
        throw new Error('SENANGPAY_SECRET_KEY is not configured');
    return key;
}
router.post('/payment/hash', (req, res, next) => {
    try {
        const { detail, amount, order_id } = req.body;
        if (!detail || !amount || !order_id) {
            res.status(400).json({
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'detail, amount, and order_id are required',
            });
            return;
        }
        if (!/^\d+(\.\d{1,2})?$/.test(amount) || parseFloat(amount) <= 0) {
            res.status(400).json({
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'amount must be a positive number with up to 2 decimal places',
            });
            return;
        }
        const secretKey = getSecretKey();
        const str = secretKey + detail + amount + order_id;
        const hash = hmacSha256(secretKey, str);
        res.json({
            hash,
            merchant_id: process.env.SENANGPAY_MERCHANT_ID || '',
        });
    }
    catch (err) {
        next(err);
    }
});
router.post('/payment/verify', (req, res, next) => {
    try {
        const { status_id, order_id, transaction_id, msg, hash } = req.body;
        if (!status_id || !hash) {
            res.status(400).json({
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'status_id and hash are required',
            });
            return;
        }
        const secretKey = getSecretKey();
        const str = secretKey + status_id + order_id + transaction_id + msg;
        const expectedHash = hmacSha256(secretKey, str);
        const valid = expectedHash === hash;
        res.json({ valid });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=payment.js.map