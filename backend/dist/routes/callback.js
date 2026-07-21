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
        console.warn('[Allianz Callback] CALLBACK_HMAC_SECRET not set — accepting in non-production');
        return process.env.NODE_ENV !== 'production';
    }
    const signature = req.headers['x-allianz-signature'] ||
        req.headers['x-signature'] ||
        req.headers['x-hmac-signature'];
    if (!signature) {
        console.warn('[Allianz Callback] No signature header found. Headers:', Object.keys(req.headers).join(', '));
        return process.env.NODE_ENV !== 'production';
    }
    const payload = JSON.stringify(req.body);
    const expected = crypto_1.default.createHmac('sha256', secret).update(payload).digest('hex');
    try {
        return crypto_1.default.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
    }
    catch {
        return false;
    }
}
/**
 * Allianz Callback Endpoint
 * Receives post-issuance callbacks from Allianz after policy submission.
 *
 * URL to provide Allianz:
 *   UAT: http://gentle-emerald-armadillo.103-10-78-80.cpanel.site/pj-insurance/api/callback
 */
router.post('/callback', async (req, res) => {
    try {
        console.log('[Allianz Callback] Incoming request:', {
            headers: {
                'content-type': req.headers['content-type'],
                'x-allianz-signature': req.headers['x-allianz-signature'] || 'not present',
                'x-signature': req.headers['x-signature'] || 'not present',
            },
            body: JSON.stringify(req.body, null, 2),
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });
        if (!verifyCallbackSignature(req)) {
            console.warn('[Allianz Callback] Signature verification failed', { ip: req.ip });
            res.status(401).json({ received: false, error: 'Unauthorized: invalid signature' });
            return;
        }
        const { contractNumber, policyNumber, status, policyPdf, vehicleLicenseId, customerEmail, customerName, } = req.body;
        console.log('[Allianz Callback] Processed:', {
            contractNumber,
            policyNumber,
            status,
            vehicleLicenseId,
            customerEmail,
            customerName,
            hasPdf: !!policyPdf,
            pdfLength: policyPdf ? policyPdf.length : 0,
        });
        if (status === 'SUCCESS' && policyNumber) {
            console.log(`[Allianz Callback] Policy issued: ${policyNumber} for contract ${contractNumber}`);
            // TODO: Store policy details, send email to customer if needed
        }
        else if (status === 'FAILED') {
            console.error(`[Allianz Callback] Policy issuance FAILED for contract ${contractNumber}`);
            // TODO: Alert, retry, or notify customer
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