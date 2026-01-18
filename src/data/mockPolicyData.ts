import { InsurancePolicy, InsuranceProvider } from '@/types';

// Insurance Providers
export const insuranceProviders: InsuranceProvider[] = [
  {
    id: 'etiqa',
    name: 'Etiqa Insurance',
    logo: '/logos/etiqa-logo.svg',
    trustScore: 9.2,
  },
  {
    id: 'allianz',
    name: 'Allianz Malaysia',
    logo: '/logos/allianz-logo.svg',
    trustScore: 9.5,
  },
  {
    id: 'liberty',
    name: 'Liberty Insurance',
    logo: '/logos/liberty-logo.svg',
    trustScore: 8.8,
  },
  {
    id: 'insurance-a',
    name: 'Insurance A',
    logo: '/logos/insurance-a-logo.svg',
    trustScore: 9.0,
  },
  {
    id: 'insurance-b',
    name: 'Insurance B',
    logo: '/logos/insurance-b-logo.svg',
    trustScore: 8.9,
  },
];

// Generate dates for policies (1 year coverage)
const getStartDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getExpiryDate = () => {
  const today = new Date();
  const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  return nextYear.toISOString().split('T')[0];
};

// Mock Insurance Policies for Cars
export const carInsurancePolicies: InsurancePolicy[] = [
  {
    id: 'etiqa-comprehensive-car',
    provider: insuranceProviders[0], // Etiqa
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Comprehensive coverage with roadside assistance and windscreen protection.',
    features: [
      'Comprehensive coverage',
      '24/7 Roadside assistance',
      'Windscreen protection',
      'Flood coverage',
      'Theft protection',
    ],
    originalPrice: 1850,
    discountPercentage: 15,
    finalPrice: 1572.50,
    isRecommended: true,
    coverage: {
      liability: 'Unlimited',
      comprehensive: true,
      theft: true,
      flood: true,
      windscreen: true,
    },
  },
  {
    id: 'allianz-premium-car',
    provider: insuranceProviders[1], // Allianz
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Premium protection with enhanced benefits and global coverage.',
    features: [
      'Premium comprehensive coverage',
      'Global emergency assistance',
      'Rental car coverage',
      'Personal accident coverage',
      'Legal liability protection',
    ],
    originalPrice: 2100,
    discountPercentage: 10,
    finalPrice: 1890,
    coverage: {
      liability: 'Unlimited',
      comprehensive: true,
      theft: true,
      flood: true,
      windscreen: true,
    },
  },
  {
    id: 'liberty-essential-car',
    provider: insuranceProviders[2], // Liberty
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Essential coverage with competitive pricing and reliable service.',
    features: [
      'Comprehensive coverage',
      'Roadside assistance',
      'Workshop network',
      'Online claims',
      'Fast settlement',
    ],
    originalPrice: 1650,
    discountPercentage: 20,
    finalPrice: 1320,
    coverage: {
      liability: 'Unlimited',
      comprehensive: true,
      theft: true,
      flood: false,
      windscreen: true,
    },
  },
  {
    id: 'etiqa-basic-car',
    provider: insuranceProviders[0], // Etiqa
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Basic comprehensive coverage with essential protection.',
    features: [
      'Basic comprehensive coverage',
      'Roadside assistance',
      'Workshop repairs',
      'Online support',
    ],
    originalPrice: 1450,
    finalPrice: 1450,
    coverage: {
      liability: 'Unlimited',
      comprehensive: true,
      theft: true,
      flood: false,
      windscreen: false,
    },
  },
  {
    id: 'insurance-a-comprehensive-car',
    provider: insuranceProviders[3], // Insurance A
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Comprehensive coverage with full protection for your peace of mind.',
    features: [
      'Full comprehensive coverage',
      '24/7 Roadside assistance',
      'Windscreen protection',
      'Flood coverage',
      'Theft protection',
      'Bonus protection',
    ],
    originalPrice: 1950,
    discountPercentage: 12,
    finalPrice: 1716,
    coverage: {
      liability: 'Unlimited',
      comprehensive: true,
      theft: true,
      flood: true,
      windscreen: true,
    },
  },
  {
    id: 'insurance-b-premium-car',
    provider: insuranceProviders[4], // Insurance B
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Premium plan with enhanced benefits and additional coverage options.',
    features: [
      'Premium comprehensive coverage',
      'Personal accident coverage',
      'Rental car coverage',
      'Global assistance',
      'No claim bonus protection',
    ],
    originalPrice: 2200,
    discountPercentage: 8,
    finalPrice: 2024,
    coverage: {
      liability: 'Unlimited',
      comprehensive: true,
      theft: true,
      flood: true,
      windscreen: true,
    },
  },
];

