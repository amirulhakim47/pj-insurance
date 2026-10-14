import {
  validateEhailingDriver,
  validateQuotationStepBeforeProceed,
} from '@/lib/quote-step-validation';
import { isDemoContract } from '@/lib/server/demo-mode';

describe('validateEhailingDriver', () => {
  it('returns no errors when e-Hailing fields are empty (optional)', () => {
    expect(validateEhailingDriver({ fullName: '', idNumber: '' })).toEqual({});
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
  it('allows proceed when A202 is selected without e-Hailing driver (UAT)', () => {
    expect(
      validateQuotationStepBeforeProceed({
        selectedAddons: new Set(['A202']),
        ehailingDriver: { fullName: '', idNumber: '' },
        driverPlan: '0',
        additionalDrivers: [],
      }).ok,
    ).toBe(true);
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
      additionalDrivers: [{ fullName: '', nationality: 'MALAYSIA', idType: 'NRIC', idNumber: '' }],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects invalid NRIC for additional driver', () => {
    const result = validateQuotationStepBeforeProceed({
      selectedAddons: new Set(),
      ehailingDriver: { fullName: '', idNumber: '' },
      driverPlan: '1',
      additionalDrivers: [
        {
          fullName: 'AHMAD BIN ALI',
          nationality: 'MALAYSIA',
          idType: 'NRIC',
          idNumber: '123',
        },
      ],
    });
    expect(result.ok).toBe(false);
  });
});
