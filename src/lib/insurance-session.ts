/** Session keys for the DC Auto → Allianz quotation journey. */
export const INSURANCE_FORM_DATA_KEY = 'insuranceFormData';
export const INSURANCE_FORM_DRAFT_KEY = 'insuranceFormDraft';
export const ALLIANZ_IS_DEMO_KEY = 'allianz_isDemo';
export const BLOCKED_VEHICLE_LOOKUP_KEY = 'allianz_blockedVehicleLookup';
export const COMPLETED_JOURNEY_KEY = 'hallu_completedJourney';

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

export interface CompletedJourney {
  contractNumber: string;
  completedAt: number;
}

/** Set once payment is verified; quote/checkout pages redirect to thank-you while it is present. */
export function markJourneyCompleted(contractNumber: string, now: number = Date.now()): void {
  if (typeof sessionStorage === 'undefined') return;
  const record: CompletedJourney = { contractNumber, completedAt: now };
  sessionStorage.setItem(COMPLETED_JOURNEY_KEY, JSON.stringify(record));
}

export function getCompletedJourney(): CompletedJourney | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(COMPLETED_JOURNEY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CompletedJourney>;
    return {
      contractNumber: typeof parsed.contractNumber === 'string' ? parsed.contractNumber : '',
      completedAt: typeof parsed.completedAt === 'number' ? parsed.completedAt : 0,
    };
  } catch {
    // A paid journey must stay locked even if the record is unreadable.
    return { contractNumber: '', completedAt: 0 };
  }
}

export function clearCompletedJourney(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(COMPLETED_JOURNEY_KEY);
}

const PAID_JOURNEY_KEYS = [
  'allianz_vehicleDetails',
  'allianz_quotation',
  'allianz_selectedNvic',
  'allianz_noOfClaims',
  'allianz_addonInputs',
  'allianz_selectedAddons',
  'allianz_driverPlan',
  'allianz_driverPlanCost',
  'allianz_additionalDrivers',
  'allianz_ehailingDriver',
  'allianz_customerDetails',
  'allianz_marketingConsent',
  'allianz_ubbResult',
  'policyAccessToken',
] as const;

/** Called when the user submits a new quote form; only resets state if the previous journey was paid. */
export function startNewJourneyAfterPayment(): void {
  if (typeof sessionStorage === 'undefined') return;
  if (getCompletedJourney() === null) return;
  for (const key of PAID_JOURNEY_KEYS) {
    sessionStorage.removeItem(key);
  }
  clearCompletedJourney();
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
