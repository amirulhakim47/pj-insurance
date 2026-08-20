import { NextRequest, NextResponse } from 'next/server';
import { getNcdDetails } from '@/lib/server/allianz-api';

export async function POST(req: NextRequest) {
  try {
    const { vehicleLicenseId, contractNumber, productCat = 'MT' } = await req.json();

    if (!vehicleLicenseId || !contractNumber) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'vehicleLicenseId and contractNumber are required' },
        { status: 400 },
      );
    }

    const partnerId = process.env.ALLIANZ_PARTNER_ID ?? '';
    const result = await getNcdDetails({
      partnerId,
      vehicleLicenseId,
      contractNumber,
      productCat,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[ncd-details] Error:', err.message);
    const status = err.status || err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return NextResponse.json(data, { status });
  }
}
