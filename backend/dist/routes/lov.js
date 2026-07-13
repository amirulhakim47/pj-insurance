"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const allianz_api_1 = require("../services/allianz-api");
const router = (0, express_1.Router)();
const POSTCODE_MAP = {
    '40000': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '40100': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '40150': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '40160': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '40170': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '40200': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '40300': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '40400': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '40450': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '40460': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '40470': { city: 'SHAH ALAM', state: 'SELANGOR' },
    '41000': { city: 'KLANG', state: 'SELANGOR' },
    '41050': { city: 'KLANG', state: 'SELANGOR' },
    '41100': { city: 'KLANG', state: 'SELANGOR' },
    '41150': { city: 'KLANG', state: 'SELANGOR' },
    '41200': { city: 'KLANG', state: 'SELANGOR' },
    '41250': { city: 'KLANG', state: 'SELANGOR' },
    '41300': { city: 'KLANG', state: 'SELANGOR' },
    '41400': { city: 'KLANG', state: 'SELANGOR' },
    '42000': { city: 'PORT KLANG', state: 'SELANGOR' },
    '42100': { city: 'KLANG', state: 'SELANGOR' },
    '42200': { city: 'KAPAR', state: 'SELANGOR' },
    '43000': { city: 'KAJANG', state: 'SELANGOR' },
    '43100': { city: 'HULU LANGAT', state: 'SELANGOR' },
    '43200': { city: 'CHERAS', state: 'SELANGOR' },
    '43300': { city: 'SERI KEMBANGAN', state: 'SELANGOR' },
    '43400': { city: 'SERDANG', state: 'SELANGOR' },
    '43500': { city: 'SEMENYIH', state: 'SELANGOR' },
    '43600': { city: 'BANGI', state: 'SELANGOR' },
    '43650': { city: 'BANDAR BARU BANGI', state: 'SELANGOR' },
    '43700': { city: 'BERANANG', state: 'SELANGOR' },
    '43800': { city: 'DENGKIL', state: 'SELANGOR' },
    '43900': { city: 'SEPANG', state: 'SELANGOR' },
    '44000': { city: 'KUALA KUBU BHARU', state: 'SELANGOR' },
    '45000': { city: 'KUALA SELANGOR', state: 'SELANGOR' },
    '46000': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '46050': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '46100': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '46150': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '46200': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '46300': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '46350': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '46400': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '47000': { city: 'SUNGAI BULOH', state: 'SELANGOR' },
    '47100': { city: 'PUCHONG', state: 'SELANGOR' },
    '47110': { city: 'PUCHONG', state: 'SELANGOR' },
    '47120': { city: 'PUCHONG', state: 'SELANGOR' },
    '47130': { city: 'PUCHONG', state: 'SELANGOR' },
    '47140': { city: 'PUCHONG', state: 'SELANGOR' },
    '47150': { city: 'PUCHONG', state: 'SELANGOR' },
    '47160': { city: 'PUCHONG', state: 'SELANGOR' },
    '47170': { city: 'PUCHONG', state: 'SELANGOR' },
    '47180': { city: 'PUCHONG', state: 'SELANGOR' },
    '47190': { city: 'PUCHONG', state: 'SELANGOR' },
    '47200': { city: 'PUCHONG', state: 'SELANGOR' },
    '47300': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '47301': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '47400': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '47500': { city: 'SUBANG JAYA', state: 'SELANGOR' },
    '47600': { city: 'SUBANG JAYA', state: 'SELANGOR' },
    '47610': { city: 'SUBANG JAYA', state: 'SELANGOR' },
    '47620': { city: 'SUBANG JAYA', state: 'SELANGOR' },
    '47630': { city: 'SUBANG JAYA', state: 'SELANGOR' },
    '47640': { city: 'SUBANG JAYA', state: 'SELANGOR' },
    '47650': { city: 'SUBANG JAYA', state: 'SELANGOR' },
    '47800': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '47810': { city: 'PETALING JAYA', state: 'SELANGOR' },
    '48000': { city: 'RAWANG', state: 'SELANGOR' },
    '48010': { city: 'RAWANG', state: 'SELANGOR' },
    '48020': { city: 'RAWANG', state: 'SELANGOR' },
    '48050': { city: 'BUKIT BERUNTUNG', state: 'SELANGOR' },
    '48100': { city: 'BATU CAVES', state: 'SELANGOR' },
    '48200': { city: 'SERENDAH', state: 'SELANGOR' },
    '48300': { city: 'RAWANG', state: 'SELANGOR' },
    '50000': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50050': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50088': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50100': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50150': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50200': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50250': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50300': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50350': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50400': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50450': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50460': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50470': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50480': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50490': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50500': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50550': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50580': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50590': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50600': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50603': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '50700': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '51000': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '51100': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '51200': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '52000': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '52100': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '52200': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '53000': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '53100': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '53200': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '53300': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '54000': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '54100': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '54200': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '55000': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '55100': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '55200': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '55300': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '56000': { city: 'CHERAS', state: 'W.P. KUALA LUMPUR' },
    '56100': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '57000': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '57100': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '57200': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '58000': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '58100': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '58200': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '59000': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '59100': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '59200': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '60000': { city: 'KUALA LUMPUR', state: 'W.P. KUALA LUMPUR' },
    '62000': { city: 'PUTRAJAYA', state: 'W.P. PUTRAJAYA' },
    '62100': { city: 'PUTRAJAYA', state: 'W.P. PUTRAJAYA' },
    '62150': { city: 'PUTRAJAYA', state: 'W.P. PUTRAJAYA' },
    '62200': { city: 'PUTRAJAYA', state: 'W.P. PUTRAJAYA' },
    '62250': { city: 'PUTRAJAYA', state: 'W.P. PUTRAJAYA' },
    '62300': { city: 'PUTRAJAYA', state: 'W.P. PUTRAJAYA' },
    '62502': { city: 'PUTRAJAYA', state: 'W.P. PUTRAJAYA' },
    '62505': { city: 'PUTRAJAYA', state: 'W.P. PUTRAJAYA' },
    '63000': { city: 'CYBERJAYA', state: 'SELANGOR' },
    '63100': { city: 'CYBERJAYA', state: 'SELANGOR' },
    '68000': { city: 'AMPANG', state: 'SELANGOR' },
    '68100': { city: 'BATU CAVES', state: 'SELANGOR' },
};
function lookupPostcode(postcode) {
    const entry = POSTCODE_MAP[postcode];
    if (entry)
        return { ...entry, valid: true };
    const prefix = postcode.substring(0, 2);
    const stateByPrefix = {
        '01': 'PERLIS', '02': 'PERLIS',
        '05': 'KEDAH', '06': 'KEDAH', '08': 'KEDAH', '09': 'KEDAH',
        '10': 'PULAU PINANG', '11': 'PULAU PINANG', '12': 'PULAU PINANG', '13': 'PULAU PINANG', '14': 'PULAU PINANG',
        '15': 'KELANTAN', '16': 'KELANTAN', '17': 'KELANTAN', '18': 'KELANTAN',
        '20': 'TERENGGANU', '21': 'TERENGGANU', '22': 'TERENGGANU', '23': 'TERENGGANU', '24': 'TERENGGANU',
        '25': 'PAHANG', '26': 'PAHANG', '27': 'PAHANG', '28': 'PAHANG',
        '30': 'PERAK', '31': 'PERAK', '32': 'PERAK', '33': 'PERAK', '34': 'PERAK', '35': 'PERAK', '36': 'PERAK',
        '40': 'SELANGOR', '41': 'SELANGOR', '42': 'SELANGOR', '43': 'SELANGOR', '44': 'SELANGOR', '45': 'SELANGOR',
        '46': 'SELANGOR', '47': 'SELANGOR', '48': 'SELANGOR',
        '50': 'W.P. KUALA LUMPUR', '51': 'W.P. KUALA LUMPUR', '52': 'W.P. KUALA LUMPUR', '53': 'W.P. KUALA LUMPUR',
        '54': 'W.P. KUALA LUMPUR', '55': 'W.P. KUALA LUMPUR', '56': 'W.P. KUALA LUMPUR', '57': 'W.P. KUALA LUMPUR',
        '58': 'W.P. KUALA LUMPUR', '59': 'W.P. KUALA LUMPUR', '60': 'W.P. KUALA LUMPUR',
        '62': 'W.P. PUTRAJAYA', '63': 'SELANGOR',
        '68': 'SELANGOR', '69': 'SELANGOR',
        '70': 'NEGERI SEMBILAN', '71': 'NEGERI SEMBILAN', '72': 'NEGERI SEMBILAN', '73': 'NEGERI SEMBILAN',
        '75': 'MELAKA', '76': 'MELAKA', '77': 'MELAKA', '78': 'MELAKA',
        '79': 'JOHOR', '80': 'JOHOR', '81': 'JOHOR', '82': 'JOHOR', '83': 'JOHOR', '84': 'JOHOR', '85': 'JOHOR', '86': 'JOHOR',
        '87': 'W.P. LABUAN',
        '88': 'SABAH', '89': 'SABAH', '90': 'SABAH', '91': 'SABAH',
        '93': 'SARAWAK', '94': 'SARAWAK', '95': 'SARAWAK', '96': 'SARAWAK', '97': 'SARAWAK', '98': 'SARAWAK',
    };
    const state = stateByPrefix[prefix];
    if (state)
        return { city: '', state, valid: true };
    return null;
}
router.get('/lov/:type', async (req, res, next) => {
    try {
        const lovType = req.params.type;
        const { makeCode, modelCode, makeYear, region, postcode } = req.query;
        let result;
        switch (lovType) {
            case 'postcode': {
                if (!postcode || !/^\d{5}$/.test(postcode)) {
                    res.status(400).json({
                        status: 400,
                        code: 'VALIDATION_ERROR',
                        message: 'A valid 5-digit postcode query parameter is required',
                    });
                    return;
                }
                const lookup = lookupPostcode(postcode);
                if (lookup) {
                    res.json(lookup);
                }
                else {
                    res.json({ city: '', state: '', valid: false });
                }
                return;
            }
            case 'allianzMake':
                result = await allianz_api_1.allianzApi.getAllianzMakeList(makeCode);
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
                result = await allianz_api_1.allianzApi.getAllianzModelList(makeCode, modelCode);
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
                result = await allianz_api_1.allianzApi.getAllianzVariantList(makeCode, modelCode);
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
                result = await allianz_api_1.allianzApi.getAVMakeList(region, makeCode);
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
                result = await allianz_api_1.allianzApi.getAVModelList(region, makeCode, modelCode);
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
                result = await allianz_api_1.allianzApi.getAVVariantList(region, makeCode, modelCode, makeYear);
                break;
            default:
                res.status(404).json({
                    status: 404,
                    code: 'NOT_FOUND',
                    message: `Unknown LOV type: ${lovType}. Valid types: allianzMake, allianzModel, allianzVariant, avMake, avModel, avVariant, postcode`,
                });
                return;
        }
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=lov.js.map