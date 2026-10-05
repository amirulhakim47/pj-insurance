#!/usr/bin/env python3
"""Generate Information Security Risk Assessment (ISRA) as Word Document."""

from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_PATH = os.path.join(PROJECT_DIR, 'docs', 'HALLU-ISRA-Information-Security-Risk-Assessment.docx')

ORANGE = RGBColor(0xF9, 0x73, 0x16)
DARK = RGBColor(0x1A, 0x1A, 0x2E)
GREEN = RGBColor(0x16, 0xA3, 0x4A)
RED = RGBColor(0xDC, 0x26, 0x26)
AMBER = RGBColor(0xD9, 0x77, 0x06)


def set_cell_shading(cell, color_hex):
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), color_hex)
    shading.set(qn('w:val'), 'clear')
    cell._tc.get_or_add_tcPr().append(shading)


def set_table_style(table):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for row in table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                paragraph.paragraph_format.space_after = Pt(2)
                paragraph.paragraph_format.space_before = Pt(2)


def add_risk_table(doc, risks, headers):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Table Grid'

    # Header row
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        for p in hdr_cells[i].paragraphs:
            p.runs[0].bold = True
            p.runs[0].font.size = Pt(8)
            p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        set_cell_shading(hdr_cells[i], '1A1A2E')

    # Data rows
    for risk in risks:
        row_cells = table.add_row().cells
        for i, val in enumerate(risk):
            row_cells[i].text = str(val)
            for p in row_cells[i].paragraphs:
                for run in p.runs:
                    run.font.size = Pt(8)

        # Color-code risk score column (index varies)
        score_idx = headers.index('Risk Score') if 'Risk Score' in headers else -1
        if score_idx >= 0:
            score = int(risk[score_idx].split(' ')[0]) if risk[score_idx] else 0
            if score >= 15:
                set_cell_shading(row_cells[score_idx], 'FEE2E2')
            elif score >= 10:
                set_cell_shading(row_cells[score_idx], 'FEF3C7')
            elif score >= 5:
                set_cell_shading(row_cells[score_idx], 'DBEAFE')

    set_table_style(table)
    return table


