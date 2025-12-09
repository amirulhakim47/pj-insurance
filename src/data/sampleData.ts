import { InsuranceFormData, VehicleType, CustomerType } from '@/types';

// Realistic Malaysian NRIC numbers (fake but valid format)
export const sampleNRICs = [
  '900101-01-1234', // Born 1990
  '850615-02-5678', // Born 1985
  '920330-03-9012', // Born 1992
  '880722-04-3456', // Born 1988
  '950208-05-7890', // Born 1995
  '870914-06-2345', // Born 1987
  '910505-07-6789', // Born 1991
  '840812-08-0123', // Born 1984
];

// Realistic Malaysian plate numbers
export const samplePlateNumbers = [
  'WA1234A', // Kuala Lumpur
  'BCA5678', // Selangor
  'PBA9012', // Penang
  'JHA3456', // Johor
  'PAA7890', // Perak
  'WB2345B', // Kuala Lumpur
  'BCC6789', // Selangor
  'PBB0123', // Penang
  'JHB4567', // Johor
  'PAB8901', // Perak
];

// Malaysian postcodes by state
export const samplePostcodes = [
  '50450', // KL - Ampang
  '50470', // KL - KLCC
  '50490', // KL - Bukit Bintang
  '40150', // Selangor - Shah Alam
  '40200', // Selangor - Subang Jaya
  '47000', // Selangor - Petaling Jaya
  '10350', // Penang - Georgetown
  '10400', // Penang - Jelutong
  '11700', // Penang - Gelugor
  '80000', // Johor - Johor Bahru
  '81000', // Johor - Kulai
  '30000', // Perak - Ipoh
];

// Generate realistic test data combinations
export const generateSampleFormData = (count: number = 10): InsuranceFormData[] => {
  const samples: InsuranceFormData[] = [];
  
  for (let i = 0; i < count; i++) {
    const vehicleTypes: VehicleType[] = ['car', 'motorcycle'];
    const customerTypes: CustomerType[] = ['individual', 'company'];
    
    samples.push({
      fullName: `Test User ${i + 1}`,
      vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
      nric: sampleNRICs[Math.floor(Math.random() * sampleNRICs.length)],
      plateNumber: samplePlateNumbers[Math.floor(Math.random() * samplePlateNumbers.length)],
      postcode: samplePostcodes[Math.floor(Math.random() * samplePostcodes.length)],
      phoneNumber: '0123456789', // Default dummy value
      email: 'test@example.com', // Default dummy value
      customerType: customerTypes[Math.floor(Math.random() * customerTypes.length)],
      isEhailing: false,
      isElectricVehicle: false,
      pdpaConsent: true,
    });
  }
  
  return samples;
};

// Predefined test scenarios
export const testScenarios: { name: string; data: InsuranceFormData }[] = [
  {
    name: 'Individual Car Owner - KL',
    data: {
      fullName: 'Ahmad Rahman',
      vehicleType: 'car',
      nric: '900101-01-1234',
      plateNumber: 'WA1234A',
      postcode: '50450',
      phoneNumber: '0123456789',
      email: 'kl_driver@example.com',
      customerType: 'individual',
      isEhailing: false,
      isElectricVehicle: false,
      pdpaConsent: true,
    },
  },
  {
    name: 'Company Motorcycle - Selangor',
    data: {
      fullName: 'Tech Solutions Sdn Bhd',
      vehicleType: 'motorcycle',
      nric: '850615-02-5678',
      plateNumber: 'BCA5678',
      postcode: '40150',
      phoneNumber: '0198765432',
      email: 'company_fleet@example.com',
      customerType: 'company',
      isEhailing: false,
      isElectricVehicle: false,
      pdpaConsent: true,
    },
  },
  {
    name: 'Individual Car Owner - Penang',
    data: {
      fullName: 'Lim Wei Ming',
      vehicleType: 'car',
      nric: '920330-03-9012',
      plateNumber: 'PBA9012',
      postcode: '10350',
      phoneNumber: '0178889999',
      email: 'penang_driver@example.com',
      customerType: 'individual',
      isEhailing: false,
      isElectricVehicle: false,
      pdpaConsent: true,
    },
  },
  {
    name: 'Company Car Fleet - Johor',
    data: {
      fullName: 'Johor Logistics Sdn Bhd',
      vehicleType: 'car',
      nric: '880722-04-3456',
      plateNumber: 'JHA3456',
      postcode: '80000',
      phoneNumber: '0134445555',
      email: 'johor_biz@example.com',
      customerType: 'company',
      isEhailing: false,
      isElectricVehicle: false,
      pdpaConsent: true,
    },
  },
];

// Loading messages for the progress screen
export const loadingMessages = [
  'Searching for the best insurance deals...',
  'Comparing policies from top providers...',
  'Analyzing your requirements...',
  'Finding personalized recommendations...',
  'Almost done, preparing your results...',
];

// WhatsApp message templates
export const whatsappMessageTemplates = {
  individual: (formData: InsuranceFormData, policyName: string, price: number) => 
    `Hi! I'm interested in the ${policyName} insurance policy for my ${formData.vehicleType} (${formData.plateNumber}). The quoted price is RM${price.toFixed(2)}. Please provide more details and assist with the application process. Thank you!`,
  
  company: (formData: InsuranceFormData, policyName: string, price: number) => 
    `Hello, I represent a company and we're interested in the ${policyName} insurance policy for our ${formData.vehicleType} (${formData.plateNumber}). The quoted price is RM${price.toFixed(2)}. Please provide corporate rates and assistance with the application. Thank you!`,
};

// Error simulation for testing
export const simulateApiError = () => {
  const errors = [
    'Network connection error. Please try again.',
    'Service temporarily unavailable. Please try again later.',
    'Invalid postcode. Please check and try again.',
    'No policies found for your criteria. Please modify your search.',
  ];
  
  return errors[Math.floor(Math.random() * errors.length)];
};
