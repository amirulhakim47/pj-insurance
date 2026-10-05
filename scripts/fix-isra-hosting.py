#!/usr/bin/env python3
"""Update ISRA Column M to reflect Vercel-only hosting (remove shared hosting refs)."""

import openpyxl
import os

FILE_PATH = '/Users/amirulhakim/pj-insrnce/docs/IS Risk Assessment_DC Auto_FILLED.xlsx'

UPDATES = {
    14: (
        "The HALLU platform is deployed entirely on Vercel (PaaS — serverless edge functions with globally distributed CDN). "
        "Vercel runs on AWS infrastructure with automatic scaling, SSL provisioning, and deployment isolation. "
        "Deployment model: PaaS (Vercel) for both the Next.js frontend and API route handlers. "
        "No SaaS or IaaS components are currently in use. "
        "A dedicated VPS (Hostinger) has been provisioned for the backend API layer and will be configured and migrated prior to production go-live and penetration testing."
    ),
    16: (
        "Production (Vercel): Hosted on Vercel's global edge network. Vercel's infrastructure runs on AWS, "
        "with primary compute in the US (us-east-1) and edge nodes distributed globally including Singapore (ap-southeast-1). "
        "Vercel provides SOC 2 Type II compliance, automatic geo-redundancy, and 99.99% uptime SLA. "
        "A dedicated VPS (Hostinger, data center in Singapore) has been provisioned for the backend API layer. "
        "Migration to VPS will be completed prior to production go-live. "
        "DR: Vercel's multi-region architecture provides inherent redundancy. Code is version-controlled in GitHub as additional recovery mechanism."
    ),
    23: (
        "Privileged access controls for the HALLU platform:\n"
        "1. Vercel deployment & environment variables: Protected by Vercel's SSO with email-based authentication. Access restricted to project owner only.\n"
        "2. GitHub repository: Branch protection on main branch — requires pull request review before merge. Direct push to production branch is disabled.\n"
        "3. Environment variables (API keys): Only accessible via Vercel dashboard (project owner access). Cannot be read from the application at runtime by non-server code.\n"
        "4. VPS (provisioned, pre-production): Will be secured with SSH key authentication only. Access restricted to project owner.\n"
        "5. No database admin access exists as the platform does not maintain its own database."
    ),
    25: (
        "Access removal process:\n"
        "1. Upon resignation/termination notification, project owner initiates access revocation within 24 hours.\n"
        "2. Checklist: (a) Remove from GitHub organization, (b) Remove from Vercel team, (c) Rotate any shared credentials the departing staff had access to.\n"
        "3. Allianz API credentials: If a key rotation is warranted, DC Auto requests new credentials from Allianz.\n"
        "4. Confirmation of complete access removal is documented via email to management."
    ),
    27: (
        "Information access is restricted as follows:\n"
        "1. Allianz API access: Controlled via OAuth2 client credentials (consumer key + secret). Only the server-side runtime can authenticate — credentials are never exposed to the browser.\n"
        "2. Application source code: Restricted to authorized developers via GitHub private repository.\n"
        "3. Production environment variables: Accessible only via Vercel dashboard (project owner).\n"
        "4. Customer data: Temporarily held in browser sessionStorage (client-side isolation per browser tab). No server-side persistent storage of customer PII.\n"
        "5. SenangPay merchant credentials: Server-side only, used for HMAC hash generation."
    ),
    28: (
        "Secure log-on procedures for system administration:\n"
        "1. GitHub: Email + password with mandatory 2FA (TOTP or security key). Session timeout after inactivity.\n"
        "2. Vercel: SSO via GitHub OAuth or email magic link. No password-only access.\n"
        "3. VPS (pre-production): SSH key-based authentication only (no password auth). RSA 4096-bit minimum. Will be IP-restricted.\n"
        "4. Error messages on login failure are generic ('Invalid credentials') — do not reveal whether username or password is incorrect.\n"
        "5. No customer-facing login system exists — the platform is a public quotation tool."
    ),
    29: (
        "Password management:\n"
        "1. Developer access (GitHub, Vercel): Minimum 12 characters, complexity enforced by platform. 2FA mandatory.\n"
        "2. VPS access (pre-production): SSH key-based only — no passwords used for server access.\n"
        "3. API credentials (Allianz OAuth, SenangPay): Machine-generated secrets stored as Vercel environment variables. Not human-memorized passwords.\n"
        "4. No customer passwords exist — the platform does not have user accounts or login functionality.\n"
        "5. Allianz manages their own credential rotation schedule; DC Auto complies with credential updates as issued."
    ),
    30: (
        "Privileged utility programs:\n"
        "1. Deployment is fully automated via Vercel's Git integration — no manual server scripts required for current setup.\n"
        "2. npm/node package management is controlled via package-lock.json (pinned versions). Only authorized developers can modify dependencies.\n"
        "3. No database management tools exist as the platform has no database.\n"
        "4. Vercel CLI access (for manual deployments if needed) is restricted to project owner.\n"
        "5. No diagnostic tools are exposed to the public internet.\n"
        "6. VPS (pre-production): Server administration will be restricted to project owner via SSH key only."
    ),
    38: (
        "Change management process:\n"
        "1. All code changes are made via Git feature branches.\n"
        "2. Pull requests require review and approval before merge to main branch.\n"
        "3. Vercel automatically deploys preview environments for each PR for testing.\n"
        "4. Production deployment occurs only after PR approval and merge to main.\n"
        "5. Rollback capability: Vercel supports instant rollback to any previous deployment.\n"
        "6. Environment variable changes require project owner approval and are logged by Vercel.\n"
        "7. API integration changes are tested against Allianz UAT environment before production."
    ),
    39: (
        "Capacity management:\n"
        "1. Vercel: Auto-scaling serverless architecture — scales automatically with traffic. Vercel provides built-in analytics for traffic and performance monitoring.\n"
        "2. Allianz API: Rate-limited by Allianz per their API gateway policies. Our application implements rate limiting (express-rate-limit) to prevent overloading Allianz endpoints.\n"
        "3. Current capacity is adequate for projected transaction volumes as a new digital channel.\n"
        "4. Capacity is reviewed monthly via Vercel analytics dashboard.\n"
        "5. VPS (pre-production): Provisioned with resources appropriate for expected backend API traffic. Will be monitored post-migration."
    ),
    43: (
        "Event logging:\n"
        "1. Application logs: All API calls to Allianz are logged with timestamps, request/response status codes, and error details (captured by Vercel serverless function logs).\n"
        "2. Vercel logs: Function execution logs with request metadata retained per Vercel's platform policy (up to 1 hour real-time, exportable to external log drain).\n"
        "3. Deployment logs: Full build and deployment history maintained by Vercel indefinitely.\n"
        "4. Logs are append-only — developers cannot edit production logs.\n"
        "5. Log review: Logs are reviewed upon incident or anomaly detection. Periodic review planned for production phase.\n"
        "6. VPS (pre-production): Will implement PM2 log management with 30-day retention upon migration."
    ),
    76: (
        "Response to information security incidents:\n"
        "1. Immediate containment: Revoke compromised credentials via Vercel dashboard, disable affected endpoints, or take system offline if necessary.\n"
        "2. Investigation: Review Vercel function logs, deployment history, and GitHub audit log to determine scope and root cause.\n"
        "3. Remediation: Fix vulnerability, rotate credentials, deploy patches (instant via Vercel).\n"
        "4. Communication: Notify Allianz of incidents affecting the integration within 4 hours.\n"
        "5. Post-incident: Document lessons learned, update security controls, conduct review.\n"
        "6. Credential rotation: Allianz API keys and SenangPay secrets rotated if any compromise is suspected."
    ),
}


def main():
    wb = openpyxl.load_workbook(FILE_PATH)
    ws = wb['Analysis & Evaluation']

    for row_num, response in UPDATES.items():
        cell = ws.cell(row=row_num, column=13)
        cell.value = response
        ctrl_id = ws.cell(row=row_num, column=1).value
        key_area = ws.cell(row=row_num, column=2).value
        print(f"  ✓ Updated Row {row_num} ({ctrl_id} - {key_area})")

    wb.save(FILE_PATH)
    print(f"\n✅ ISRA updated: {FILE_PATH}")
    print(f"   Rows updated: {len(UPDATES)}")


if __name__ == '__main__':
    main()
