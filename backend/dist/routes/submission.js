"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const allianz_api_1 = require("../services/allianz-api");
const router = (0, express_1.Router)();
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
router.post('/submission', async (req, res, next) => {
    try {
        const body = req.body;
        if (!body.contract?.contractNumber || !body.person || !body.payment) {
            res.status(400).json({
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'contract, person, and payment objects are required',
            });
            return;
        }
        let lastError = null;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const result = await allianz_api_1.allianzApi.submitTransaction(body);
                res.json(result);
                return;
            }
            catch (err) {
                lastError = err;
                const errObj = err;
                if (errObj?.response?.status === 500 && attempt < MAX_RETRIES) {
                    console.log(`[Submission] Attempt ${attempt} failed with 500, retrying in ${RETRY_DELAY_MS}ms...`);
                    await delay(RETRY_DELAY_MS * attempt);
                }
                else {
                    break;
                }
            }
        }
        throw lastError;
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=submission.js.map