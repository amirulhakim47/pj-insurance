"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const allianz_api_1 = require("../services/allianz-api");
const router = (0, express_1.Router)();
const partnerId = () => process.env.ALLIANZ_PARTNER_ID ?? '';
router.post('/quote', async (req, res, next) => {
    try {
        const body = req.body;
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
        const result = await allianz_api_1.allianzApi.generateQuote(body);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.put('/quote', async (req, res, next) => {
    try {
        const body = req.body;
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
        const result = await allianz_api_1.allianzApi.updateQuote(body);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=quote.js.map