def create_document():
    doc = Document()

    # Page setup - landscape for tables
    section = doc.sections[0]
    section.orientation = WD_ORIENT.LANDSCAPE
    new_width, new_height = section.page_height, section.page_width
    section.page_width = new_width
    section.page_height = new_height
    section.left_margin = Cm(2)
    section.right_margin = Cm(2)

    # === COVER PAGE ===
    for _ in range(4):
        doc.add_paragraph()

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run('INFORMATION SECURITY\nRISK ASSESSMENT (ISRA)')
    run.font.size = Pt(28)
    run.font.bold = True
    run.font.color.rgb = DARK

    doc.add_paragraph()

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run('HALLU Motor Insurance Renewal Platform')
    run.font.size = Pt(16)
    run.font.color.rgb = ORANGE

    doc.add_paragraph()
    doc.add_paragraph()

    # Document info table
    info_table = doc.add_table(rows=8, cols=2)
    info_table.style = 'Table Grid'
    info_data = [
        ('System', 'HALLU Motor Insurance Renewal Platform'),
        ('Organization', 'DC Auto Services Sdn Bhd (trading as HALLU)'),
        ('Partner', 'Allianz General Insurance Company (Malaysia) Berhad'),
        ('Assessment Date', '26 August 2026'),
        ('Document Version', '1.0'),
        ('Classification', 'CONFIDENTIAL'),
        ('Framework Reference', 'ISO 27001:2022, OWASP Top 10, BNM RMiT, PDPA 2010'),
        ('Status', 'Draft — Pending Allianz Review'),
    ]
    for i, (label, value) in enumerate(info_data):
        info_table.rows[i].cells[0].text = label
        info_table.rows[i].cells[1].text = value
        for p in info_table.rows[i].cells[0].paragraphs:
            for run in p.runs:
                run.bold = True
                run.font.size = Pt(10)
        for p in info_table.rows[i].cells[1].paragraphs:
            for run in p.runs:
                run.font.size = Pt(10)

    doc.add_page_break()

    # === TABLE OF CONTENTS ===
    doc.add_heading('Table of Contents', level=1)
    toc_items = [
        '1. System Overview & Scope',
        '2. Data Classification',
        '3. Risk Assessment Methodology',
        '4. Risk Register',
        '   4.1 Authentication & Access Control',
        '   4.2 Data Protection & Privacy',
        '   4.3 Application Security',
        '   4.4 Infrastructure & Network Security',
        '   4.5 Payment Security',
        '   4.6 Third-Party & Supply Chain',
        '5. Risk Summary & Heat Map',
        '6. Compliance Mapping (BNM RMiT, PDPA, OWASP)',
        '7. Recommendations & Remediation Plan',
        '8. Residual Risk Acceptance',
        '9. Document Control & Approval',
    ]
    for item in toc_items:
        p = doc.add_paragraph(item)
        p.paragraph_format.space_after = Pt(4)

    doc.add_page_break()

    # === 1. SYSTEM OVERVIEW ===
    doc.add_heading('1. System Overview & Scope', level=1)

    doc.add_heading('1.1 System Description', level=2)
    doc.add_paragraph(
        'The HALLU Motor Insurance Renewal Platform is a web-based application that enables customers '
        'to renew motor insurance policies online through integration with the Allianz Motor Insurance '
        'Open API (MCI) and SenangPay payment gateway. The platform is operated by DC Auto Services '
        'Sdn Bhd as a registered digital intermediary of Allianz General Insurance Company (Malaysia) Berhad.'
    )

    doc.add_heading('1.2 Assessment Scope', level=2)
    scope_table = doc.add_table(rows=8, cols=2)
    scope_table.style = 'Table Grid'
    scope_data = [
        ('Component', 'Description'),
        ('Frontend Application', 'Next.js 15 web application (customer-facing UI)'),
        ('Backend API Server', 'Express.js API proxy server (Node.js)'),
        ('Allianz API Integration', 'OAuth2 + REST API calls to Allianz MCI Open API'),
        ('Payment Gateway', 'SenangPay integration (HMAC-SHA256 hash verification)'),
        ('Hosting Infrastructure', 'Vercel PaaS (full-stack) — VPS migration planned pre-production'),
        ('Data in Transit', 'HTTPS/TLS encrypted communications'),
        ('Data at Rest', 'Browser sessionStorage, server environment variables'),
    ]
    for i, (col1, col2) in enumerate(scope_data):
        scope_table.rows[i].cells[0].text = col1
        scope_table.rows[i].cells[1].text = col2
        if i == 0:
            for cell in scope_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
    set_table_style(scope_table)

    doc.add_page_break()

    # === 2. DATA CLASSIFICATION ===
    doc.add_heading('2. Data Classification', level=1)

    class_table = doc.add_table(rows=7, cols=3)
    class_table.style = 'Table Grid'
    class_data = [
        ('Data Type', 'Classification', 'Examples'),
        ('Personal Identifiable Information (PII)', 'CONFIDENTIAL', 'NRIC, full name, DOB, gender, address, phone, email'),
        ('Financial Data', 'CONFIDENTIAL', 'Payment amounts, bank references, transaction IDs'),
        ('Vehicle Information', 'INTERNAL', 'Plate number, chassis number, engine number'),
        ('Insurance Policy Data', 'CONFIDENTIAL', 'Contract numbers, premium details, NCD, claims history'),
        ('API Credentials', 'RESTRICTED', 'OAuth keys, API secrets, HMAC keys, partner ID'),
        ('System Logs', 'INTERNAL', 'Error logs, access logs, audit trails'),
    ]
    for i, row_data in enumerate(class_data):
        for j, val in enumerate(row_data):
            class_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in class_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
    set_table_style(class_table)

    doc.add_page_break()

    # === 3. RISK METHODOLOGY ===
    doc.add_heading('3. Risk Assessment Methodology', level=1)

    doc.add_heading('3.1 Risk Rating Formula', level=2)
    doc.add_paragraph('Risk Score = Likelihood (1-5) × Impact (1-5)')
    doc.add_paragraph()

    doc.add_heading('3.2 Risk Appetite', level=2)
    appetite_table = doc.add_table(rows=5, cols=3)
    appetite_table.style = 'Table Grid'
    appetite_data = [
        ('Rating', 'Score Range', 'Treatment'),
        ('Critical', '20 – 25', 'Unacceptable — immediate remediation required'),
        ('High', '10 – 16', 'Unacceptable — remediation within 30 days'),
        ('Medium', '5 – 9', 'Tolerable with monitoring — remediation within 90 days'),
        ('Low', '1 – 4', 'Acceptable — monitor and review annually'),
    ]
    colors = ['1A1A2E', 'FEE2E2', 'FEF3C7', 'DBEAFE', 'D1FAE5']
    for i, row_data in enumerate(appetite_data):
        for j, val in enumerate(row_data):
            appetite_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in appetite_table.rows[i].cells:
                set_cell_shading(cell, colors[i])
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
        else:
            set_cell_shading(appetite_table.rows[i].cells[0], colors[i])
    set_table_style(appetite_table)

    doc.add_page_break()

    # === 4. RISK REGISTER ===
    doc.add_heading('4. Risk Register', level=1)

    # 4.1 Auth Risks
    doc.add_heading('4.1 Authentication & Access Control', level=2)
    auth_headers = ['Risk ID', 'Risk Description', 'Threat', 'Likelihood', 'Impact', 'Risk Score', 'Current Controls', 'Residual Risk', 'Recommended Action']
    auth_risks = [
        ('AUTH-01', 'Unauthorized access to API credentials', 'External attacker / insider', '2', '5', '10 (High)', 'Keys in .env.local; server-side only', 'Medium', 'Secrets manager; rotate quarterly'),
        ('AUTH-02', 'OAuth token theft or replay', 'MITM attack', '1', '4', '4 (Low)', 'TLS; short-lived tokens (3600s); server-side', 'Low', 'Token usage monitoring; binding'),
        ('AUTH-03', 'Brute force on API endpoints', 'Automated bots', '3', '3', '9 (Medium)', 'Rate limiting; Helmet headers', 'Medium', 'CAPTCHA; progressive delays; WAF'),
        ('AUTH-04', 'No user authentication system', 'Social engineering', '3', '4', '12 (High)', 'NRIC validated against Allianz records', 'High', 'OTP verification via SMS/email'),
    ]
    add_risk_table(doc, auth_risks, auth_headers)
    doc.add_paragraph()

    # 4.2 Data Risks
    doc.add_heading('4.2 Data Protection & Privacy', level=2)
    data_risks = [
        ('DATA-01', 'PII in browser sessionStorage', 'XSS / shared device', '2', '4', '8 (Medium)', 'Session-scoped; cleared on completion', 'Medium', 'Encrypt sensitive fields; session timeout'),
        ('DATA-02', 'PII transmitted without encryption', 'Network eavesdropping', '1', '5', '5 (Medium)', 'HTTPS enforced; HSTS via Helmet', 'Low', 'HSTS preload; cert pinning'),
        ('DATA-03', 'PDPA non-compliance', 'Regulatory action', '2', '5', '10 (High)', 'Consent checkbox; PDPA policy page', 'Medium', 'Consent withdrawal; DPO; retention policy'),
        ('DATA-04', 'Data leakage via error messages', 'External attacker', '2', '3', '6 (Medium)', 'Generic errors in production', 'Low', 'Structured logging; sanitize errors'),
        ('DATA-05', 'No data retention controls', 'Regulatory breach', '3', '4', '12 (High)', 'Session cleared; no persistent PII', 'Medium', 'Formal retention policy (7yr BNM)'),
    ]
    add_risk_table(doc, data_risks, auth_headers)
    doc.add_paragraph()

    doc.add_page_break()

    # 4.3 Application Security
    doc.add_heading('4.3 Application Security', level=2)
    app_risks = [
        ('APP-01', 'Cross-Site Scripting (XSS)', 'External attacker', '2', '4', '8 (Medium)', 'React auto-escape; Zod validation', 'Low', 'CSP headers; regular DAST scans'),
        ('APP-02', 'Cross-Site Request Forgery', 'External attacker', '2', '3', '6 (Medium)', 'HMAC hash; same-origin policy', 'Medium', 'CSRF tokens; SameSite cookies'),
        ('APP-03', 'Injection attacks', 'External attacker', '1', '5', '5 (Medium)', 'No direct DB; Zod validation', 'Low', 'Maintain validation; pen testing'),
        ('APP-04', 'Insecure Direct Object References', 'Authenticated user', '2', '3', '6 (Medium)', 'Allianz-generated IDs; session-bound', 'Low', 'Server-side session validation'),
        ('APP-05', 'Dependency vulnerabilities', 'Supply chain', '3', '3', '9 (Medium)', 'npm audit; Dependabot', 'Medium', 'Automated SCA in CI/CD'),
        ('APP-06', 'Insufficient logging/monitoring', 'APT', '3', '4', '12 (High)', 'Console + PM2 logs', 'High', 'Centralized logging; SIEM; alerting'),
    ]
    add_risk_table(doc, app_risks, auth_headers)
    doc.add_paragraph()

    # 4.4 Infrastructure
    doc.add_heading('4.4 Infrastructure & Network Security', level=2)
    infra_risks = [
        ('INFRA-01', 'Platform service outage (Vercel)', 'Service disruption', '1', '4', '4 (Low)', 'Vercel 99.99% SLA; multi-region; auto-failover', 'Low', 'VPS backend migration for redundancy'),
        ('INFRA-02', 'DDoS attack', 'External attacker', '2', '4', '8 (Medium)', 'Vercel built-in DDoS protection; rate limiting', 'Medium', 'Cloudflare/AWS WAF; circuit breaker'),
        ('INFRA-03', 'Insecure callback endpoint', 'External attacker', '2', '4', '8 (Medium)', 'API key header; IP allowlist', 'Medium', 'mTLS; request signing verification'),
        ('INFRA-04', 'No disaster recovery plan', 'System failure', '3', '4', '12 (High)', 'Git VCS; Vercel auto-deploy; instant rollback', 'Medium', 'Formal DR plan; RTO/RPO defined'),
    ]
    add_risk_table(doc, infra_risks, auth_headers)
    doc.add_paragraph()

    doc.add_page_break()

    # 4.5 Payment Security
    doc.add_heading('4.5 Payment Security', level=2)
    pay_risks = [
        ('PAY-01', 'Payment hash tampering', 'External attacker', '1', '5', '5 (Medium)', 'HMAC-SHA256 server-side; verified on return', 'Low', 'Rotate secret; log hash events'),
        ('PAY-02', 'Payment replay attack', 'External attacker', '2', '4', '8 (Medium)', 'Unique order ID; SenangPay idempotency', 'Medium', 'Server-side order tracking; nonce'),
        ('PAY-03', 'Payment amount manipulation', 'External attacker', '1', '5', '5 (Medium)', 'Amount from Allianz quotation; hash includes amount', 'Low', 'Validate vs quotation; reconcile'),
        ('PAY-04', 'Sandbox credentials in production', 'Operational error', '2', '5', '10 (High)', 'Currently in UAT phase', 'Medium', 'Env validation; CI/CD gates'),
    ]
    add_risk_table(doc, pay_risks, auth_headers)
    doc.add_paragraph()

    # 4.6 Third-Party
    doc.add_heading('4.6 Third-Party & Supply Chain', level=2)
    tp_risks = [
        ('TP-01', 'Allianz API unavailability', 'Service outage', '2', '4', '8 (Medium)', 'Retry logic (3x exponential backoff)', 'Medium', 'Circuit breaker; queue submissions'),
        ('TP-02', 'SenangPay service compromise', 'Payment breach', '1', '5', '5 (Medium)', 'PCI-DSS; no card data on HALLU servers', 'Low', 'Annual PCI compliance check'),
        ('TP-03', 'npm supply chain attack', 'Malicious package', '2', '4', '8 (Medium)', 'package-lock.json; limited deps', 'Medium', 'npm audit in CI; lockfile-lint'),
    ]
    add_risk_table(doc, tp_risks, auth_headers)

    doc.add_page_break()

    # === 5. RISK SUMMARY ===
    doc.add_heading('5. Risk Summary', level=1)

    doc.add_heading('5.1 Risk Distribution', level=2)
    summary_table = doc.add_table(rows=5, cols=3)
    summary_table.style = 'Table Grid'
    summary_data = [
        ('Rating', 'Count', 'Percentage'),
        ('Critical (20-25)', '0', '0%'),
        ('High (10-16)', '7', '33%'),
        ('Medium (5-9)', '12', '57%'),
        ('Low (1-4)', '2', '10%'),
    ]
    for i, row_data in enumerate(summary_data):
        for j, val in enumerate(row_data):
            summary_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in summary_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
    set_table_style(summary_table)

    doc.add_paragraph()
    doc.add_heading('5.2 Top Risks Requiring Immediate Attention', level=2)
    top_risks_table = doc.add_table(rows=8, cols=4)
    top_risks_table.style = 'Table Grid'
    top_data = [
        ('Priority', 'Risk ID', 'Description', 'Timeline'),
        ('1', 'INFRA-01', 'VPS backend migration (from Vercel-only)', 'Before go-live'),
        ('2', 'AUTH-04', 'No user authentication (NRIC only)', 'Phase 2'),
        ('3', 'DATA-05', 'No formal data retention policy', '30 days'),
        ('4', 'APP-06', 'Insufficient logging/monitoring', 'Before go-live'),
        ('5', 'INFRA-04', 'No disaster recovery plan', '30 days'),
        ('6', 'AUTH-01', 'API credential management', 'Before go-live'),
        ('7', 'DATA-03', 'PDPA compliance gaps', '30 days'),
    ]
    for i, row_data in enumerate(top_data):
        for j, val in enumerate(row_data):
            top_risks_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in top_risks_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
    set_table_style(top_risks_table)

    doc.add_page_break()

    # === 6. COMPLIANCE MAPPING ===
    doc.add_heading('6. Compliance Mapping', level=1)

    doc.add_heading('6.1 BNM Risk Management in Technology (RMiT)', level=2)
    rmit_table = doc.add_table(rows=10, cols=4)
    rmit_table.style = 'Table Grid'
    rmit_data = [
        ('Requirement', 'Paragraph', 'Status', 'Gap'),
        ('Technology risk management framework', '10.1', 'Partial', 'Formalize risk management policy'),
        ('Data loss prevention', '10.49', 'Partial', 'Implement DLP monitoring'),
        ('Encryption in transit', '10.52', 'Compliant', 'None'),
        ('Encryption at rest', '10.53', 'Partial', 'Encrypt sensitive session data'),
        ('Access control', '10.18', 'Partial', 'Implement RBAC for admin'),
        ('Security testing', '10.39', 'Partial', 'Add SAST/DAST/pen testing'),
        ('Cloud services', '10.54-10.66', 'Partial', 'Document cloud risk assessment'),
        ('Incident response', '10.67', 'Non-compliant', 'Develop incident response plan'),
        ('Outsourcing', '11.1', 'Partial', 'Formalize vendor assessments'),
    ]
    for i, row_data in enumerate(rmit_data):
        for j, val in enumerate(row_data):
            rmit_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in rmit_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
        elif i > 0:
            status = row_data[2]
            if status == 'Compliant':
                set_cell_shading(rmit_table.rows[i].cells[2], 'D1FAE5')
            elif status == 'Partial':
                set_cell_shading(rmit_table.rows[i].cells[2], 'FEF3C7')
            elif status == 'Non-compliant':
                set_cell_shading(rmit_table.rows[i].cells[2], 'FEE2E2')
    set_table_style(rmit_table)

    doc.add_paragraph()
    doc.add_heading('6.2 PDPA 2010 Compliance', level=2)
    pdpa_table = doc.add_table(rows=8, cols=3)
    pdpa_table.style = 'Table Grid'
    pdpa_data = [
        ('Principle', 'Status', 'Evidence'),
        ('General Principle', 'Compliant', 'PDPA consent collected before processing'),
        ('Notice & Choice', 'Compliant', 'PDPA policy page; consent checkbox'),
        ('Disclosure', 'Compliant', 'Clear disclosure of data sharing with Allianz'),
        ('Security', 'Compliant', 'TLS, server-side secrets, input validation'),
        ('Retention', 'Partial', 'No formal retention policy documented'),
        ('Data Integrity', 'Compliant', 'Validation ensures data accuracy'),
        ('Access', 'Partial', 'No formal DSAR process'),
    ]
    for i, row_data in enumerate(pdpa_data):
        for j, val in enumerate(row_data):
            pdpa_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in pdpa_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
        elif i > 0:
            status = row_data[1]
            if status == 'Compliant':
                set_cell_shading(pdpa_table.rows[i].cells[1], 'D1FAE5')
            elif status == 'Partial':
                set_cell_shading(pdpa_table.rows[i].cells[1], 'FEF3C7')
    set_table_style(pdpa_table)

    doc.add_page_break()

    # === 7. RECOMMENDATIONS ===
    doc.add_heading('7. Recommendations & Remediation Plan', level=1)

    doc.add_heading('7.1 Immediate (Before Production Go-Live)', level=2)
    imm_table = doc.add_table(rows=6, cols=4)
    imm_table.style = 'Table Grid'
    imm_data = [
        ('#', 'Action', 'Risk Addressed', 'Owner'),
        ('1', 'Complete VPS backend migration', 'INFRA-01', 'Dev Team'),
        ('2', 'Implement centralized logging + alerting', 'APP-06', 'Dev Team'),
        ('3', 'Deploy secrets manager for API credentials', 'AUTH-01', 'DevOps'),
        ('4', 'Configure SenangPay production credentials', 'PAY-04', 'Dev Team'),
        ('5', 'Conduct penetration test', 'APP-01 to APP-06', 'External Vendor'),
    ]
    for i, row_data in enumerate(imm_data):
        for j, val in enumerate(row_data):
            imm_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in imm_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
    set_table_style(imm_table)

    doc.add_paragraph()
    doc.add_heading('7.2 Short-term (Within 30 Days)', level=2)
    short_table = doc.add_table(rows=6, cols=4)
    short_table.style = 'Table Grid'
    short_data = [
        ('#', 'Action', 'Risk Addressed', 'Owner'),
        ('6', 'Document formal data retention policy', 'DATA-05', 'Compliance'),
        ('7', 'Document disaster recovery plan', 'INFRA-04', 'DevOps'),
        ('8', 'Implement PDPA DSAR process', 'DATA-03', 'Compliance'),
        ('9', 'Add Content Security Policy headers', 'APP-01', 'Dev Team'),
        ('10', 'Document incident response plan', 'BNM RMiT 10.67', 'Security'),
    ]
    for i, row_data in enumerate(short_data):
        for j, val in enumerate(row_data):
            short_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in short_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
    set_table_style(short_table)

    doc.add_paragraph()
    doc.add_heading('7.3 Medium-term (Within 90 Days)', level=2)
    med_table = doc.add_table(rows=6, cols=4)
    med_table.style = 'Table Grid'
    med_data = [
        ('#', 'Action', 'Risk Addressed', 'Owner'),
        ('11', 'Implement OTP verification for identity', 'AUTH-04', 'Dev Team'),
        ('12', 'Automated dependency scanning in CI/CD', 'APP-05, TP-03', 'DevOps'),
        ('13', 'Implement WAF (Web Application Firewall)', 'INFRA-02', 'DevOps'),
        ('14', 'Vendor security assessment process', 'TP-01, TP-02', 'Compliance'),
        ('15', 'Session encryption for browser data', 'DATA-01', 'Dev Team'),
    ]
    for i, row_data in enumerate(med_data):
        for j, val in enumerate(row_data):
            med_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in med_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
    set_table_style(med_table)

    doc.add_page_break()

    # === 8. RESIDUAL RISK ===
    doc.add_heading('8. Residual Risk Acceptance', level=1)
    doc.add_paragraph(
        'After implementing the recommended controls, the following residual risk levels are expected:'
    )

    res_table = doc.add_table(rows=7, cols=4)
    res_table.style = 'Table Grid'
    res_data = [
        ('Risk Category', 'Current Avg', 'Target Avg', 'Accepted'),
        ('Authentication & Access', '8.75', '5.0', 'Yes (with OTP roadmap)'),
        ('Data Protection', '8.2', '4.5', 'Yes (with retention policy)'),
        ('Application Security', '7.7', '4.0', 'Yes (with pen test)'),
        ('Infrastructure', '8.0', '4.5', 'Yes (Vercel PaaS + VPS migration)'),
        ('Payment Security', '7.0', '4.0', 'Yes'),
        ('Third-Party', '7.0', '5.0', 'Yes'),
    ]
    for i, row_data in enumerate(res_data):
        for j, val in enumerate(row_data):
            res_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in res_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
    set_table_style(res_table)

    doc.add_page_break()

    # === 9. DOCUMENT CONTROL ===
    doc.add_heading('9. Document Control & Approval', level=1)

    doc.add_heading('9.1 Version History', level=2)
    ver_table = doc.add_table(rows=2, cols=4)
    ver_table.style = 'Table Grid'
    ver_data = [
        ('Version', 'Date', 'Author', 'Changes'),
        ('1.0', '26 Aug 2026', 'HALLU Security Team', 'Initial assessment'),
    ]
    for i, row_data in enumerate(ver_data):
        for j, val in enumerate(row_data):
            ver_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in ver_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
    set_table_style(ver_table)

    doc.add_paragraph()
    doc.add_heading('9.2 Review Schedule', level=2)
    doc.add_paragraph('• Next Review: 26 November 2026 (quarterly)')
    doc.add_paragraph('• Trigger Reviews: Major system changes, security incidents, regulatory changes')

    doc.add_paragraph()
    doc.add_heading('9.3 Approval', level=2)
    approval_table = doc.add_table(rows=4, cols=4)
    approval_table.style = 'Table Grid'
    approval_data = [
        ('Role', 'Name', 'Signature', 'Date'),
        ('System Owner', '', '', ''),
        ('Security Lead', '', '', ''),
        ('Compliance Officer', '', '', ''),
    ]
    for i, row_data in enumerate(approval_data):
        for j, val in enumerate(row_data):
            approval_table.rows[i].cells[j].text = val
        if i == 0:
            for cell in approval_table.rows[i].cells:
                set_cell_shading(cell, '1A1A2E')
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        run.bold = True
    set_table_style(approval_table)

    doc.add_paragraph()
    doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('— End of Document —')
    run.font.italic = True
    run.font.color.rgb = DARK

    # Save
    doc.save(OUTPUT_PATH)
    print(f"✅ ISRA Document saved: {OUTPUT_PATH}")


if __name__ == '__main__':
    create_document()
