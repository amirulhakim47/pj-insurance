#!/usr/bin/env python3
"""Fill in Column M (Justification) of the Allianz ISRA spreadsheet."""

import openpyxl
import shutil
import os

INPUT_PATH = '/Users/amirulhakim/Downloads/IS Risk Assessment_DC Auto.xlsx'
OUTPUT_PATH = '/Users/amirulhakim/pj-insrnce/docs/IS Risk Assessment_DC Auto_FILLED.xlsx'

# Column M responses keyed by row number
# Based on actual system architecture: Next.js 15 frontend, Express backend,
# Allianz MCI API integration, SenangPay payment, Vercel/cPanel hosting
RESPONSES = {
    13: (
        "The HALLU platform does not store Allianz customer data persistently. "
        "Customer data (name, NRIC, vehicle details) is held temporarily in browser sessionStorage during the quotation flow "
        "and is cleared upon completion or session end. All persistent customer and policy data resides within Allianz systems. "
        "The only data transmitted is via HTTPS API calls to Allianz MCI endpoints during the active session."
    ),
    14: (
        "The HALLU frontend is deployed on Vercel (PaaS — serverless edge functions, globally distributed CDN). "
        "The backend API proxy runs on a Node.js server (IaaS — shared hosting with PM2 process manager). "
        "Deployment model: PaaS (Vercel) for static frontend + IaaS (cPanel/Node.js) for API backend. "
        "No SaaS components are used. The platform is a custom-built Next.js 15 application with Express.js backend."
    ),
    16: (
        "Frontend (Vercel): Hosted on Vercel's global edge network. Vercel's infrastructure is on AWS, "
        "with primary servers in the US (us-east-1) and edge nodes distributed globally including Singapore (ap-southeast-1). "
        "Backend API: Hosted on shared hosting server located in Malaysia (Shinjiru/Exabytes data center, Cyberjaya, Selangor). "
        "No separate DR environment is currently provisioned as this is classified as a non-critical 3rd party sales channel."
    ),
    21: (
        "DC Auto maintains an internal access control policy for the HALLU platform:\n"
        "1. API credentials (Allianz OAuth keys, SenangPay secrets) are stored as environment variables accessible only to the server runtime — never exposed to client-side code.\n"
        "2. Source code repository access is restricted to authorized developers via GitHub with branch protection rules.\n"
        "3. Hosting platform (Vercel) access is limited to the project owner with SSO authentication.\n"
        "4. No customer-facing admin panel exists — all insurance operations flow through Allianz APIs with Allianz-controlled access."
    ),
    22: (
        "User registration and de-registration for the HALLU platform:\n"
        "1. Registration: New developer access is granted by the project owner (CTO) upon formal request. Access to GitHub repository, Vercel dashboard, and hosting control panel requires approval from CTO.\n"
        "2. De-registration: Upon staff departure, access is revoked within 24 hours across all platforms (GitHub, Vercel, hosting cPanel, environment variable access).\n"
        "3. Allianz API credentials: Managed by Allianz — DC Auto receives OAuth consumer key/secret which are rotated upon Allianz's schedule.\n"
        "4. No end-customer registration system exists — the platform is a public-facing insurance quotation tool with no user accounts."
    ),
    23: (
        "Privileged access controls for the HALLU platform:\n"
        "1. Server access (cPanel/SSH): Restricted to CTO only, secured with SSH key authentication.\n"
        "2. Vercel deployment: Protected by Vercel's SSO with email-based authentication.\n"
        "3. GitHub repository: Branch protection on main branch — requires pull request review before merge. Direct push to production branch is disabled.\n"
        "4. Environment variables (API keys): Only accessible via hosting control panel (CTO access) or Vercel dashboard. Cannot be read from the application at runtime by non-server code.\n"
        "5. No database admin access exists as the platform does not maintain its own database."
    ),
    24: (
        "Access rights are reviewed by the project owner (CTO) on a quarterly basis. "
        "Given the small team size (2-3 developers), the review involves:\n"
        "1. GitHub repository collaborator list — verify all members are active staff.\n"
        "2. Vercel team members — confirm access is current.\n"
        "3. Hosting cPanel access — verify only authorized personnel have credentials.\n"
        "4. API credential rotation — coordinated with Allianz per their schedule.\n"
        "Any discrepancies are resolved immediately upon discovery."
    ),
    25: (
        "Access removal process:\n"
        "1. Upon resignation/termination notification from HR, CTO initiates access revocation within 24 hours.\n"
        "2. Checklist: (a) Remove from GitHub organization, (b) Remove from Vercel team, (c) Revoke cPanel/SSH access, (d) Rotate any shared credentials the departing staff had access to.\n"
        "3. Allianz API credentials: If a key rotation is warranted, DC Auto requests new credentials from Allianz.\n"
        "4. Confirmation of complete access removal is documented via email to management."
    ),
    27: (
        "Information access is restricted as follows:\n"
        "1. Allianz API access: Controlled via OAuth2 client credentials (consumer key + secret). Only the backend server can authenticate — credentials are never exposed to the browser.\n"
        "2. Application source code: Restricted to authorized developers via GitHub private repository.\n"
        "3. Production environment variables: Accessible only via Vercel dashboard (project owner) or hosting cPanel (CTO).\n"
        "4. Customer data: Temporarily held in browser sessionStorage (client-side isolation per browser tab). No server-side persistent storage of customer PII.\n"
        "5. SenangPay merchant credentials: Server-side only, used for HMAC hash generation."
    ),
    28: (
        "Secure log-on procedures for system administration:\n"
        "1. GitHub: Email + password with mandatory 2FA (TOTP or security key). Session timeout after inactivity.\n"
        "2. Vercel: SSO via GitHub OAuth or email magic link. No password-only access.\n"
        "3. Hosting cPanel: Username + strong password (min 12 chars, complexity required). IP-restricted access.\n"
        "4. SSH access: Key-based authentication only (no password auth). RSA 4096-bit minimum.\n"
        "5. Error messages on login failure are generic ('Invalid credentials') — do not reveal whether username or password is incorrect.\n"
        "6. No customer-facing login system exists — the platform is a public quotation tool."
    ),
    29: (
        "Password management:\n"
        "1. Developer access (GitHub, Vercel): Minimum 12 characters, complexity enforced by platform. 2FA mandatory.\n"
        "2. Hosting cPanel: Minimum 12 characters with uppercase, lowercase, numbers, and special characters. Account lockout after 5 failed attempts.\n"
        "3. SSH: Key-based only — no passwords used for server access.\n"
        "4. API credentials (Allianz OAuth, SenangPay): Machine-generated secrets stored as environment variables. Not human-memorized passwords.\n"
        "5. No customer passwords exist — the platform does not have user accounts or login functionality.\n"
        "6. Allianz manages their own credential rotation schedule; DC Auto complies with credential updates as issued."
    ),
    30: (
        "Privileged utility programs:\n"
        "1. Server administration scripts (deployment, process management) are stored in the Git repository under version control.\n"
        "2. PM2 process manager access is restricted to CTO via SSH.\n"
        "3. No database management tools exist as the platform has no database.\n"
        "4. Deployment scripts (deploy.sh) require SSH access to execute — restricted to CTO.\n"
        "5. npm/node package management is controlled via package-lock.json (pinned versions). Only authorized developers can modify dependencies.\n"
        "6. No diagnostic tools are exposed to the public internet."
    ),
    38: (
        "Change management process:\n"
        "1. All code changes are made via Git feature branches.\n"
        "2. Pull requests require review and approval before merge to main branch.\n"
        "3. Vercel automatically deploys preview environments for each PR for testing.\n"
        "4. Production deployment occurs only after PR approval and merge to main.\n"
        "5. Rollback capability: Vercel supports instant rollback to any previous deployment.\n"
        "6. Environment variable changes require CTO approval and are logged by the hosting platform.\n"
        "7. API integration changes are tested against Allianz UAT environment before production."
    ),
    39: (
        "Capacity management:\n"
        "1. Frontend (Vercel): Auto-scaling serverless architecture — scales automatically with traffic. Vercel provides built-in analytics for traffic monitoring.\n"
        "2. Backend (Node.js/PM2): PM2 cluster mode enables horizontal scaling. Server resource utilization is monitored via hosting control panel.\n"
        "3. Allianz API: Rate-limited by Allianz per their API gateway policies. Our backend implements rate limiting (express-rate-limit) to prevent overloading Allianz endpoints.\n"
        "4. Current capacity is adequate for projected transaction volumes as a new digital channel.\n"
        "5. Capacity is reviewed monthly via Vercel analytics and hosting resource reports."
    ),
    40: (
        "Three segregated environments:\n"
        "1. Development: Local developer machines running Next.js dev server (localhost:3000). Uses Allianz UAT credentials.\n"
        "2. Testing/UAT: Vercel preview deployments (auto-generated URLs per branch). Connected to Allianz UAT API and SenangPay sandbox.\n"
        "3. Production: Vercel production deployment (hallu.com.my). Will use Allianz production API and SenangPay production credentials.\n\n"
        "Isolation: Each environment uses separate environment variables. No transitive routing between environments. "
        "Production API credentials are not accessible from development/UAT environments."
    ),
    41: (
        "Controls against malware:\n"
        "1. Dependency scanning: npm audit run regularly to detect vulnerable packages. Dependabot alerts enabled on GitHub.\n"
        "2. No file uploads: The platform does not accept file uploads from users, eliminating a common malware vector.\n"
        "3. Input validation: All user inputs are validated via Zod schemas — prevents injection of malicious payloads.\n"
        "4. Content Security Policy: Helmet middleware sets restrictive HTTP headers preventing XSS and code injection.\n"
        "5. Vercel platform: Built-in malware scanning on deployments.\n"
        "6. Developer machines: Endpoint protection (macOS built-in + additional AV) on all development workstations."
    ),
    42: (
        "Information backup:\n"
        "1. Source code: Fully version-controlled in Git (GitHub). Complete history maintained. Repository is backed up by GitHub's infrastructure.\n"
        "2. Configuration: Environment variables are documented and can be restored from secure records.\n"
        "3. Customer data: No persistent customer data is stored on our servers — all customer/policy data resides in Allianz systems.\n"
        "4. Static assets: Frontend builds are stored as Vercel deployments (immutable, versioned). Any previous version can be restored instantly.\n"
        "5. Backup frequency: Git commits serve as continuous backup. GitHub provides 99.9% uptime SLA.\n"
        "6. No database backup required as no database exists on our side."
    ),
    43: (
        "Event logging:\n"
        "1. Application logs: All API calls to Allianz are logged with timestamps, request/response status codes, and error details via console.log (captured by PM2/Vercel).\n"
        "2. PM2 logs: Process manager maintains stdout/stderr logs with rotation (retained for 30 days).\n"
        "3. Vercel logs: Serverless function execution logs retained per Vercel's platform policy.\n"
        "4. Access logs: Web server access logs (IP, timestamp, endpoint, status) maintained by hosting provider.\n"
        "5. Logs are append-only at the application level — developers cannot edit production logs directly.\n"
        "6. Log review: Logs are reviewed upon incident or anomaly detection. Periodic review planned for production phase."
    ),
    45: (
        "Cryptographic controls:\n"
        "1. Data in transit: All communications use TLS 1.2+ (HTTPS enforced). Vercel provides automatic SSL certificates (Let's Encrypt).\n"
        "2. API authentication: OAuth2 with client credentials grant. Tokens are short-lived (3600 seconds).\n"
        "3. Payment security: SenangPay integration uses HMAC-SHA256 for transaction hash generation and verification. Secret key stored server-side only.\n"
        "4. Allianz callback verification: Planned HMAC-SHA256 signature verification on incoming webhooks.\n"
        "5. No data at rest encryption on our side as no persistent customer data is stored.\n"
        "6. Standards: SHA-256 hashing, TLS 1.2 minimum, OAuth2 Bearer tokens. Compliant with industry standards."
    ),
    48: (
        "Securing application services on public networks:\n"
        "1. All data transmission between the customer's browser and HALLU servers is encrypted via HTTPS/TLS 1.2+.\n"
        "2. All API calls from HALLU backend to Allianz MCI API are over HTTPS with OAuth2 Bearer token authentication.\n"
        "3. Payment redirect to SenangPay uses HTTPS with HMAC-SHA256 hash to prevent tampering.\n"
        "4. HTTP Strict Transport Security (HSTS) headers enforced via Helmet middleware — prevents protocol downgrade attacks.\n"
        "5. CORS policy restricts API access to the authorized frontend origin only.\n"
        "6. Rate limiting prevents abuse of public-facing API endpoints."
    ),
    50: (
        "Source code review:\n"
        "1. All code changes require pull request review by at least one other developer before merge.\n"
        "2. Automated checks: Biome linter runs on all code changes to detect code quality issues.\n"
        "3. Dependency audit: npm audit identifies known vulnerabilities in third-party packages.\n"
        "4. Penetration testing: DC Auto acknowledges that Allianz will provide pentest scope. DC Auto will cooperate with the CREST-accredited vendor selected by Allianz for external penetration testing.\n"
        "5. No backdoor access or hardcoded credentials exist in the source code. All secrets are externalized as environment variables."
    ),
    53: (
        "The HALLU platform is a Progressive Web Application (PWA) / responsive website — not a native mobile app.\n"
        "1. It runs in the customer's mobile browser (Safari/Chrome) — no app store download required.\n"
        "2. The web application is served over HTTPS from Vercel's CDN with automatic SSL.\n"
        "3. Browser security model provides sandboxing — the web app cannot access device storage, contacts, or other apps.\n"
        "4. Content is always served from the latest deployed version (no outdated app versions possible).\n"
        "5. Compatible with all modern mobile browsers on iOS 15+ and Android 10+."
    ),
    54: (
        "Protection of mobile/web transactions:\n"
        "1. The platform is a responsive web application accessed via mobile browser — not a native app.\n"
        "2. Session data is isolated per browser tab (sessionStorage) — cannot be accessed by other tabs or apps.\n"
        "3. No sensitive data is cached in browser localStorage or cookies.\n"
        "4. Payment transactions redirect to SenangPay's PCI-DSS compliant gateway — card details never touch HALLU servers.\n"
        "5. HMAC-SHA256 hash prevents payment amount or order tampering.\n"
        "6. Session is cleared upon flow completion or browser tab close."
    ),
    58: (
        "As a responsive web application (not a native mobile app), traditional mobile security controls apply differently:\n"
        "1. Jailbreak/root detection: Not applicable — web apps run in browser sandbox regardless of device jailbreak status.\n"
        "2. Session timeout: Browser sessionStorage is automatically cleared when the tab is closed.\n"
        "3. No local data persistence: No sensitive data stored on device beyond the active browser session.\n"
        "4. OTP: Not currently implemented for customer identity verification (NRIC + plate number used as identity proof). OTP is on the roadmap for Phase 2.\n"
        "5. Geo-locking: Not applicable for a web-based insurance renewal platform serving Malaysian customers nationwide."
    ),
    62: (
        "Cyber security controls:\n"
        "1. DDoS protection: Vercel (frontend) provides built-in DDoS mitigation via their global CDN. Backend is protected by rate limiting (express-rate-limit).\n"
        "2. WAF: Vercel includes basic WAF capabilities. Additional WAF (Cloudflare) planned for production backend.\n"
        "3. Input validation: Zod schema validation prevents injection attacks (SQLi, XSS, command injection).\n"
        "4. Security headers: Helmet middleware enforces CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.\n"
        "5. CORS: Strict origin policy — only authorized frontend domain can call backend APIs.\n"
        "6. OAuth2: Allianz API access secured with short-lived tokens (auto-refreshed, never exposed to browser).\n"
        "7. No direct database exposure — all data operations go through Allianz API gateway."
    ),
    66: (
        "Source code access control:\n"
        "1. Source code is hosted in a private GitHub repository.\n"
        "2. Access is restricted to authorized DC Auto developers only (currently 2 developers + CTO).\n"
        "3. Branch protection rules on main branch: requires PR approval, no force push allowed.\n"
        "4. Allianz does not have access to DC Auto's source code repository (separate codebases — Allianz provides API, DC Auto builds frontend).\n"
        "5. GitHub audit log tracks all repository access and changes."
    ),
    67: (
        "Change control procedures:\n"
        "1. Developer creates feature branch from main.\n"
        "2. Code changes are committed with descriptive messages.\n"
        "3. Pull request created with description of changes and testing performed.\n"
        "4. Peer review required — at least one approval before merge.\n"
        "5. Vercel creates preview deployment for PR review/testing.\n"
        "6. After approval, PR is merged to main → automatic production deployment.\n"
        "7. Rollback: Any deployment can be reverted instantly via Vercel dashboard.\n"
        "8. Emergency changes follow the same process with expedited review."
    ),
    73: (
        "Information security event reporting:\n"
        "1. Primary channel: Security events are reported immediately to CTO via direct communication (phone/email).\n"
        "2. Allianz notification: Critical security events affecting customer data or API integrity are escalated to Allianz contact (Kuljit Singh / Nizwan) within 4 hours.\n"
        "3. Types of reportable events: unauthorized access attempts, API credential compromise, payment irregularities, data breach suspicion.\n"
        "4. Logging: All security events are documented with timestamp, description, impact assessment, and resolution."
    ),
    74: (
        "Information security weakness reporting:\n"
        "1. Developers are required to report any discovered security weaknesses immediately to CTO.\n"
        "2. npm audit warnings and Dependabot alerts are reviewed within 48 hours of notification.\n"
        "3. Weaknesses are logged in the project issue tracker (GitHub Issues) with 'security' label.\n"
        "4. Critical weaknesses (CVSS 7+) are escalated to Allianz if they could impact the API integration.\n"
        "5. Resolution timeline: Critical — 24 hours, High — 7 days, Medium — 30 days."
    ),
    75: (
        "Assessment of security events:\n"
        "1. CTO performs initial triage of all reported security events.\n"
        "2. Severity classification: Critical (data breach, credential compromise), High (unauthorized access attempt), Medium (configuration issue), Low (informational).\n"
        "3. Impact assessment considers: customer data exposure, financial impact, regulatory implications, Allianz API security.\n"
        "4. Decision on escalation to Allianz is based on whether the event affects the API integration or customer data flowing through the system."
    ),
    76: (
        "Response to information security incidents:\n"
        "1. Immediate containment: Revoke compromised credentials, disable affected endpoints, or take system offline if necessary.\n"
        "2. Investigation: Review logs (PM2, Vercel, access logs) to determine scope and root cause.\n"
        "3. Remediation: Fix vulnerability, rotate credentials, deploy patches.\n"
        "4. Communication: Notify Allianz of incidents affecting the integration within 4 hours.\n"
        "5. Post-incident: Document lessons learned, update security controls, conduct review.\n"
        "6. Credential rotation: Allianz API keys and SenangPay secrets rotated if any compromise is suspected."
    ),
}


def main():
    shutil.copy2(INPUT_PATH, OUTPUT_PATH)
    wb = openpyxl.load_workbook(OUTPUT_PATH)
    ws = wb['Analysis & Evaluation']

    filled_count = 0
    for row_num, response in RESPONSES.items():
        cell = ws.cell(row=row_num, column=13)  # Column M
        cell.value = response
        ctrl_id = ws.cell(row=row_num, column=1).value
        key_area = ws.cell(row=row_num, column=2).value
        print(f"  ✓ Row {row_num} ({ctrl_id} - {key_area})")
        filled_count += 1

    wb.save(OUTPUT_PATH)
    print(f"\n✅ ISRA filled successfully: {OUTPUT_PATH}")
    print(f"   Rows filled: {filled_count}")


if __name__ == '__main__':
    main()
