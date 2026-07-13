import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';

const router = Router();

function verifyCallbackSignature(req: Request): boolean {
  const secret = process.env.CALLBACK_HMAC_SECRET;
  if (!secret) {
    console.warn('[Allianz Callback] CALLBACK_HMAC_SECRET not set — skipping verification in dev');
    return process.env.NODE_ENV !== 'production';
  }

  const signature = req.headers['x-allianz-signature'] as string | undefined;
  if (!signature) return false;

  const payload = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex'),
  );
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
router.post(
  '/callback',
  async (req: Request, res: Response) => {
    try {
      if (!verifyCallbackSignature(req)) {
        console.warn('[Allianz Callback] Invalid or missing signature', { ip: req.ip });
        res.status(401).json({ received: false, error: 'Unauthorized: invalid signature' });
        return;
      }

      const {
        contractNumber,
        policyNumber,
        status,
        policyPdf,
        vehicleLicenseId,
      } = req.body;

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
      } else if (status === 'FAILED') {
        console.error(`[Allianz Callback] Policy issuance failed for contract ${contractNumber}`);
      }

      res.status(200).json({ received: true, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('[Allianz Callback] Processing error:', err);
      res.status(500).json({ received: false, error: 'Internal processing error' });
    }
  },
);

export default router;
