"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
function verifyCallbackSignature(req) {
    const secret = process.env.CALLBACK_HMAC_SECRET;
    if (!secret) {
        console.warn('[Allianz Callback] CALLBACK_HMAC_SECRET not set — skipping verification in dev');
        return process.env.NODE_ENV !== 'production';
    }
    const signature = req.headers['x-allianz-signature'];
    if (!signature)
        return false;
    const payload = JSON.stringify(req.body);
    const expected = crypto_1.default.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto_1.default.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}
/**
 * Allianz Callback Endpoint
 * Receives callbacks from Allianz backend after policy submission.
 *
 * Callback options:
 * 1. Default: Allianz sends policy email + provides pol number
 * 2. Allianz sends email + provides pol number & PDF
 * 3. Partner sends email; Allianz provides pol number & PDF only
 */
router.post('/callback', async (req, res) => {
    try {
        if (!verifyCallbackSignature(req)) {
            console.warn('[Allianz Callback] Invalid or missing signature', { ip: req.ip });
            res.status(401).json({ received: false, error: 'Unauthorized: invalid signature' });
            return;
        }
        const { contractNumber, policyNumber, status, policyPdf, vehicleLicenseId, } = req.body;
        console.log('[Allianz Callback] Received:', {
            contractNumber,
            policyNumber,
            status,
            vehicleLicenseId,
            hasPdf: !!policyPdf,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });
        if (status === 'SUCCESS' && policyNumber) {
            console.log(`[Allianz Callback] Policy issued: ${policyNumber} for contract ${contractNumber}`);
        }
        else if (status === 'FAILED') {
            console.error(`[Allianz Callback] Policy issuance failed for contract ${contractNumber}`);
        }
        res.status(200).json({ received: true, timestamp: new Date().toISOString() });
    }
    catch (err) {
        console.error('[Allianz Callback] Processing error:', err);
        res.status(500).json({ received: false, error: 'Internal processing error' });
    }
});
exports.default = router;
//# sourceMappingURL=callback.js.map