import { z } from 'zod';

// NRIC validation regex for Malaysian IC format
const NRIC_REGEX = /^\d{6}-\d{2}-\d{4}$/;

// Malaysian plate number regex (simplified)
const PLATE_NUMBER_REGEX = /^[A-Z]{1,3}\s?\d{1,4}[A-Z]?$/i;

// Malaysian postcode regex (5 digits)
const POSTCODE_REGEX = /^\d{5}$/;

// Malaysian phone number regex
const PHONE_REGEX = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;

// Helper to validate date part of NRIC (YYMMDD)
const isValidNRICDate = (nric: string): boolean => {
  const match = nric.match(/^(\d{6})/);
  if (!match) return false;
  
  const datePart = match[1];
  const year = parseInt(datePart.substring(0, 2), 10);
  const month = parseInt(datePart.substring(2, 4), 10);
  const day = parseInt(datePart.substring(4, 6), 10);

  if (month < 1 || month > 12) return false;

  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year % 4 === 0) {
    daysInMonth[2] = 29;
  }

  return day >= 1 && day <= daysInMonth[month];
};

// Age validation: must be between 16 and 80 (calculation = current year - birth year)
const isValidAge = (nric: string): boolean => {
  const match = nric.match(/^(\d{6})/);
  if (!match) return false;

  const yy = parseInt(match[1].substring(0, 2), 10);
  const birthYear = yy > 30 ? 1900 + yy : 2000 + yy;
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  return age >= 16 && age <= 80;
};

export const insuranceFormSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .transform((v) => v.toUpperCase()),
  vehicleType: z.enum(['car', 'motorcycle'], {
    message: 'Please select a vehicle type',
  }),
  identityType: z
    .enum(['NRIC', 'OLD_IC', 'PASS', 'POL', 'BR_NO'], {
      message: 'Please select an identity type',
    }),
  nric: z
    .string()
    .min(1, 'NRIC is required')
    .regex(NRIC_REGEX, 'Please enter a valid NRIC format (e.g., 123456-12-1234)')
    .refine(isValidNRICDate, 'Invalid birth date in NRIC (YYMMDD doesn\'t exist)')
    .refine(isValidAge, 'Age must be between 16 and 80 years old'),
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
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  customerType: z.enum(['individual', 'company'], {
    message: 'Please select a customer type',
  }),
  isEhailing: z.boolean(),
  isElectricVehicle: z.boolean(),
  pdpaConsent: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must consent to the processing of your personal data under PDPA to proceed',
    }),
});

export type InsuranceFormData = z.infer<typeof insuranceFormSchema>;

// Validation helper functions
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

// Format helpers
export const formatNRIC = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Format as XXXXXX-XX-XXXX
  if (digits.length <= 6) {
    return digits;
  } else if (digits.length <= 8) {
    return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  } else {
    return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`;
  }
};

export const formatPlateNumber = (value: string): string => {
  // Convert to uppercase and remove extra spaces
  return value.toUpperCase().replace(/\s+/g, ' ').trim();
};

// ── Customer Details Schema (Section 3.3 of Motor Functional Requirement) ──

const MOBILE_PREFIX_REGEX = /^60(1[0-9])$/;
const MOBILE_NUMBER_REGEX = /^\d{7,8}$/;

export const customerDetailsSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Max 100 characters')
    .transform((v) => v.toUpperCase()),
  identityType: z.enum(['NRIC', 'OLD_IC', 'PASS', 'POL', 'BR_NO']),
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
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
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
