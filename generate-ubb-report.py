#!/usr/bin/env python3
"""Generate PDF report for Allianz UBB CheckUBB issue."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Preformatted, HRFlowable
)
from reportlab.lib.enums import TA_LEFT
import json
from datetime import datetime

OUTPUT_PATH = "/Users/amirulhakim/pj-insrnce/UBB-CheckUBB-Report.pdf"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name='CodeBlock',
    parent=styles['Normal'],
    fontName='Courier',
    fontSize=8,
    leading=10,
    leftIndent=10,
    backColor=HexColor('#f5f5f5'),
    borderColor=HexColor('#e0e0e0'),
    borderWidth=0.5,
    borderPadding=8,
))
styles.add(ParagraphStyle(
    name='SectionTitle',
    parent=styles['Heading2'],
    textColor=HexColor('#003781'),
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    name='SubInfo',
    parent=styles['Normal'],
    fontSize=9,
    textColor=HexColor('#555555'),
    spaceAfter=4,
))

REQUEST_JSON = {
    "ReferenceNo": "CNAZ00005135846",
    "ProductCat": "MPC",
    "SourceSystem": "DCAUTO",
    "ClaimsExp": "0",
    "ReconInd": "N",
    "ExcessWaiveInd": False,
    "CheckUbbInd": 2,
    "Policy": {
        "PolicyEffectiveDate": "2026-08-23",
        "PolicyExpiryDate": "2027-08-22",
        "Client": {
            "IdentificationNumber": "881124566261",
            "IdType": "NRIC",
            "Age": "37"
        },
        "RiskList": [{
            "RiskId": "1",
            "InsuredPerson": {
                "IdentificationNumber": "881124566261",
                "IdType": "NRIC"
            },
            "Vehicle": {
                "AvCode": "",
                "Capacity": "1496",
                "MakeCode": "PERODUA",
                "Model": "BEZZA",
                "PiamModel": "BEZZA",
                "Seat": 5,
                "VehicleNo": "VMW4196",
                "YearOfManufacture": "2020",
                "NamedDriverList": [],
                "HighPerformanceInd": False,
                "HrtvInd": False
            },
            "CoverList": [{
                "CoverPremium": {
                    "SumInsured": "35600.00"
                }
            }]
        }]
    }
}

RESPONSE_JSON = {
    "Status": 500,
    "Error": "Invalid Agent Code"
}


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=20*mm, bottomMargin=20*mm
    )
    story = []

    # Title
    story.append(Paragraph("Allianz Motor Insurance OpenAPI — CheckUBB Issue Report", styles['Title']))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Date: {datetime.now().strftime('%d %B %Y')}", styles['SubInfo']))
    story.append(Paragraph("Partner: DC AUTO SERVICES (HALLU)", styles['SubInfo']))
    story.append(Paragraph("Partner ID / SourceSystem: DCAUTO", styles['SubInfo']))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#003781')))
    story.append(Spacer(1, 12))

    # Summary
    story.append(Paragraph("1. Issue Summary", styles['SectionTitle']))
    story.append(Paragraph(
        'The <b>/v1/openapi/mci/checkUBB</b> endpoint returns <font color="#cc0000"><b>"Invalid Agent Code"</b></font> '
        'when called with <b>SourceSystem: "DCAUTO"</b> (as confirmed by Allianz team). '
        'This prevents us from completing the UBB Check 2 step before quote generation.',
        styles['Normal']
    ))
    story.append(Spacer(1, 12))

    # Details table
    story.append(Paragraph("2. Request Details", styles['SectionTitle']))
    details = [
        ["Field", "Value"],
        ["Endpoint", "POST /v1/openapi/mci/checkUBB"],
        ["Environment", "UAT (asia-uat-malaysia.apis.allianz.com)"],
        ["SourceSystem", "DCAUTO"],
        ["CheckUbbInd", "2"],
        ["ProductCat", "MPC"],
        ["X-Request-ID", "ff9b9820-f44c-4b24-b605-1420fc4d0570"],
        ["Tested On", "21 July 2026, 9:09 PM (UTC+8)"],
    ]
    t = Table(details, colWidths=[120, 340])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#003781')),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#fafafa')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 16))

    # Request JSON
    story.append(Paragraph("3. Full Request Payload (JSON)", styles['SectionTitle']))
    req_text = json.dumps(REQUEST_JSON, indent=2)
    story.append(Preformatted(req_text, styles['CodeBlock']))
    story.append(Spacer(1, 16))

    # Response JSON
    story.append(Paragraph("4. Response Received", styles['SectionTitle']))
    res_text = json.dumps(RESPONSE_JSON, indent=2)
    story.append(Preformatted(res_text, styles['CodeBlock']))
    story.append(Spacer(1, 16))

    # Notes
    story.append(Paragraph("5. Additional Notes", styles['SectionTitle']))
    notes = [
        "• SourceSystem has been set to <b>DCAUTO</b> as confirmed by Allianz team.",
        "• The same error occurs regardless of whether SourceSystem is DCAUTO or PTR.",
        "• All other endpoints (vehicleDetails, generateQuote, updateQuote, submission) work correctly with the same Partner ID.",
        "• UBB Check 1 (via vehicleDetails with checkUbbInd:1) also works without issues.",
        "• Only CheckUBB endpoint (Ind 2) returns this error.",
    ]
    for note in notes:
        story.append(Paragraph(note, styles['Normal']))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 16))

    # Callback URL
    story.append(Paragraph("6. UAT Callback URL", styles['SectionTitle']))
    story.append(Paragraph(
        "Please configure the following callback URL on your end for UAT:",
        styles['Normal']
    ))
    story.append(Spacer(1, 8))

    callback_details = [
        ["Field", "Value"],
        ["Callback URL", "http://gentle-emerald-armadillo.103-10-78-80.cpanel.site/pj-insurance/api/callback"],
        ["Method", "POST"],
        ["Content-Type", "application/json"],
        ["Expected Response", '{ "received": true, "timestamp": "..." }'],
    ]
    ct = Table(callback_details, colWidths=[120, 340])
    ct.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#003781')),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#fafafa')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(ct)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Please also confirm:", styles['Normal']))
    story.append(Spacer(1, 4))
    callback_questions = [
        "• The HMAC secret/key for signature verification",
        "• The header name used for the HMAC signature (e.g., X-Allianz-Signature)",
        "• The callback payload structure (fields included in the POST body)",
    ]
    for q in callback_questions:
        story.append(Paragraph(q, styles['Normal']))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 16))

    # Action requested
    story.append(Paragraph("7. Action Requested", styles['SectionTitle']))
    actions = [
        "• <b>CheckUBB:</b> Investigate the \"Invalid Agent Code\" error for Partner ID DCAUTO in UAT.",
        "• <b>Callback:</b> Configure the UAT callback URL above and share the HMAC secret and payload structure.",
    ]
    for a in actions:
        story.append(Paragraph(a, styles['Normal']))
        story.append(Spacer(1, 4))

    doc.build(story)
    print(f"PDF generated: {OUTPUT_PATH}")


if __name__ == '__main__':
    build_pdf()
