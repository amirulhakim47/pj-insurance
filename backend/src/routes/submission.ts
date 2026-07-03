import { Router, type Request, type Response, type NextFunction } from 'express';
import { allianzApi } from '../services/allianz-api';
import type { SubmitTransactionRequest } from '../types/allianz';

const router = Router();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.post(
  '/submission',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as SubmitTransactionRequest;

      if (!body.contract?.contractNumber || !body.person || !body.payment) {
        res.status(400).json({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'contract, person, and payment objects are required',
        });
        return;
      }

      let lastError: unknown = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const result = await allianzApi.submitTransaction(body);
          res.json(result);
          return;
        } catch (err: unknown) {
          lastError = err;
          const errObj = err as { response?: { status?: number } };

          if (errObj?.response?.status === 500 && attempt < MAX_RETRIES) {
            console.log(
              `[Submission] Attempt ${attempt} failed with 500, retrying in ${RETRY_DELAY_MS}ms...`,
            );
            await delay(RETRY_DELAY_MS * attempt);
          } else {
            break;
          }
        }
      }

      throw lastError;
    } catch (err) {
      next(err);
    }
  },
);

export default router;
