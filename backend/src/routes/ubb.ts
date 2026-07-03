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

      body.SourceSystem =
        body.SourceSystem || (process.env.ALLIANZ_PARTNER_ID ?? '');
      body.CheckUbbInd = 2;

      const result = await allianzApi.checkUBB(body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