// Mock Insurance Policies for Motorcycles
export const motorcycleInsurancePolicies: InsurancePolicy[] = [
  {
    id: 'allianz-comprehensive-motorcycle',
    provider: insuranceProviders[1], // Allianz
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Comprehensive motorcycle coverage with rider protection.',
    features: [
      'Comprehensive coverage',
      'Personal accident coverage',
      'Theft protection',
      'Roadside assistance',
      'Helmet coverage',
    ],
    originalPrice: 650,
    discountPercentage: 12,
    finalPrice: 572,
    isRecommended: true,
    coverage: {
      liability: 'RM1,000,000',
      comprehensive: true,
      theft: true,
      flood: true,
      windscreen: false,
    },
  },
  {
    id: 'liberty-motorcycle-plus',
    provider: insuranceProviders[2], // Liberty
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Enhanced motorcycle protection with additional benefits.',
    features: [
      'Comprehensive coverage',
      'Accessories coverage',
      'Towing service',
      'Workshop network',
      'Fast claims',
    ],
    originalPrice: 580,
    discountPercentage: 18,
    finalPrice: 475.60,
    coverage: {
      liability: 'RM1,000,000',
      comprehensive: true,
      theft: true,
      flood: false,
      windscreen: false,
    },
  },
  {
    id: 'etiqa-motorcycle-basic',
    provider: insuranceProviders[0], // Etiqa
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Affordable motorcycle coverage with essential protection.',
    features: [
      'Third party coverage',
      'Basic theft protection',
      'Roadside assistance',
      'Online claims',
    ],
    originalPrice: 420,
    finalPrice: 420,
    coverage: {
      liability: 'RM500,000',
      comprehensive: false,
      theft: true,
      flood: false,
      windscreen: false,
    },
  },
  {
    id: 'insurance-a-motorcycle-comprehensive',
    provider: insuranceProviders[3], // Insurance A
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Comprehensive motorcycle coverage with full rider protection.',
    features: [
      'Full comprehensive coverage',
      'Personal accident coverage',
      'Theft protection',
      'Roadside assistance',
      'Helmet coverage',
      'Bonus protection',
    ],
    originalPrice: 680,
    discountPercentage: 10,
    finalPrice: 612,
    coverage: {
      liability: 'RM1,000,000',
      comprehensive: true,
      theft: true,
      flood: true,
      windscreen: false,
    },
  },
  {
    id: 'insurance-b-motorcycle-premium',
    provider: insuranceProviders[4], // Insurance B
    startDate: getStartDate(),
    expiryDate: getExpiryDate(),
    description: 'Premium motorcycle plan with enhanced benefits and additional protection.',
    features: [
      'Premium comprehensive coverage',
      'Personal accident coverage',
      'Theft protection',
      'Roadside assistance',
      'Helmet coverage',
      'Accessories coverage',
    ],
    originalPrice: 720,
    discountPercentage: 8,
    finalPrice: 662.40,
    coverage: {
      liability: 'RM1,000,000',
      comprehensive: true,
      theft: true,
      flood: true,
      windscreen: false,
    },
  },
];

// Helper function to get policies based on vehicle type
export const getPoliciesByVehicleType = (vehicleType: 'car' | 'motorcycle'): InsurancePolicy[] => {
  return vehicleType === 'car' ? carInsurancePolicies : motorcycleInsurancePolicies;
};

// Helper function to get policy by ID
export const getPolicyById = (id: string): InsurancePolicy | undefined => {
  const allPolicies = [...carInsurancePolicies, ...motorcycleInsurancePolicies];
  return allPolicies.find(policy => policy.id === id);
};
