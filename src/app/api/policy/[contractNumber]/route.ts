import { NextRequest, NextResponse } from 'next/server';
import { getPolicyMetadata } from '@/lib/server/policy-storage';
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

    const metadata = await getPolicyMetadata(access.contractNumber);

    if (!metadata) {
      return NextResponse.json({ ready: false });
    }

    return NextResponse.json({
      ready: true,
      contractNumber: metadata.contractNumber,
      policyNumber: metadata.policyNumber,
      status: metadata.status,
      pdfAvailable: !!metadata.pdfPath,
      receivedAt: metadata.receivedAt,
    });
  } catch {
    console.error('[Policy Status] Error');
    return NextResponse.json({ error: 'Failed to check policy status' }, { status: 500 });
  }
}
