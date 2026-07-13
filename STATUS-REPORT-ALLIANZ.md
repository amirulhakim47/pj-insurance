# Hallu × Allianz Motor Insurance — Integration Status Report

**Date:** 13 July 2026
**Prepared by:** Hallu Development Team
**Project:** Motor Insurance Online Renewal Platform

---

## Executive Summary

The end-to-end motor insurance renewal flow has been implemented and tested against the **Allianz UAT environment**. The core flow — from vehicle lookup through quotation, customer details, payment (SenangPay sandbox), and Allianz policy submission — is **functional and verified with real customer data**.

Three items require Allianz's attention before production readiness.

---

## 1. Current Flow Status


| Step | Feature                          | Status                 | Notes                                                                                                                                                                                                                |
| ---- | -------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Landing Page & Quote Form        | **Complete**           | NRIC, plate number, postcode, contact info, PDPA consent                                                                                                                                                             |
| 2    | Vehicle Lookup (+ UBB Check 1)   | **Complete**           | Calls `/vehicleDetails` with `checkUbbInd: 1`. Returns vehicle info, NVIC list, NCD, ISM data. Blocks referral cases with user-friendly messages.                                                                    |
| 3    | Variant Selection (MV / AV)      | **Complete**           | Market Value via NVIC list, Agreed Value via `/lov/avVariant`. Reconditioned vehicle handling included.                                                                                                              |
| 4    | Quotation                        | **Complete**           | Calls `/quote` (POST) for initial quote. Returns premium breakdown with all available add-on covers.                                                                                                                 |
| 5    | Add-on Selection & Quote Update  | **Complete**           | Calls `/quote` (PUT) on each toggle. Supports all returned add-on covers, windscreen sum insured input, CART day/amount, ERW plan selection, driver plans (named/unlimited).                                         |
| 6    | UBB Check 2 (Pre-Quote)          | **Blocked**            | See Issue #1 below                                                                                                                                                                                                   |
| 7    | Customer Details                 | **Complete**           | Policyholder info, contact, full address. NRIC auto-derives DOB, gender, nationality. Additional driver forms for named driver plans.                                                                                |
| 8    | Payment (SenangPay)              | **Complete (Sandbox)** | HMAC-SHA256 hash generated server-side. Form POST to SenangPay sandbox. Hash verification on return.                                                                                                                 |
| 9    | Policy Submission to Allianz     | **Complete**           | Calls `/submission` after successful payment. Includes person, vehicle, driver, and payment details. Retry logic (3× with exponential backoff) on HTTP 500. **Tested successfully — returns** `"status": "Success"`. |
| 10   | Allianz Callback (Post-Issuance) | **Pending**            | See Issue #2 below                                                                                                                                                                                                   |
| 11   | Thank-You / Confirmation         | **Complete (UI)**      | Policy summary, free-look period info, refund policy, contact details. Download buttons currently generate placeholder text files.                                                                                   |


---



## 2. Items Requiring Allianz Input



### Issue #1: UBB Check 2 — "Invalid Agent Code"

**Endpoint:** `POST /v1/openapi/mci/checkUBB`

**What happens:** When calling CheckUBB with `CheckUbbInd: 2` (the pre-quotation risk screening), the API returns:

```
{ "Status": 500, "Error": "Invalid Agent Code" }
```

**What we tested:**

- `SourceSystem` set to our assigned Partner ID
- `SourceSystem` set to `"PTR"`
- Both return the same error

**Why it matters:** UBB Check 2 performs deeper underwriting validation before allowing a quote (e.g., reconditioned vehicle screening, high-risk combinations). Without it, certain edge cases bypass risk screening.

**Current workaround:** The flow continues without Check 2. UBB Check 1 (embedded in the vehicle lookup) still catches major blocks (stolen vehicles, blacklisted NRICs, lapsed policies).

**What we need from Allianz:**

- [ ] Confirm whether our Partner ID is enabled for the `/checkUBB` endpoint in UAT
- [ ] Advise the correct `SourceSystem` value to use for CheckUBB
- [ ] If a separate agent code is required, please provide it

---



### Issue #2: Allianz Post-Issuance Callback

**Endpoint:** `POST /api/callback` (our receiving endpoint)

**What we've built:** Our backend is ready to receive Allianz callbacks after policy issuance. It supports:

- HMAC-SHA256 signature verification via `x-allianz-signature` header
- Extraction of `contractNumber`, `policyNumber`, `status`, `policyPdf`, `vehicleLicenseId`

**What's pending:** We need clarification on the callback delivery model before we can complete this:


