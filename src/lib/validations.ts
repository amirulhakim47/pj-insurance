import { z } from 'zod';

export const NRIC_REGEX = /^\d{6}-\d{2}-\d{4}$/;
export const PERSON_NAME_REGEX = /^[\p{L}\s'.-]+$/u;
const PLATE_NUMBER_REGEX = /^[A-Z]{1,3}\s?\d{1,4}[A-Z]?$/i;
const POSTCODE_REGEX = /^\d{5}$/;
const PHONE_REGEX = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
const isValidNRICDate = (nric: string): boolean => {
  const match = nric.match(/^(\d{6})/);
  if (!match) return false;
  const datePart = match[1];
  const year = parseInt(datePart.substring(0, 2), 10);
  const month = parseInt(datePart.substring(2, 4), 10);
  const day = parseInt(datePart.substring(4, 6), 10);
  if (month < 1 || month > 12) return false;
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year % 4 === 0) daysInMonth[2] = 29;
  return day >= 1 && day <= daysInMonth[month];
};

const isValidAge = (nric: string): boolean => {
  const match = nric.match(/^(\d{6})/);
  if (!match) return false;
  const yy = parseInt(match[1].substring(0, 2), 10);
  const birthYear = yy > 30 ? 1900 + yy : 2000 + yy;
  const age = new Date().getFullYear() - birthYear;
  return age >= 16 && age <= 80;
};

export const DRIVER_MIN_AGE = 18;

export function isValidDriverAgeFromNric(nric: string): boolean {
  const match = nric.match(/^(\d{6})/);
  if (!match) return false;
  const yy = parseInt(match[1].substring(0, 2), 10);
  const birthYear = yy > 30 ? 1900 + yy : 2000 + yy;
  const age = new Date().getFullYear() - birthYear;
  return age >= DRIVER_MIN_AGE && age <= 80;
}

export interface NamedDriverFields {
  fullName: string;
  idType: string;
  idNumber: string;
}

export function sanitizePersonNameInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^\p{L}\s'.-]/gu, '')
    .slice(0, 100);
}

const PASSPORT_ID_REGEX = /^[A-Za-z0-9]{6,12}$/;
const OLD_IC_ID_REGEX = /^[A-Za-z0-9-]{4,20}$/;

export function formatDriverIdentityInput(idType: string, value: string): string {
  if (idType === 'NRIC') {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return formatNRIC(digits);
  }
  if (idType === 'PASS') {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12);
  }
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 20);
}

/** Re-apply formatting when ID type changes (e.g. NRIC dashes removed for passport). */
export function reformatDriverIdForTypeChange(idType: string, idNumber: string): string {
  return formatDriverIdentityInput(idType, idNumber);
}

export function validateNamedDriverFields(
  driver: NamedDriverFields,
): { fullName?: string; idNumber?: string } {
  const errors: { fullName?: string; idNumber?: string } = {};
  const name = driver.fullName.trim();
  const id = driver.idNumber.trim();
  const idDigits = id.replace(/\D/g, '');

  if (!name) {
    errors.fullName = 'Name is required';
  } else if (!PERSON_NAME_REGEX.test(name)) {
    errors.fullName = 'Name must not contain numbers or special characters';
  }

  if (!id) {
    errors.idNumber = 'ID number is required';
  } else if (driver.idType === 'NRIC') {
    if (idDigits.length !== 12) {
      errors.idNumber = 'NRIC must be exactly 12 digits';
    } else if (!NRIC_REGEX.test(id)) {
      errors.idNumber = 'Enter a valid NRIC (e.g., 123456-12-1234)';
    } else if (!isValidNRICDate(id)) {
      errors.idNumber = "Invalid birth date in NRIC (YYMMDD doesn't exist)";
    } else if (!isValidDriverAgeFromNric(id)) {
      errors.idNumber = `Driver must be at least ${DRIVER_MIN_AGE} years old`;
    }
  } else if (driver.idType === 'PASS') {
    const compact = id.replace(/\s/g, '');
    if (id.includes('-')) {
      errors.idNumber = 'Passport number must not contain dashes — re-enter for passport';
    } else if (!PASSPORT_ID_REGEX.test(compact)) {
      errors.idNumber = 'Enter a valid passport number (6–12 letters or numbers)';
    }
  } else if (driver.idType === 'OLD_IC') {
    if (!OLD_IC_ID_REGEX.test(id.replace(/\s/g, ''))) {
      errors.idNumber = 'Enter a valid Old IC number (4–20 letters, numbers, or hyphens)';
    }
  } else if (!OLD_IC_ID_REGEX.test(id.replace(/\s/g, ''))) {
    errors.idNumber = 'Enter a valid ID (4–20 characters)';
  }

  return errors;
}

const identityTypeEnum = z.enum(['NRIC', 'OLD_IC', 'PASS', 'POL', 'BR_NO']);

