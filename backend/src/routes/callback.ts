import { Router, type Request, type Response } from 'express';

const router = Router();

function verifyApiKey(req: Request): boolean {
  const expectedKey = process.env.CALLBACK_API_KEY;
  if (!expectedKey) {
    console.warn('[Allianz Callback] CALLBACK_API_KEY not set — accepting in non-production');
    return process.env.NODE_ENV !== 'production';
  }

  const providedKey =
    (req.headers['x-api-key'] as string) ||
    (req.headers['X-Api-Key'] as string);

  if (!providedKey) {
    console.warn('[Allianz Callback] No x-api-key header found. Headers:', Object.keys(req.headers).join(', '));
    return false;
  }

  return providedKey === expectedKey;
}

/**
 * Allianz Callback Endpoint
 * Receives post-issuance callbacks from Allianz after policy submission.
 * Authentication: x-api-key header (no HMAC — Allianz uses OAuth Bearer + x-api-key)
 *
 * URL to provide Allianz:
 *   UAT: http://gentle-emerald-armadillo.103-10-78-80.cpanel.site/pj-insurance/api/callback
 */
router.post(
  '/callback',
  async (req: Request, res: Response) => {
    try {
      console.log('[Allianz Callback] Incoming request:', {
        headers: {
          'content-type': req.headers['content-type'],
          'x-api-key': req.headers['x-api-key'] ? '***present***' : 'not present',
          'authorization': req.headers['authorization'] ? '***present***' : 'not present',
        },
        body: JSON.stringify(req.body, null, 2),
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      if (!verifyApiKey(req)) {
        console.warn('[Allianz Callback] Invalid or missing x-api-key', { ip: req.ip });
        res.status(401).json({ received: false, error: 'Unauthorized: invalid x-api-key' });
        return;
      }

      const {
        contractNumber,
        policyNumber,
        status,
        policyPdf,
        vehicleLicenseId,
        customerEmail,
        customerName,
      } = req.body;

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
      } else if (status === 'FAILED') {
        console.error(`[Allianz Callback] Policy issuance FAILED for contract ${contractNumber}`);
      }

      res.status(200).json({ received: true, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('[Allianz Callback] Processing error:', err);
      res.status(500).json({ received: false, error: 'Internal processing error' });
    }
  },
);

export default router;
