"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const allianz_api_1 = require("../services/allianz-api");
const router = (0, express_1.Router)();
router.post('/check-ubb', async (req, res, next) => {
    try {
        const body = req.body;
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
        const result = await allianz_api_1.allianzApi.checkUBB(body);
        console.log('[CheckUBB] Response:', JSON.stringify(result, null, 2));
        res.json(result);
    }
    catch (err) {
        const apiErr = err;
        console.error('[CheckUBB] Error:', JSON.stringify({
            status: apiErr?.status,
            response: apiErr?.response?.data,
            message: err?.message,
        }, null, 2));
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=ubb.js.map