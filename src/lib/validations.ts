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
  // Extract first 6 digits (YYMMDD)
  const match = nric.match(/^(\d{6})/);
  if (!match) return false;
  
  const datePart = match[1];
  const year = parseInt(datePart.substring(0, 2), 10);
  const month = parseInt(datePart.substring(2, 4), 10);
  const day = parseInt(datePart.substring(4, 6), 10);

  // Basic Month check
  if (month < 1 || month > 12) return false;

  // Days in month
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Leap year check
  // We assume 2000s or 1900s (skipping 1900 non-leap year edge case as it's >120 years ago)
  // 2000 was a leap year. Any year divisible by 4 in the relevant range is a leap year.
  if (year % 4 === 0) {
    daysInMonth[2] = 29;
  }

  return day >= 1 && day <= daysInMonth[month];
};

export const insuranceFormSchema = z.object({
  vehicleType: z.enum(['car', 'motorcycle'], {
    message: 'Please select a vehicle type',
  }),
  nric: z
    .string()
    .min(1, 'NRIC is required')
    .regex(NRIC_REGEX, 'Please enter a valid NRIC format (e.g., 123456-12-1234)')
    .refine(isValidNRICDate, 'Invalid birth date in NRIC (YYMMDD doesn\'t exist)'),
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
});

export type InsuranceFormData = z.infer<typeof insuranceFormSchema>;

// Validation helper functions
export const validateNRIC = (nric: string): boolean => {
  return NRIC_REGEX.test(nric) && isValidNRICDate(nric);
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
