import { vehicleDataNotFoundWithGuidance } from '@/lib/vehicle-lookup-messages';
import { UBB_REFER_MESSAGES } from '@/types/allianz';

export class AllianzApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string;
  readonly allianzErrors: string[];
  readonly userMessage: string;

  constructor(params: {
    status: number;
    code: string;
    requestId: string;
    allianzErrors: string[];
    userMessage: string;
    cause?: string;
  }) {
    super(params.cause ?? params.userMessage);
    this.name = 'AllianzApiError';
    this.status = params.status;
    this.code = params.code;
    this.requestId = params.requestId;
    this.allianzErrors = params.allianzErrors;
    this.userMessage = params.userMessage;
  }
}

export function maskPlate(plate: string): string {
  const p = plate.replace(/\s/g, '').toUpperCase();
  if (p.length <= 4) return '****';
  return `${p.slice(0, 2)}***${p.slice(-2)}`;
}

export function extractAllianzErrors(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  if (Array.isArray(record.errors)) {
    return record.errors.filter((e): e is string => typeof e === 'string' && e.length > 0);
  }
  if (typeof record.message === 'string' && record.message.trim()) {
    return [record.message.trim()];
  }
  if (typeof record.error === 'string' && record.error.trim()) {
    return [record.error.trim()];
  }
  return [];
}

/** Map Allianz vehicleDetails business errors to user-safe copy. */
export function mapVehicleDetailsError(
  allianzErrors: string[],
  plate?: string,
): {
  code: string;
  userMessage: string;
} {
  const blob = allianzErrors.join(' ').toLowerCase();
  const guidance = UBB_REFER_MESSAGES.ID_MISMATCH;

  if (
    blob.includes('data not found') ||
    blob.includes('vehicle data not found') ||
    blob.includes('no data found')
  ) {
    return {
      code: 'VEHICLE_LOOKUP_NOT_FOUND',
      userMessage: plate
        ? vehicleDataNotFoundWithGuidance(plate, guidance)
        : guidance,
    };
  }

  if (blob.includes('id') && blob.includes('match')) {
    return {
      code: 'VEHICLE_ID_MISMATCH',
      userMessage: plate
        ? vehicleDataNotFoundWithGuidance(plate, guidance)
        : guidance,
    };
  }

  return {
    code: 'ALLIANZ_BUSINESS_ERROR',
    userMessage: allianzErrors.join('; '),
  };
}

export function toClientErrorPayload(err: AllianzApiError, plate?: string) {
  return {
    status: err.status,
    code: err.code,
    message: err.userMessage,
    requestId: err.requestId,
    ...(plate ? { plateNumber: plate } : {}),
  };
}
