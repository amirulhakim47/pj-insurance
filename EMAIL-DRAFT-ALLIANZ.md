# Email Draft to Allianz

**To:** Nadiah Rahim  
**Subject:** Re: Integration Status Update — CheckUBB JSON & Callback URL

---

Hi Nadiah,

Thank you for the clarification. Here's our current status update:

### 1. CheckUBB (UBB Ind 2) — "Invalid Agent Code"

We've tested with **SourceSystem: "DCAUTO"** as confirmed, but the error persists:

- **Request:** SourceSystem set to `DCAUTO`, CheckUbbInd: 2
- **Response:** `{"Status": 500, "Error": "Invalid Agent Code"}`

Please find the **full request and response JSON** in the attached PDF document for your team's investigation.

Key observations:
- All other endpoints (vehicleDetails, generateQuote, updateQuote, submission) work correctly with the same Partner ID
- UBB Check 1 (via vehicleDetails with checkUbbInd:1) also works fine
- Only the standalone CheckUBB endpoint (Ind 2) returns this error

### 2. Callback URL (UAT)

Please configure the following callback URL on your end:

```
http://gentle-emerald-armadillo.103-10-78-80.cpanel.site/pj-insurance/api/callback
```

- **Method:** POST
- **Content-Type:** application/json
- **Response:** `{ "received": true, "timestamp": "..." }`

We will review the callback setup details on the dev portal as advised. Could you also confirm:
1. The HMAC secret/key for signature verification
2. The header name used for the HMAC signature

### 3. Production Setup

Noted — production configuration after sign-off. No action needed from us at this time.

---

Please let us know if you need any additional information for the CheckUBB investigation.

Best regards,  
Amirul

**Attachment:** UBB-CheckUBB-Report.pdf
