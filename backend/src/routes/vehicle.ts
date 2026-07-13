import { Router, type Request, type Response, type NextFunction } from 'express';
import { allianzApi } from '../services/allianz-api';
import type { IdentityType } from '../types/allianz';

const router = Router();
const partnerId = () => process.env.ALLIANZ_PARTNER_ID ?? '';

router.post(
  '/vehicle-details',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        plateNumber,
        identityNumber,
        identityType = 'NRIC',
        postalCode,
      } = req.body as {
        plateNumber: string;
        identityNumber: string;
        identityType?: IdentityType;
        postalCode?: string;
      };

      if (!plateNumber || !identityNumber) {
        res.status(400).json({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'plateNumber and identityNumber are required',
        });
        return;
      }

      if (typeof plateNumber !== 'string' || typeof identityNumber !== 'string') {
        res.status(400).json({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'plateNumber and identityNumber must be strings',
        });
        return;
      }

      if (!/^[A-Za-z0-9\s]{1,20}$/.test(plateNumber)) {
        res.status(400).json({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Invalid plate number format',
        });
        return;
      }

      const result = await allianzApi.getVehicleDetails({
        sourceSystem: partnerId(),
        vehicleLicenseId: plateNumber.toUpperCase().replace(/\s/g, ''),
        identityType,
        identityNumber: identityNumber.replace(/-/g, ''),
        checkUbbInd: 1,
        ...(postalCode ? { postalCode } : {}),
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/ncd-details',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { vehicleLicenseId, contractNumber, productCat = 'MT' } =
        req.body as {
          vehicleLicenseId: string;
          contractNumber: string;
          productCat?: string;
        };

      if (!vehicleLicenseId || !contractNumber) {
        res.status(400).json({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'vehicleLicenseId and contractNumber are required',
        });
        return;
      }

      const result = await allianzApi.getNcdDetails({
        partnerId: partnerId(),
        vehicleLicenseId,
        contractNumber,
        productCat,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