export const insuranceFormSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters')
      .regex(PERSON_NAME_REGEX, 'Name must not contain numbers or special characters')
      .transform((v) => v.toUpperCase()),
    vehicleType: z.enum(['car', 'motorcycle'], {
      message: 'Please select a vehicle type',
    }),
    identityType: identityTypeEnum,
    nric: z.string().min(1, 'ID number is required'),
    nationality: z.string().optional(),
    gender: z.enum(['M', 'F', 'C']).optional(),
    plateNumber: z
      .string()
      .min(1, 'Plate number is required')
      .regex(PLATE_NUMBER_REGEX, 'Please enter a valid plate number (e.g., ABC1234)'),
    postcode: z
      .string()
      .min(1, 'Postcode is required')
      .regex(POSTCODE_REGEX, 'Please enter a valid 5-digit postcode'),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .regex(PHONE_REGEX, 'Please enter a valid Malaysian phone number (e.g., 0123456789)'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    customerType: z.enum(['individual', 'company'], {
      message: 'Please select a customer type',
    }),
    maritalStatus: z.enum(['0', '1', '2', '3'], {
      message: 'Please select marital status',
    }),
    isEhailing: z.boolean(),
    isElectricVehicle: z.boolean(),
    pdpaConsent: z.boolean().refine((val) => val === true, {
      message: 'You must consent to the processing of your personal data under PDPA to proceed',
    }),
  })
  .superRefine((data, ctx) => {
    const id = data.nric.trim();
    if (data.identityType === 'NRIC') {
      if (!NRIC_REGEX.test(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid NRIC format (e.g., 123456-12-1234)',
          path: ['nric'],
        });
      } else if (!isValidNRICDate(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid birth date in NRIC (YYMMDD doesn't exist)",
          path: ['nric'],
        });
      } else if (!isValidAge(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Age must be between 16 and 80 years old',
          path: ['nric'],
        });
      }
    } else if (data.identityType === 'PASS') {
      if (!/^[A-Za-z0-9]{6,12}$/.test(id.replace(/\s/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid passport number (6–12 letters/numbers)',
          path: ['nric'],
        });
      }
      if (!data.nationality?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nationality is required for passport holders',
          path: ['nationality'],
        });
      }
    } else if (data.identityType === 'BR_NO') {
      if (!/^[A-Za-z0-9-]{5,20}$/.test(id.replace(/\s/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid company registration (BR) number',
          path: ['nric'],
        });
      }
    } else {
      if (!/^[A-Za-z0-9-]{4,20}$/.test(id.replace(/\s/g, ''))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid ID number',
          path: ['nric'],
        });
      }
      if (!data.nationality?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nationality is required',
          path: ['nationality'],
        });
      }
    }

    if (data.customerType === 'individual' && !data.gender) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select gender',
        path: ['gender'],
      });
    }

    if (data.vehicleType === 'motorcycle') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Motorcycle cover is coming soon. Please select Car for Allianz private car comprehensive insurance.',
        path: ['vehicleType'],
      });
    }
  });

export type InsuranceFormData = z.infer<typeof insuranceFormSchema>;

export const validateNRIC = (nric: string): boolean => {
  return NRIC_REGEX.test(nric) && isValidNRICDate(nric) && isValidAge(nric);
};

export const validateAge = (nric: string): { valid: boolean; age: number } => {
  const match = nric.replace(/-/g, '').match(/^(\d{6})/);
  if (!match) return { valid: false, age: 0 };
  const yy = parseInt(match[1].substring(0, 2), 10);
  const birthYear = yy > 30 ? 1900 + yy : 2000 + yy;
  const age = new Date().getFullYear() - birthYear;
  return { valid: age >= 16 && age <= 80, age };
};

export const validatePlateNumber = (plateNumber: string): boolean => {
  return PLATE_NUMBER_REGEX.test(plateNumber);
};

export const validatePostcode = (postcode: string): boolean => {
  return POSTCODE_REGEX.test(postcode);
};

export const formatNRIC = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 6) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`;
};

export const formatPlateNumber = (value: string): string => {
  return value.toUpperCase().replace(/\s+/g, ' ').trim();
};

export function identityNumberLabel(identityType: z.infer<typeof identityTypeEnum>): string {
  switch (identityType) {
    case 'NRIC':
      return 'NRIC Number';
    case 'OLD_IC':
      return 'Old IC / Others Number';
    case 'PASS':
      return 'Passport Number';
    case 'POL':
      return 'Police / Army ID Number';
    case 'BR_NO':
      return 'Company Registration (BR No.)';
    default:
      return 'ID Number';
  }
}

const MOBILE_PREFIX_REGEX = /^60(1[0-9])$/;
const MOBILE_NUMBER_REGEX = /^\d{7,8}$/;

export const customerDetailsSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Max 100 characters')
    .regex(PERSON_NAME_REGEX, 'Name must not contain numbers or special characters')
    .transform((v) => v.toUpperCase()),
  identityType: identityTypeEnum,
  identityNumber: z.string().min(1, 'ID number is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'C']),
  maritalStatus: z.enum(['0', '1', '2', '3'], {
    message: 'Please select marital status',
  }),
  mobilePrefix: z
    .string()
    .min(1, 'Mobile prefix is required')
    .regex(MOBILE_PREFIX_REGEX, 'Invalid prefix (e.g., 6012)'),
  mobileNumber: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(MOBILE_NUMBER_REGEX, 'Must be 7-8 digits'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  addressLine1: z
    .string()
    .min(1, 'Address line 1 is required')
    .max(100, 'Max 100 characters per line')
    .transform((v) => v.toUpperCase()),
  addressLine2: z
    .string()
    .max(100, 'Max 100 characters per line')
    .transform((v) => v.toUpperCase())
    .optional()
    .or(z.literal('')),
  addressLine3: z
    .string()
    .max(100, 'Max 100 characters per line')
    .transform((v) => v.toUpperCase())
    .optional()
    .or(z.literal('')),
  postcode: z
    .string()
    .min(1, 'Postcode is required')
    .regex(POSTCODE_REGEX, 'Must be 5 digits'),
  city: z.string().optional(),
  state: z.string().optional(),
});

export type CustomerDetailsData = z.infer<typeof customerDetailsSchema>;
