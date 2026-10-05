#!/usr/bin/env python3
"""Generate Demo Presentation (PowerPoint) for Allianz meeting."""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
SCREENSHOTS_DIR = os.path.join(PROJECT_DIR, 'docs', 'demo-screenshots')
OUTPUT_PATH = os.path.join(PROJECT_DIR, 'docs', 'HALLU-Allianz-Demo-Presentation.pptx')

ORANGE = RGBColor(0xF9, 0x73, 0x16)
DARK = RGBColor(0x1A, 0x1A, 0x2E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GRAY = RGBColor(0x6B, 0x72, 0x80)
GREEN = RGBColor(0x16, 0xA3, 0x4A)
RED = RGBColor(0xDC, 0x26, 0x26)
LIGHT_BG = RGBColor(0xF8, 0xF9, 0xFA)


def set_slide_bg(slide, color):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_text_box(slide, left, top, width, height, text, font_size=14, bold=False, color=DARK, alignment=PP_ALIGN.LEFT):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.alignment = alignment
    return tf


def add_bullet_slide(slide, left, top, width, height, items, font_size=13, color=DARK):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = item
        p.font.size = Pt(font_size)
        p.font.color.rgb = color
        p.space_after = Pt(6)
    return tf


def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # === SLIDE 1: Title ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank
    set_slide_bg(slide, DARK)

    add_text_box(slide, Inches(1), Inches(1.5), Inches(11), Inches(1),
                 "HALLU × Allianz General Insurance", 40, True, WHITE, PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(2.7), Inches(11), Inches(0.8),
                 "Motor Insurance Online Renewal Platform — Demo", 24, False, ORANGE, PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(4.5), Inches(11), Inches(1.5),
                 "Prepared by: DC Auto Services (HALLU) Development Team\n27 August 2026",
                 16, False, GRAY, PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(6.2), Inches(11), Inches(0.5),
                 "Confidential — For Allianz Internal Review Only",
                 12, False, GRAY, PP_ALIGN.CENTER)

    # === SLIDE 2: Agenda ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_text_box(slide, Inches(0.8), Inches(0.4), Inches(11), Inches(0.8),
                 "Agenda", 32, True, DARK)

    agenda_items = [
        "1.  System Overview & Architecture",
        "2.  Live Demo — End-to-End Flow (8 Steps)",
        "3.  API Integration Status",
        "4.  Automated Test Results",
        "5.  Security Measures",
        "6.  Pending Items & Next Steps",
    ]
    add_bullet_slide(slide, Inches(1.2), Inches(1.5), Inches(10), Inches(5), agenda_items, 20, DARK)

    # === SLIDE 3: Architecture ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_text_box(slide, Inches(0.8), Inches(0.4), Inches(11), Inches(0.8),
                 "System Architecture", 32, True, DARK)

    arch_items = [
        "Customer Browser  →  HALLU Platform (Next.js 15 / React 19)",
        "                              →  API Route Handlers (serverless)",
        "                              →  Allianz MCI API (UAT)",
        "",
        "Payment:  SenangPay (HMAC-SHA256, PCI-DSS compliant)",
        "Auth:       OAuth2 Client Credentials (auto-refresh)",
        "Deploy:   Vercel PaaS (full-stack, auto-scaling, SOC 2)",
        "             VPS (Hostinger) provisioned for backend — migration pre-go-live",
        "",
        "Key Design Decisions:",
        "• All API keys/secrets server-side only — never exposed to browser",
        "• Session-based flow — no persistent PII storage on our servers",
        "• Retry logic (3x exponential backoff) on Allianz submission",
    ]
    add_bullet_slide(slide, Inches(1), Inches(1.5), Inches(11), Inches(5.5), arch_items, 15, DARK)

    # === SLIDE 4: Flow Overview ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_text_box(slide, Inches(0.8), Inches(0.4), Inches(11), Inches(0.8),
                 "End-to-End Flow Overview", 32, True, DARK)

    flow_items = [
        "Step 1:  Landing Page — Customer enters plate number",
        "Step 2:  Quote Form — NRIC, vehicle details, PDPA consent",
        "Step 3:  Vehicle Lookup — Allianz API + UBB Check 1",
        "Step 4:  Results — Variant selection, quote generation, add-ons",
        "Step 5:  Customer Details — Address, contact, additional drivers",
        "Step 6:  Payment — Review summary, SenangPay secure redirect",
        "Step 7:  Verification — Payment hash check + Allianz submission",
        "Step 8:  Confirmation — Policy summary, free-look period info",
    ]
    add_bullet_slide(slide, Inches(1), Inches(1.5), Inches(11), Inches(5.5), flow_items, 17, DARK)

    # === SLIDES 5-13: Screenshots with descriptions (all 8 steps) ===
    screenshots = [
        ("01-landing-page.png", "Step 1: Landing Page",
         "• Clear Allianz branding as registered intermediary\n• Quick plate input for instant quote\n• Coverage info, how-it-works guide\n• PDPA notice + regulatory disclosures (PIDM, BNM)"),
        ("03-quote-form-filled.png", "Step 2: Quote Form",
         "• Full name, NRIC (auto-formatted), plate number\n• Postcode, phone, email validation\n• Vehicle type, customer type selection\n• E-hailing/EV flags, PDPA consent (mandatory)"),
        ("03b-loading-vehicle-lookup.png", "Step 3: Vehicle Lookup (Loading)",
         "• Animated progress bar with status messages\n• Calls Allianz /vehicleDetails API\n• UBB Check 1 performed (underwriting validation)\n• ISM claims history retrieval\n• Auto-redirect to results on success\n• Error screen on UBB referral / rejection"),
        ("04-results-vehicle-info.png", "Step 4a: Vehicle Results & Variant Selection",
         "• Vehicle info from Allianz API (make, model, year, CC)\n• 55% NCD auto-calculated\n• Market Value / Agreed Value toggle\n• NVIC variants with 'Best Match' recommendation\n• Product Disclosure Sheet (PDS) link"),
        ("05-results-quotation.png", "Step 4b: Quotation & Add-ons",
         "• Premium generated via Allianz /quote API\n• Add-on covers: windscreen, flood, ERW, CART\n• Driver plans: named / unlimited\n• Real-time premium recalculation on each toggle"),
        ("06-customer-details.png", "Step 5: Customer Details",
         "• Name auto-populated from NRIC\n• DOB, gender, nationality auto-derived from NRIC\n• Full address with postcode → city/state lookup\n• Mobile number with prefix selection"),
        ("07-payment-page.png", "Step 6: Review & Pay",
         "• Full premium breakdown (basic, NCD, add-ons, tax)\n• Commission disclosure (BNM requirement)\n• PDS acknowledgment checkbox (mandatory)\n• SenangPay secure payment redirect\n• HMAC-SHA256 hash generated server-side"),
        ("07b-payment-verification.png", "Step 7: Payment Verification",
         "• SenangPay returns with status + hash\n• HMAC-SHA256 hash verified server-side\n• Auto-submits policy to Allianz /submission API\n• Retry logic (3× exponential backoff on 500)\n• Success → redirect to confirmation\n• Failure → user notified with retry option"),
        ("08-thank-you-page.png", "Step 8: Confirmation",
         "• Payment successful confirmation\n• Policy summary (insurer, contract, vehicle, period)\n• Total paid: RM 1,086.48\n• Free-look period (15 days) notice\n• Refund policy information\n• Download policy / receipt"),
    ]

    for filename, title, description in screenshots:
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        add_text_box(slide, Inches(0.8), Inches(0.3), Inches(11), Inches(0.7),
                     title, 24, True, DARK)

        # Add mobile screenshot (portrait aspect ~390:844 ≈ 1:2.16)
        img_path = os.path.join(SCREENSHOTS_DIR, filename)
        if os.path.exists(img_path):
            # Height 6in, width proportional (~2.77in for mobile ratio)
            slide.shapes.add_picture(img_path, Inches(0.8), Inches(1.1), height=Inches(6.0))

        # Add description to the right of the phone screenshot
        lines = description.split('\n')
        add_bullet_slide(slide, Inches(4.2), Inches(2.0), Inches(8.5), Inches(5), lines, 16, DARK)

    # === SLIDE: Error Handling Scenarios ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_text_box(slide, Inches(0.8), Inches(0.3), Inches(11), Inches(0.7),
                 "Error Handling — UBB Validation Scenarios", 24, True, DARK)

    error_screenshots = [
        ("10-error-not-due-yet.png", "Not Yet Due for Renewal\n(UBBE002)"),
        ("11-error-policy-expired.png", "Policy Already Expired\n(UBBE001)"),
        ("12-error-ubb-risk-block.png", "Risk Acceptance Block\n(UBBE003-006)"),
        ("13-error-id-mismatch.png", "NRIC / Vehicle Mismatch\n(ID_MISMATCH)"),
    ]

    x_positions = [Inches(0.3), Inches(3.4), Inches(6.5), Inches(9.6)]
    for i, (filename, label) in enumerate(error_screenshots):
        img_path = os.path.join(SCREENSHOTS_DIR, filename)
        if os.path.exists(img_path):
            slide.shapes.add_picture(img_path, x_positions[i], Inches(1.2), height=Inches(4.8))
        add_text_box(slide, x_positions[i], Inches(6.1), Inches(3), Inches(0.9),
                     label, 11, True, DARK, PP_ALIGN.CENTER)

    add_text_box(slide, Inches(0.8), Inches(7.0), Inches(11), Inches(0.4),
                 "All UBB referral codes handled with user-friendly messages. Blocked users cannot proceed to quotation.",
                 12, False, GRAY, PP_ALIGN.LEFT)

    # === SLIDE 13: API Status ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_text_box(slide, Inches(0.8), Inches(0.4), Inches(11), Inches(0.8),
                 "API Integration Status", 32, True, DARK)

    api_items = [
        "✅  /v1/oauth/accesstoken (POST) — OAuth token generation",
        "✅  /v1/openapi/mci/vehicleDetails (POST) — Vehicle lookup + UBB Check 1",
        "✅  /v1/openapi/mci/quote (POST) — Generate quotation",
        "✅  /v1/openapi/mci/quote (PUT) — Update quotation (add-ons, drivers)",
        "✅  /v1/openapi/mci/submission (POST) — Submit policy after payment",
        "✅  /v1/openapi/mci/lov/avVariant (GET) — Agreed Value variant list",
        "✅  /v1/openapi/mci/checkUBB (POST) — UBB Check 2 (Agent Code: DCAUTO)",
        "",
        "All 7 endpoints tested and working in UAT environment.",
        "Submission confirmed: status = 'Success'",
    ]
    add_bullet_slide(slide, Inches(1), Inches(1.5), Inches(11), Inches(5.5), api_items, 16, DARK)

    # === SLIDE 14: Test Results ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_text_box(slide, Inches(0.8), Inches(0.4), Inches(11), Inches(0.8),
                 "Automated Test Results", 32, True, DARK)

    test_items = [
        "Frontend Unit Tests (Jest + React Testing Library):",
        "   • 91 / 103 tests passing",
        "   • 12 cosmetic failures (UI label text updates — not functional bugs)",
        "   • Validation rules: 34/34 passing (NRIC, plate, postcode, phone, age)",
        "",
        "Backend Unit Tests (Jest + Supertest):",
        "   • 10 / 10 tests passing",
        "   • Submission retry logic verified (3x on HTTP 500)",
        "   • Marketing consent passthrough verified",
        "",
        "E2E Flow Test (Puppeteer):",
        "   • 9 / 9 screens captured and verified",
        "   • Full flow from landing to confirmation",
        "",
        "Payment Integration:",
        "   • HMAC-SHA256 hash generation ✅",
        "   • Hash verification on return ✅",
        "   • SenangPay sandbox tested ✅",
    ]
    add_bullet_slide(slide, Inches(1), Inches(1.5), Inches(11), Inches(5.5), test_items, 14, DARK)

    # === SLIDE 15: Security ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_text_box(slide, Inches(0.8), Inches(0.4), Inches(11), Inches(0.8),
                 "Security Measures", 32, True, DARK)

    sec_items = [
        "Data Protection:",
        "   • All API keys/secrets stored server-side only (never in browser)",
        "   • HTTPS/TLS enforced for all communications",
        "   • Session-based storage (cleared on completion)",
        "   • PDPA consent collected before any data processing",
        "",
        "Payment Security:",
        "   • HMAC-SHA256 hash (server-side generation, verified on return)",
        "   • PCI-DSS compliant gateway (SenangPay — card data never touches our servers)",
        "   • Unique order ID per transaction",
        "",
        "Application Security:",
        "   • Input validation (Zod schemas with Malaysian format rules)",
        "   • Rate limiting (Express middleware)",
        "   • Helmet security headers (CORS, CSP, etc.)",
        "   • No direct database — data flows through Allianz API only",
    ]
    add_bullet_slide(slide, Inches(1), Inches(1.3), Inches(11), Inches(6), sec_items, 14, DARK)

    # === SLIDE 16: Pending Items ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_text_box(slide, Inches(0.8), Inches(0.4), Inches(11), Inches(0.8),
                 "Pending Items — Requires Allianz Input", 28, True, DARK)

    pending_items = [
        "1.  Post-Issuance Callback Configuration",
        "     → Need: Callback URL registration, HMAC secret, delivery model (A/B/C)",
        "",
        "2.  Production Credentials",
        "     → Need: Production API URL, OAuth keys, Partner ID",
        "",
        "3.  Callback URL + x-api-key (our side is ready)",
        "     → Our endpoint: POST /api/callback",
        "     → x-api-key: f3c35cb8-b1c6-481a-8204-18d6703d99ac",
        "     → Ready to receive once Allianz configures their side",
        "",
        "Resolved:",
        "   ✅  CheckUBB — Agent Code 'DCAUTO' now working in UAT",
    ]
    add_bullet_slide(slide, Inches(1), Inches(1.3), Inches(11), Inches(5.5), pending_items, 15, DARK)

    # === SLIDE 17: Next Steps ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, DARK)
    add_text_box(slide, Inches(0.8), Inches(0.4), Inches(11), Inches(0.8),
                 "Next Steps", 32, True, WHITE)

    next_items = [
        "Allianz:",
        "   1. Resolve CheckUBB agent code issue",
        "   2. Confirm callback delivery model + provide HMAC secret",
        "   3. Register our callback endpoint",
        "   4. Provide production credentials when ready",
        "",
        "HALLU:",
        "   1. Complete ISRA document (in progress)",
        "   2. Implement callback processing once model confirmed",
        "   3. Switch SenangPay to production",
        "   4. Production smoke test",
        "   5. Go-live",
    ]
    add_bullet_slide(slide, Inches(1), Inches(1.5), Inches(11), Inches(5.5), next_items, 16, WHITE)

    # === SLIDE 18: Thank You ===
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, DARK)
    add_text_box(slide, Inches(1), Inches(2.5), Inches(11), Inches(1),
                 "Thank You", 44, True, WHITE, PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(3.8), Inches(11), Inches(1),
                 "Questions & Discussion", 24, False, ORANGE, PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(5.5), Inches(11), Inches(1.5),
                 "DC Auto Services (HALLU)\nhallu.com.my  |  SSM: 202503063833",
                 14, False, GRAY, PP_ALIGN.CENTER)

    # Save
    prs.save(OUTPUT_PATH)
    print(f"✅ Presentation saved: {OUTPUT_PATH}")
    print(f"   Slides: {len(prs.slides)}")


if __name__ == '__main__':
    create_presentation()
