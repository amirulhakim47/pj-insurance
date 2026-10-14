/** Session keys for the DC Auto → Allianz quotation journey. */
export const INSURANCE_FORM_DATA_KEY = 'insuranceFormData';
export const INSURANCE_FORM_DRAFT_KEY = 'insuranceFormDraft';
export const ALLIANZ_IS_DEMO_KEY = 'allianz_isDemo';
export const BLOCKED_VEHICLE_LOOKUP_KEY = 'allianz_blockedVehicleLookup';

/** Allianz/ISM blocks do not clear within minutes; avoids repeat lookups that each open a new contract. */
export const BLOCKED_VEHICLE_LOOKUP_TTL_MS = 30 * 60 * 1000;

/** Copy submitted step-1 data back into the form draft so `/quote` can repopulate fields. */
export function restoreInsuranceFormDraftFromSubmitted(): void {
  if (typeof sessionStorage === 'undefined') return;
  const submitted = sessionStorage.getItem(INSURANCE_FORM_DATA_KEY);
  if (!submitted) return;
  sessionStorage.setItem(INSURANCE_FORM_DRAFT_KEY, submitted);
}

export function vehicleDetailsPagePath(options?: { demo?: boolean }): string {
  return options?.demo ? '/quote?demo=true' : '/quote';
}

interface VehicleLookupIdentity {
  plateNumber: string;
  identityNumber: string;
}

export interface BlockedVehicleLookup {
  code: string;
  message: string;
  requestId?: string;
}

interface StoredBlockedVehicleLookup extends BlockedVehicleLookup {
  lookupKey: string;
  blockedAt: number;
}

function vehicleLookupKey({ plateNumber, identityNumber }: VehicleLookupIdentity): string {
  const plate = plateNumber.toUpperCase().replace(/\s/g, '');
  const id = identityNumber.toUpperCase().replace(/[\s-]/g, '');
  return `${plate}|${id}`;
}

export function rememberBlockedVehicleLookup(
  lookup: VehicleLookupIdentity & BlockedVehicleLookup,
  now: number = Date.now(),
): void {
  if (typeof sessionStorage === 'undefined') return;
  const stored: StoredBlockedVehicleLookup = {
    lookupKey: vehicleLookupKey(lookup),
    blockedAt: now,
    code: lookup.code,
    message: lookup.message,
    ...(lookup.requestId ? { requestId: lookup.requestId } : {}),
  };
  sessionStorage.setItem(BLOCKED_VEHICLE_LOOKUP_KEY, JSON.stringify(stored));
}

export function findBlockedVehicleLookup(
  lookup: VehicleLookupIdentity,
  now: number = Date.now(),
): BlockedVehicleLookup | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(BLOCKED_VEHICLE_LOOKUP_KEY);
  if (!raw) return null;

  let stored: StoredBlockedVehicleLookup;
  try {
    stored = JSON.parse(raw) as StoredBlockedVehicleLookup;
  } catch {
    sessionStorage.removeItem(BLOCKED_VEHICLE_LOOKUP_KEY);
    return null;
  }

  if (now - stored.blockedAt > BLOCKED_VEHICLE_LOOKUP_TTL_MS) {
    sessionStorage.removeItem(BLOCKED_VEHICLE_LOOKUP_KEY);
    return null;
  }
  if (stored.lookupKey !== vehicleLookupKey(lookup)) return null;

  return {
    code: stored.code,
    message: stored.message,
    ...(stored.requestId ? { requestId: stored.requestId } : {}),
  };
}
