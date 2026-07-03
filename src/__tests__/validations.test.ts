import {
  insuranceFormSchema,
  customerDetailsSchema,
  validateNRIC,
  validateAge,
  validatePlateNumber,
  validatePostcode,
  formatNRIC,
  formatPlateNumber,
} from '@/lib/validations';

describe('insuranceFormSchema', () => {
  const validFormData = {
    fullName: 'Ahmad Bin Ibrahim',
    vehicleType: 'car' as const,
    identityType: 'NRIC' as const,
    nric: '841103-01-1116',
    plateNumber: 'ABC1234',
    postcode: '50000',
    phoneNumber: '0121234567',
    email: 'test@example.com',
    customerType: 'individual' as const,
    isEhailing: false,
    isElectricVehicle: false,
    pdpaConsent: true,
  };

  it('accepts valid form data', () => {
    const result = insuranceFormSchema.safeParse(validFormData);
    expect(result.success).toBe(true);
  });

  it('transforms fullName to uppercase', () => {
    const result = insuranceFormSchema.safeParse(validFormData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe('AHMAD BIN IBRAHIM');
    }
  });

  it('rejects empty full name', () => {
    const result = insuranceFormSchema.safeParse({ ...validFormData, fullName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid NRIC format', () => {
    const result = insuranceFormSchema.safeParse({ ...validFormData, nric: '123456' });
    expect(result.success).toBe(false);
  });

  it('rejects NRIC with invalid date (month 13)', () => {
    const result = insuranceFormSchema.safeParse({ ...validFormData, nric: '841303-01-1116' });
    expect(result.success).toBe(false);
  });

  it('rejects NRIC with invalid date (day 32)', () => {
    const result = insuranceFormSchema.safeParse({ ...validFormData, nric: '841132-01-1116' });
    expect(result.success).toBe(false);
  });

  it('rejects age below 16', () => {
    // Born in 2015 would make them ~11 years old
    const result = insuranceFormSchema.safeParse({ ...validFormData, nric: '150103-01-1116' });
    expect(result.success).toBe(false);
  });

  it('rejects age above 80', () => {
    // Born in 1940 would make them ~86 years old
    const result = insuranceFormSchema.safeParse({ ...validFormData, nric: '400103-01-1116' });
    expect(result.success).toBe(false);
  });

  it('accepts valid age (25 years old)', () => {
    // Born in 2001 = ~25 years old
    const result = insuranceFormSchema.safeParse({ ...validFormData, nric: '010103-01-1116' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid plate number', () => {
    const result = insuranceFormSchema.safeParse({ ...validFormData, plateNumber: '!!!!' });
    expect(result.success).toBe(false);
  });

  it('rejects postcode with wrong length', () => {
    const result = insuranceFormSchema.safeParse({ ...validFormData, postcode: '1234' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone number', () => {
    const result = insuranceFormSchema.safeParse({ ...validFormData, phoneNumber: '1234' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = insuranceFormSchema.safeParse({ ...validFormData, email: 'notanemail' });
    expect(result.success).toBe(false);
  });

  it('rejects when pdpaConsent is false', () => {
    const result = insuranceFormSchema.safeParse({ ...validFormData, pdpaConsent: false });
    expect(result.success).toBe(false);
  });
});

describe('customerDetailsSchema', () => {
  const validCustomerDetails = {
    fullName: 'Ahmad Bin Ibrahim',
    identityType: 'NRIC' as const,
    identityNumber: '841103011116',
    nationality: 'MALAYSIA',
    dateOfBirth: '1984-11-03',
    gender: 'M' as const,
    maritalStatus: '1' as const,
    mobilePrefix: '6012',
    mobileNumber: '3456789',
    email: 'test@example.com',
    addressLine1: '123 Jalan Test',
    addressLine2: '',
    addressLine3: '',
    postcode: '50000',
    city: 'Kuala Lumpur',
    state: 'W.P. Kuala Lumpur',
  };

  it('accepts valid customer details', () => {
    const result = customerDetailsSchema.safeParse(validCustomerDetails);
    expect(result.success).toBe(true);
  });

  it('transforms fullName to uppercase', () => {
    const result = customerDetailsSchema.safeParse(validCustomerDetails);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe('AHMAD BIN IBRAHIM');
    }
  });

  it('transforms addressLine1 to uppercase', () => {
    const result = customerDetailsSchema.safeParse(validCustomerDetails);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.addressLine1).toBe('123 JALAN TEST');
    }
  });

  it('rejects address line exceeding 100 characters', () => {
    const longAddress = 'A'.repeat(101);
    const result = customerDetailsSchema.safeParse({
      ...validCustomerDetails,
      addressLine1: longAddress,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid mobile prefix', () => {
    const result = customerDetailsSchema.safeParse({
      ...validCustomerDetails,
      mobilePrefix: '6020',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mobile number with wrong length (too short)', () => {
    const result = customerDetailsSchema.safeParse({
      ...validCustomerDetails,
      mobileNumber: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mobile number with wrong length (too long)', () => {
    const result = customerDetailsSchema.safeParse({
      ...validCustomerDetails,
      mobileNumber: '123456789',
    });
    expect(result.success).toBe(false);
  });

  it('accepts 7-digit mobile number', () => {
    const result = customerDetailsSchema.safeParse({
      ...validCustomerDetails,
      mobileNumber: '1234567',
    });
    expect(result.success).toBe(true);
  });

  it('accepts 8-digit mobile number', () => {
    const result = customerDetailsSchema.safeParse({
      ...validCustomerDetails,
      mobileNumber: '12345678',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty addressLine1', () => {
    const result = customerDetailsSchema.safeParse({
      ...validCustomerDetails,
      addressLine1: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid postcode', () => {
    const result = customerDetailsSchema.safeParse({
      ...validCustomerDetails,
      postcode: '123',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional city and state', () => {
    const result = customerDetailsSchema.safeParse({
      ...validCustomerDetails,
      city: undefined,
      state: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid marital status', () => {
    const result = customerDetailsSchema.safeParse({
      ...validCustomerDetails,
      maritalStatus: '5',
    });
    expect(result.success).toBe(false);
  });
});

describe('validateNRIC', () => {
  it('returns true for valid NRIC', () => {
    expect(validateNRIC('841103-01-1116')).toBe(true);
  });

  it('returns false for invalid format', () => {
    expect(validateNRIC('12345')).toBe(false);
  });

  it('returns false for invalid date', () => {
    expect(validateNRIC('841303-01-1116')).toBe(false);
  });

  it('returns false for age outside 16-80', () => {
    expect(validateNRIC('150103-01-1116')).toBe(false);
  });
});

describe('validateAge', () => {
  it('returns valid=true and correct age for valid NRIC', () => {
    const result = validateAge('841103-01-1116');
    expect(result.valid).toBe(true);
    expect(result.age).toBeGreaterThanOrEqual(41);
    expect(result.age).toBeLessThanOrEqual(42);
  });

  it('returns valid=false for too young', () => {
    const result = validateAge('150103-01-1116');
    expect(result.valid).toBe(false);
    expect(result.age).toBeLessThan(16);
  });

  it('returns valid=false for too old', () => {
    const result = validateAge('400103-01-1116');
    expect(result.valid).toBe(false);
    expect(result.age).toBeGreaterThan(80);
  });

  it('returns valid=false for invalid input', () => {
    const result = validateAge('abc');
    expect(result.valid).toBe(false);
    expect(result.age).toBe(0);
  });
});

describe('validatePlateNumber', () => {
  it('returns true for valid plate numbers', () => {
    expect(validatePlateNumber('ABC1234')).toBe(true);
    expect(validatePlateNumber('WA1234')).toBe(true);
    expect(validatePlateNumber('V1')).toBe(true);
  });

  it('returns false for invalid plate numbers', () => {
    expect(validatePlateNumber('')).toBe(false);
    expect(validatePlateNumber('1234')).toBe(false);
  });
});

describe('validatePostcode', () => {
  it('returns true for valid 5-digit postcodes', () => {
    expect(validatePostcode('50000')).toBe(true);
    expect(validatePostcode('43000')).toBe(true);
  });

  it('returns false for invalid postcodes', () => {
    expect(validatePostcode('1234')).toBe(false);
    expect(validatePostcode('123456')).toBe(false);
    expect(validatePostcode('abcde')).toBe(false);
  });
});

describe('formatNRIC', () => {
  it('formats 12 digits correctly', () => {
    expect(formatNRIC('841103011116')).toBe('841103-01-1116');
  });

  it('formats partial input correctly', () => {
    expect(formatNRIC('841103')).toBe('841103');
    expect(formatNRIC('84110301')).toBe('841103-01');
  });

  it('strips non-digit characters before formatting', () => {
    expect(formatNRIC('84-11-03-01-11-16')).toBe('841103-01-1116');
  });
});

describe('formatPlateNumber', () => {
  it('converts to uppercase', () => {
    expect(formatPlateNumber('abc1234')).toBe('ABC1234');
  });

  it('trims whitespace', () => {
    expect(formatPlateNumber('  ABC 1234  ')).toBe('ABC 1234');
  });

  it('collapses multiple spaces', () => {
    expect(formatPlateNumber('ABC   1234')).toBe('ABC 1234');
  });
});
