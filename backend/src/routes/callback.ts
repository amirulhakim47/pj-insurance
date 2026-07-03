import { Router, type Request, type Response } from 'express';

const router = Router();

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
        timestamp: new Date().toISOString(),
      });

      // Store callback data (in production, persist to DB)
      // For now, log and acknowledge
      if (status === 'SUCCESS' && policyNumber) {
        console.log(`[Allianz Callback] Policy issued: ${policyNumber} for contract ${contractNumber}`);
      } else if (status === 'FAILED') {
        console.error(`[Allianz Callback] Policy issuance failed for contract ${contractNumber}`);
        // In production: trigger alert email to agic.digital@allianz.com.my
      }

      res.status(200).json({ received: true, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('[Allianz Callback] Processing error:', err);
      res.status(500).json({ received: false, error: 'Internal processing error' });
    }
  },
);

export default router;
