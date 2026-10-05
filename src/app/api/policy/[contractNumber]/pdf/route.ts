import { NextRequest, NextResponse } from 'next/server';
import { getPolicyPdf, getPolicyMetadata } from '@/lib/server/policy-storage';
import { contractNumberFromRequest } from '@/lib/server/policy-access';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contractNumber: string }> },
) {
  try {
    const { contractNumber: rawContract } = await params;
    const access = contractNumberFromRequest(rawContract, req);
    if (!access.ok) {
      return NextResponse.json({ error: access.message }, { status: access.status });
    }

    const contractNumber = access.contractNumber;
    const metadata = await getPolicyMetadata(contractNumber);
    if (!metadata || !metadata.pdfPath) {
      return NextResponse.json({ error: 'Policy PDF not available yet' }, { status: 404 });
    }

    const pdfBuffer = await getPolicyPdf(contractNumber);
    if (!pdfBuffer) {
      return NextResponse.json({ error: 'Policy PDF file not found' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Policy_${contractNumber}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    console.error('[Policy PDF Download] Error');
    return NextResponse.json({ error: 'Failed to retrieve policy PDF' }, { status: 500 });
  }
}
