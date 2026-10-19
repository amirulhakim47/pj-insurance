import { validateNamedDriverFields, type NamedDriverFields } from '@/lib/validations';

export interface EhailingDriverInput {
  fullName: string;
  idNumber: string;
}

export interface AdditionalDriverInput extends NamedDriverFields {}

/**
 * e-Hailing driver defaults to the policyholder. Malaysian e-hailing platforms require a Malaysian
 * citizen (NRIC); passport holders are not prefilled because the driver ID field is NRIC-only.
 */
export function ehailingDriverFromPolicyholder(
  policyholder: {
    customerType?: string;
    identityType?: string;
    fullName?: string;
    nric?: string;
  } | null,
): EhailingDriverInput {
  if (
    !policyholder ||
    policyholder.customerType === 'company' ||
    policyholder.identityType !== 'NRIC'
  ) {
    return { fullName: '', idNumber: '' };
  }
  return {
    fullName: (policyholder.fullName ?? '').trim().toUpperCase(),
    idNumber: (policyholder.nric ?? '').trim(),
  };
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

/** Optional fields when e-Hailing add-on is selected (UAT: not required). */
export function validateEhailingDriver(
  driver: EhailingDriverInput,
): { fullName?: string; idNumber?: string } {
  const name = driver.fullName.trim();
  const id = driver.idNumber.trim();
  if (!name && !id) return {};
  return validateNamedDriverFields({
    fullName: name,
    idType: 'NRIC',
    idNumber: id,
  });
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

  if (params.driverPlan === '1' || params.driverPlan === '2') {
    for (let i = 0; i < params.additionalDrivers.length; i++) {
      const d = params.additionalDrivers[i];
      const fieldErrors = validateNamedDriverFields(d);
      if (fieldErrors.fullName) {
        return {
          ok: false,
          message: `Additional driver ${i + 1}: ${fieldErrors.fullName}`,
          focusTarget: 'additionalDrivers',
        };
      }
      if (fieldErrors.idNumber) {
        return {
          ok: false,
          message: `Additional driver ${i + 1}: ${fieldErrors.idNumber}`,
          focusTarget: 'additionalDrivers',
        };
      }
    }
  }

  return { ok: true };
}