| Delivery Model | Policy PDF                 | Policy Email                     | Our Action Required       |
| -------------- | -------------------------- | -------------------------------- | ------------------------- |
| Model A        | Not sent to us             | Allianz emails customer directly | Store policy number only  |
| Model B        | Sent as base64 in callback | Allianz emails customer          | Store PDF + policy number |
| Model C        | Sent as base64 in callback | We email customer                | Store PDF + send email    |


**What we need from Allianz:**

- [ ] Which callback delivery model applies to our partner integration?
- [ ] Provide the callback HMAC secret key for signature verification
- [ ] Confirm the callback payload structure (field names and format)
- [ ] Provide the callback URL registration process (where do we register our endpoint?)

---



### Issue #3: Production Readiness Checklist

Before going live, we need the following from Allianz:


| Item                              | Purpose                                               | Status                                                             |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| Production API base URL           | Switch from UAT to live                               | **Pending** — currently using `asia-uat-malaysia.apis.allianz.com` |
| Production OAuth credentials      | Consumer Key + Consumer Secret for production         | **Pending**                                                        |
| Production Partner ID             | May differ from UAT partner ID                        | **Pending — confirm if same as UAT**                               |
| CheckUBB agent code / enablement  | Resolve Issue #1 for production                       | **Pending**                                                        |
| Callback HMAC secret              | Verify webhook authenticity                           | **Pending**                                                        |
| Callback registration             | Register our callback endpoint URL with Allianz       | **Pending**                                                        |
| Confirm postcode LOV availability | `/lov/postcode` endpoint — does Allianz provide this? | **Pending** — currently using local lookup table                   |


---



## 3. Verified API Endpoints (Working in UAT)

The following Allianz MCI Open API endpoints have been tested and confirmed working:


| Endpoint                         | Method | Purpose                             | Tested With Real Data    |
| -------------------------------- | ------ | ----------------------------------- | ------------------------ |
| `/v1/oauth/accesstoken`          | POST   | OAuth token (client credentials)    | Yes                      |
| `/v1/openapi/mci/vehicleDetails` | POST   | Vehicle lookup + UBB Check 1        | Yes                      |
| `/v1/openapi/mci/quote`          | POST   | Generate quotation                  | Yes                      |
| `/v1/openapi/mci/quote`          | PUT    | Update quotation (add-ons, drivers) | Yes                      |
| `/v1/openapi/mci/submission`     | POST   | Submit policy after payment         | Yes                      |
| `/v1/openapi/mci/lov/avVariant`  | GET    | Agreed Value variant list           | Yes                      |
| `/v1/openapi/mci/checkUBB`       | POST   | UBB risk screening (Check 2)        | **Fails — see Issue #1** |


---



## 4. Payment Gateway (SenangPay)


| Item                          | Status                                                            |
| ----------------------------- | ----------------------------------------------------------------- |
| Hash generation (HMAC-SHA256) | Complete — server-side, secret key not exposed to browser         |
| Hash verification on return   | Complete                                                          |
| Sandbox integration           | Tested and working                                                |
| Production switch             | Pending — requires production merchant credentials and URL change |
| Return URL configuration      | Must be set in SenangPay merchant dashboard (not sent in form)    |


---



## 5. What's Not In Scope (Current Phase)


| Feature                         | Status                    | Notes                                                                              |
| ------------------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| Motorcycle insurance            | Not active                | UI option exists but API flow is car-only                                          |
| Multi-insurer comparison        | Removed                   | Previous design; now Allianz-only                                                  |
| Real-time policy PDF download   | Depends on callback model | Currently placeholder text files; real PDF delivery depends on Issue #2 resolution |
| Email notifications to customer | Depends on callback model | If Model C, we build it; if Model A/B, Allianz handles it                          |


---



## 6. Test Data Used for Verification

All testing was performed against the **Allianz UAT environment** using real customer data (with customer consent):


| Field                                      | Value                 |
| ------------------------------------------ | --------------------- |
| Vehicle                                    | PROTON S70 (2024)     |
| Engine                                     | 1477 CC               |
| NCD                                        | 55%                   |
| Cover Type                                 | Comprehensive         |
| Base Premium (MV)                          | RM 1,401.40           |
| With add-ons (windscreen + special perils) | RM 1,666.00           |
| Submission result                          | `"status": "Success"` |


---



## 7. Next Steps

1. **Allianz to resolve** CheckUBB agent code issue (Issue #1)
2. **Allianz to confirm** callback delivery model and provide HMAC secret (Issue #2)
3. **Allianz to provide** production credentials when ready (Issue #3)
4. **Hallu team** to implement callback processing once model is confirmed
5. **Hallu team** to switch SenangPay to production once merchant is verified
6. **Hallu team** to perform production smoke test once all credentials are provided

---

*This document was prepared for the Allianz partnership meeting. For technical questions, please contact the Hallu development team.*