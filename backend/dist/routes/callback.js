"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const ALLOWED_IPS = (process.env.CALLBACK_ALLOWED_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
function verifyApiKey(req) {
    const expectedKey = process.env.CALLBACK_API_KEY;
    if (!expectedKey) {
        console.warn('[Allianz Callback] CALLBACK_API_KEY not set — accepting in non-production');
        return process.env.NODE_ENV !== 'production';
    }
    const providedKey = req.headers['x-api-key'] ||
        req.headers['X-Api-Key'];
    if (!providedKey) {
        console.warn('[Allianz Callback] No x-api-key header found. Headers:', Object.keys(req.headers).join(', '));
        return false;
    }
    return providedKey === expectedKey;
}
function verifySourceIP(req) {
    if (ALLOWED_IPS.length === 0)
        return true;
    const clientIP = req.ip || req.socket.remoteAddress || '';
    const forwarded = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const sourceIP = forwarded || clientIP;
    return ALLOWED_IPS.some((allowed) => sourceIP.includes(allowed));
}
/**
 * Allianz Callback Endpoint
 * Authentication: x-api-key header + optional IP whitelist
 *
 * Security layers:
 *   1. x-api-key validation (required)
 *   2. IP whitelist (if CALLBACK_ALLOWED_IPS is set)
 *   3. Payload validation (contractNumber must be present)
 *   4. Full request logging for audit trail
 */
router.post('/callback', async (req, res) => {
    try {
        const clientIP = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        console.log('[Allianz Callback] Incoming request:', {
            ip: clientIP,
            headers: {
                'content-type': req.headers['content-type'],
                'x-api-key': req.headers['x-api-key'] ? '***present***' : 'not present',
                'authorization': req.headers['authorization'] ? '***present***' : 'not present',
            },
            timestamp: new Date().toISOString(),
        });
        if (!verifySourceIP(req)) {
            console.warn('[Allianz Callback] BLOCKED — IP not in whitelist:', clientIP);
            res.status(403).json({ received: false, error: 'Forbidden' });
            return;
        }
        if (!verifyApiKey(req)) {
            console.warn('[Allianz Callback] BLOCKED — Invalid x-api-key from:', clientIP);
            res.status(401).json({ received: false, error: 'Unauthorized' });
            return;
        }
        const { contractNumber, policyNumber, status, policyPdf, vehicleLicenseId } = req.body;
        if (!contractNumber) {
            console.warn('[Allianz Callback] REJECTED — Missing contractNumber');
            res.status(400).json({ received: false, error: 'contractNumber is required' });
            return;
        }
        console.log('[Allianz Callback] ACCEPTED:', {
            contractNumber,
            policyNumber,
            status,
            vehicleLicenseId,
            hasPdf: !!policyPdf,
            pdfLength: policyPdf ? policyPdf.length : 0,
        });
        if (status === 'SUCCESS' && policyNumber) {
            console.log(`[Allianz Callback] Policy issued: ${policyNumber} for contract ${contractNumber}`);
        }
        else if (status === 'FAILED') {
            console.error(`[Allianz Callback] Policy issuance FAILED for contract ${contractNumber}`);
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