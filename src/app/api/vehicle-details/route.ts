import { NextRequest, NextResponse } from 'next/server';
import { getVehicleDetails, getAllianzApiHost } from '@/lib/server/allianz-api';
import { AllianzApiError, maskPlate, toClientErrorPayload } from '@/lib/server/allianz-errors';
import { logAllianz } from '@/lib/server/allianz-log';
import { isConfigured } from '@/lib/server/allianz-auth';

export async function POST(req: NextRequest) {
  const started = Date.now();
  let normalizedPlate: string | undefined;

  try {
    if (!isConfigured()) {
      logAllianz('error', 'vehicle_details_config', {
        reason: 'missing_allianz_credentials',
      });
      return NextResponse.json(
        {
          status: 503,
          code: 'CONFIG_ERROR',
          message: 'Allianz API is not configured on the server. Please contact support.',
        },
        { status: 503 },
      );
    }

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

    const partnerId = process.env.ALLIANZ_PARTNER_ID?.trim() ?? '';
    if (!partnerId) {
      logAllianz('error', 'vehicle_details_config', {
        reason: 'missing_ALLIANZ_PARTNER_ID',
        apiHost: getAllianzApiHost(),
      });
      return NextResponse.json(
        {
          status: 503,
          code: 'CONFIG_ERROR',
          message: 'Partner configuration is missing on the server. Please contact support.',
        },
        { status: 503 },
      );
    }

    normalizedPlate = plateNumber.toUpperCase().replace(/\s/g, '');
    logAllianz('info', 'vehicle_details_lookup', {
      plate: maskPlate(normalizedPlate),
      identityType,
      hasPostalCode: Boolean(postalCode),
      apiHost: getAllianzApiHost(),
      partnerId,
    });

    const result = await getVehicleDetails({
      sourceSystem: partnerId,
      vehicleLicenseId: normalizedPlate,
      identityType,
      identityNumber: identityNumber.replace(/-/g, ''),
      checkUbbInd: 1,
      ...(postalCode ? { postalCode } : {}),
    });

    logAllianz('info', 'vehicle_details_success', {
      plate: maskPlate(normalizedPlate),
      durationMs: Date.now() - started,
      contractNumber:
        result && typeof result === 'object' && 'contractNumber' in result
          ? (result as { contractNumber?: string }).contractNumber
          : undefined,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof AllianzApiError) {
      logAllianz('error', 'vehicle_details_failed', {
        code: err.code,
        requestId: err.requestId,
        allianzErrors: err.allianzErrors,
        durationMs: Date.now() - started,
        apiHost: getAllianzApiHost(),
      });
      const payload = toClientErrorPayload(err, normalizedPlate);
      return NextResponse.json(payload, {
        status: err.status,
        headers: { 'X-Request-ID': err.requestId },
      });
    }

    const message = err instanceof Error ? err.message : 'Unknown error';
    logAllianz('error', 'vehicle_details_unexpected', { message });
    return NextResponse.json(
      { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch vehicle details. Please try again.' },
      { status: 500 },
    );
  }
}
