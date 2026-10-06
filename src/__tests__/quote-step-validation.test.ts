import {
  validateEhailingDriver,
  validateQuotationStepBeforeProceed,
} from '@/lib/quote-step-validation';
import { isDemoContract } from '@/lib/server/demo-mode';

describe('validateEhailingDriver', () => {
  it('requires name and ID', () => {
    const errors = validateEhailingDriver({ fullName: '', idNumber: '' });
    expect(errors.fullName).toBeDefined();
    expect(errors.idNumber).toBeDefined();
  });

  it('accepts valid input', () => {
    expect(
      validateEhailingDriver({ fullName: 'AHMAD BIN ALI', idNumber: '841103-01-1116' }),
    ).toEqual({});
  });
});

describe('demo contract helper', () => {
  it('identifies UAT demo contract number', () => {
    expect(isDemoContract('CNAZ00004272328')).toBe(true);
  });
});

describe('validateQuotationStepBeforeProceed', () => {
  it('blocks proceed when A202 is selected but e-Hailing driver is empty', () => {
    const result = validateQuotationStepBeforeProceed({
      selectedAddons: new Set(['A202']),
      ehailingDriver: { fullName: '', idNumber: '' },
      driverPlan: '0',
      additionalDrivers: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.focusTarget).toBe('ehailing');
      expect(result.ehailingErrors?.fullName).toBeDefined();
    }
  });

  it('allows proceed when A202 is not selected', () => {
    expect(
      validateQuotationStepBeforeProceed({
        selectedAddons: new Set(['89']),
        ehailingDriver: { fullName: '', idNumber: '' },
        driverPlan: '0',
        additionalDrivers: [],
      }).ok,
    ).toBe(true);
  });

  it('requires additional driver details for plan 1', () => {
    const result = validateQuotationStepBeforeProceed({
      selectedAddons: new Set(),
      ehailingDriver: { fullName: '', idNumber: '' },
      driverPlan: '1',
      additionalDrivers: [{ fullName: '', idNumber: '' }],
    });
    expect(result.ok).toBe(false);
  });
});
