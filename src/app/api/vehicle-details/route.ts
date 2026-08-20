import { NextRequest, NextResponse } from 'next/server';
import { getVehicleDetails } from '@/lib/server/allianz-api';

export async function POST(req: NextRequest) {
  try {
    const { plateNumber, identityNumber, identityType = 'NRIC', postalCode } = await req.json();

    if (!plateNumber || !identityNumber) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'plateNumber and identityNumber are required' },
        { status: 400 },
      );
    }

    if (typeof plateNumber !== 'string' || typeof identityNumber !== 'string') {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'plateNumber and identityNumber must be strings' },
        { status: 400 },
      );
    }

    if (!/^[A-Za-z0-9\s]{1,20}$/.test(plateNumber)) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid plate number format' },
        { status: 400 },
      );
    }

    const partnerId = process.env.ALLIANZ_PARTNER_ID ?? '';
    const result = await getVehicleDetails({
      sourceSystem: partnerId,
      vehicleLicenseId: plateNumber.toUpperCase().replace(/\s/g, ''),
      identityType,
      identityNumber: identityNumber.replace(/-/g, ''),
      checkUbbInd: 1,
      ...(postalCode ? { postalCode } : {}),
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[vehicle-details] Error:', err.message);
    const status = err.status || err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return NextResponse.json(data, { status });
  }
}
