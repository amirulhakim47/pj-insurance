import { InsuranceFormData, VehicleType, CustomerType } from '@/types';

// Sample form data for testing
export const sampleFormData: InsuranceFormData[] = [
  {
    fullName: 'John Doe',
    vehicleType: 'car' as VehicleType,
    nric: '123456-12-1234',
    plateNumber: 'ABC1234',
    postcode: '50450',
    phoneNumber: '0123456789',
    email: 'test@example.com',
    customerType: 'individual' as CustomerType,
    isEhailing: false,
    isElectricVehicle: false,
    pdpaConsent: true,
  },
  {
    fullName: 'Jane Smith',
    vehicleType: 'motorcycle' as VehicleType,
    nric: '987654-32-5678',
    plateNumber: 'XYZ9876',
    postcode: '10350',
    phoneNumber: '0198765432',
    email: 'motor@example.com',
    customerType: 'individual' as CustomerType,
    isEhailing: false,
    isElectricVehicle: false,
    pdpaConsent: true,
  },
  {
    fullName: 'ABC Company Sdn Bhd',
    vehicleType: 'car' as VehicleType,
    nric: '456789-01-2345',
    plateNumber: 'DEF5678',
    postcode: '40150',
    phoneNumber: '01122334455',
    email: 'company@example.com',
    customerType: 'company' as CustomerType,
    isEhailing: false,
    isElectricVehicle: false,
    pdpaConsent: true,
  },
];

// Default form values
export const defaultFormValues: Partial<InsuranceFormData> = {
  fullName: '',
  vehicleType: undefined,
  nric: '',
  plateNumber: '',
  postcode: '',
  phoneNumber: '',
  email: '',
  customerType: undefined,
  isEhailing: false,
  isElectricVehicle: false,
  pdpaConsent: false,
};

// Form field options
export const vehicleTypeOptions = [
  { value: 'car' as VehicleType, label: 'Car', description: 'Private car or sedan' },
  { value: 'motorcycle' as VehicleType, label: 'Motorcycle', description: 'Motorcycle or scooter' },
];

export const customerTypeOptions = [
  { value: 'individual' as CustomerType, label: 'Individual', description: 'Personal insurance' },
  { value: 'company' as CustomerType, label: 'Company', description: 'Corporate insurance' },
];

// Malaysian states and their postcodes (sample)
export const malaysianStates = [
  { name: 'Kuala Lumpur', postcodes: ['50000', '50450', '50470', '50490'] },
  { name: 'Selangor', postcodes: ['40000', '40150', '40200', '47000'] },
  { name: 'Penang', postcodes: ['10000', '10350', '10400', '11700'] },
  { name: 'Johor', postcodes: ['80000', '81000', '82000', '83000'] },
  { name: 'Perak', postcodes: ['30000', '31000', '32000', '33000'] },
];

// Validation messages
export const validationMessages = {
  vehicleType: {
    required: 'Please select a vehicle type',
  },
  nric: {
    required: 'NRIC is required',
    invalid: 'Please enter a valid NRIC format (e.g., 123456-12-1234)',
  },
  plateNumber: {
    required: 'Plate number is required',
    invalid: 'Please enter a valid plate number (e.g., ABC1234)',
  },
  postcode: {
    required: 'Postcode is required',
    invalid: 'Please enter a valid 5-digit postcode',
  },
  customerType: {
    required: 'Please select a customer type',
  },
};
