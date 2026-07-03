import { Router, type Request, type Response, type NextFunction } from 'express';
import { allianzApi } from '../services/allianz-api';
import type { Region } from '../types/allianz';

const router = Router();

type LovType =
  | 'allianzMake'
  | 'allianzModel'
  | 'allianzVariant'
  | 'avMake'
  | 'avModel'
  | 'avVariant';

router.get(
  '/lov/:type',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lovType = req.params.type as LovType;
      const { makeCode, modelCode, makeYear, region } = req.query as {
        makeCode?: string;
        modelCode?: string;
        makeYear?: string;
        region?: Region;
      };

      let result: unknown;

      switch (lovType) {
        case 'allianzMake':
          result = await allianzApi.getAllianzMakeList(makeCode);
          break;

        case 'allianzModel':
          if (!makeCode) {
            res.status(400).json({
              status: 400,
              code: 'VALIDATION_ERROR',
              message: 'makeCode query parameter is required',
            });
            return;
          }
          result = await allianzApi.getAllianzModelList(makeCode, modelCode);
          break;

        case 'allianzVariant':
          if (!makeCode) {
            res.status(400).json({
              status: 400,
              code: 'VALIDATION_ERROR',
              message: 'makeCode query parameter is required',
            });
            return;
          }
          result = await allianzApi.getAllianzVariantList(makeCode, modelCode);
          break;

        case 'avMake':
          if (!region) {
            res.status(400).json({
              status: 400,
              code: 'VALIDATION_ERROR',
              message: 'region query parameter is required (E or W)',
            });
            return;
          }
          result = await allianzApi.getAVMakeList(region, makeCode);
          break;

        case 'avModel':
          if (!region || !makeCode) {
            res.status(400).json({
              status: 400,
              code: 'VALIDATION_ERROR',
              message: 'region and makeCode query parameters are required',
            });
            return;
          }
          result = await allianzApi.getAVModelList(region, makeCode, modelCode);
          break;

        case 'avVariant':
          if (!region || !makeCode) {
            res.status(400).json({
              status: 400,
              code: 'VALIDATION_ERROR',
              message: 'region and makeCode query parameters are required',
            });
            return;
          }
          result = await allianzApi.getAVVariantList(
            region,
            makeCode,
            modelCode,
            makeYear,
          );
          break;

        default:
          res.status(404).json({
            status: 404,
            code: 'NOT_FOUND',
            message: `Unknown LOV type: ${lovType}. Valid types: allianzMake, allianzModel, allianzVariant, avMake, avModel, avVariant`,
          });
          return;
      }

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
