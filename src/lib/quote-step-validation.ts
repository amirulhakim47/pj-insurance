const PERSON_NAME_REGEX = /^[\p{L}\s'.@/-]+$/u;
const ID_NUMBER_REGEX = /^[A-Za-z0-9-]{4,20}$/;

export interface EhailingDriverInput {
  fullName: string;
  idNumber: string;
}

export interface AdditionalDriverInput {
  fullName: string;
  idNumber: string;
}

export type QuotationStepFocusTarget = 'ehailing' | 'additionalDrivers';

export type QuotationStepValidationResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      focusTarget?: QuotationStepFocusTarget;
      ehailingErrors?: { fullName?: string; idNumber?: string };
    };

export function validateEhailingDriver(
  driver: EhailingDriverInput,
): { fullName?: string; idNumber?: string } {
  const errors: { fullName?: string; idNumber?: string } = {};
  const name = driver.fullName.trim();
  const id = driver.idNumber.trim().replace(/\s/g, '');

  if (!name) {
    errors.fullName = 'Driver name is required';
  } else if (name.length < 2) {
    errors.fullName = 'Enter at least 2 characters';
  } else if (!PERSON_NAME_REGEX.test(name)) {
    errors.fullName = 'Name must not contain invalid characters';
  }

  if (!id) {
    errors.idNumber = 'ID number is required';
  } else if (!ID_NUMBER_REGEX.test(id)) {
    errors.idNumber = 'Enter a valid ID (4–20 letters or numbers)';
  }

  return errors;
}

export function validateQuotationStepBeforeProceed(params: {
  selectedAddons: Set<string> | string[];
  ehailingDriver: EhailingDriverInput;
  driverPlan: '0' | '1' | '2' | 'unlimited';
  additionalDrivers: AdditionalDriverInput[];
  isUpdatingQuote?: boolean;
  pendingAddonSync?: boolean;
}): QuotationStepValidationResult {
  if (params.isUpdatingQuote || params.pendingAddonSync) {
    return {
      ok: false,
      message: 'Please wait while your quote finishes updating.',
    };
  }

  const selected = params.selectedAddons instanceof Set
    ? params.selectedAddons
    : new Set(params.selectedAddons);

  if (selected.has('A202')) {
    const ehailingErrors = validateEhailingDriver(params.ehailingDriver);
    if (Object.keys(ehailingErrors).length > 0) {
      return {
        ok: false,
        message: 'Complete the e-Hailing driver details before continuing.',
        focusTarget: 'ehailing',
        ehailingErrors,
      };
    }
  }

  if (params.driverPlan === '1' || params.driverPlan === '2') {
    for (let i = 0; i < params.additionalDrivers.length; i++) {
      const d = params.additionalDrivers[i];
      if (!d.fullName.trim()) {
        return {
          ok: false,
          message: `Additional driver ${i + 1}: name is required.`,
          focusTarget: 'additionalDrivers',
        };
      }
      if (!d.idNumber.trim()) {
        return {
          ok: false,
          message: `Additional driver ${i + 1}: ID number is required.`,
          focusTarget: 'additionalDrivers',
        };
      }
    }
  }

  return { ok: true };
}
