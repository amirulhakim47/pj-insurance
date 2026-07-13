"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const allianz_api_1 = require("../services/allianz-api");
const router = (0, express_1.Router)();
const partnerId = () => process.env.ALLIANZ_PARTNER_ID ?? '';
router.post('/vehicle-details', async (req, res, next) => {
    try {
        const { plateNumber, identityNumber, identityType = 'NRIC', postalCode, } = req.body;
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
        const result = await allianz_api_1.allianzApi.getVehicleDetails({
            sourceSystem: partnerId(),
            vehicleLicenseId: plateNumber.toUpperCase().replace(/\s/g, ''),
            identityType,
            identityNumber: identityNumber.replace(/-/g, ''),
            checkUbbInd: 1,
            ...(postalCode ? { postalCode } : {}),
        });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post('/ncd-details', async (req, res, next) => {
    try {
        const { vehicleLicenseId, contractNumber, productCat = 'MT' } = req.body;
        if (!vehicleLicenseId || !contractNumber) {
            res.status(400).json({
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'vehicleLicenseId and contractNumber are required',
            });
            return;
        }
        const result = await allianz_api_1.allianzApi.getNcdDetails({
            partnerId: partnerId(),
            vehicleLicenseId,
            contractNumber,
            productCat,
        });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=vehicle.js.map