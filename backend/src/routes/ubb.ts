import { Router, type Request, type Response, type NextFunction } from 'express';
import { allianzApi } from '../services/allianz-api';
import type { CheckUBBRequest } from '../types/allianz';

const router = Router();

router.post(
  '/check-ubb',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as CheckUBBRequest;

      if (!body.ReferenceNo || !body.Policy) {
        res.status(400).json({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'ReferenceNo and Policy are required',
        });
        return;
      }

      body.SourceSystem = process.env.ALLIANZ_PARTNER_ID ?? 'DCAUTO';
      body.CheckUbbInd = 2;

      console.log('[CheckUBB] Request payload:', JSON.stringify(body, null, 2));

      const result = await allianzApi.checkUBB(body);

      console.log('[CheckUBB] Response:', JSON.stringify(result, null, 2));

      res.json(result);
    } catch (err: unknown) {
      const apiErr = err as { status?: number; response?: { data?: unknown } };
      console.error('[CheckUBB] Error:', JSON.stringify({
        status: apiErr?.status,
        response: apiErr?.response?.data,
        message: (err as Error)?.message,
      }, null, 2));
      next(err);
    }
  },
);

export default router;
