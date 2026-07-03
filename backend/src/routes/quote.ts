import { Router, type Request, type Response, type NextFunction } from 'express';
import { allianzApi } from '../services/allianz-api';
import type {
  GetPlanRecommendationRequest,
  UpdatePlanRecommendationRequest,
} from '../types/allianz';

const router = Router();
const partnerId = () => process.env.ALLIANZ_PARTNER_ID ?? '';

router.post(
  '/quote',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as GetPlanRecommendationRequest;

      if (!body.person || !body.vehicle) {
        res.status(400).json({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'person and vehicle objects are required',
        });
        return;
      }

      body.partnerId = body.partnerId || partnerId();
      body.transactionType = body.transactionType || 'NWOO';

      const result = await allianzApi.generateQuote(body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/quote',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as UpdatePlanRecommendationRequest;

      if (!body.contractNumber) {
        res.status(400).json({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'contractNumber is required',
        });
        return;
      }

      body.partnerId = body.partnerId || partnerId();
      body.transactionType = body.transactionType || 'NWOO';

      const result = await allianzApi.updateQuote(body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
