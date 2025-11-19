// Vehicle Types
export type VehicleType = 'car' | 'motorcycle';

// Customer Types
export type CustomerType = 'individual' | 'company';

// Form Input Interface
export interface InsuranceFormData {
  vehicleType: VehicleType;
  nric: string;
  plateNumber: string;
  postcode: string;
  phoneNumber: string;
  email: string;
  customerType: CustomerType;
}

// Insurance Provider Interface
export interface InsuranceProvider {
  id: string;
  name: string;
  logo: string;
  trustScore: number;
}

// Insurance Policy Interface
export interface InsurancePolicy {
  id: string;
  provider: InsuranceProvider;
  startDate: string;
  expiryDate: string;
  description: string;
  features: string[];
  originalPrice: number;
  discountPercentage?: number;
  finalPrice: number;
  isRecommended?: boolean;
  coverage: {
    liability: string;
    comprehensive: boolean;
    theft: boolean;
    flood: boolean;
    windscreen: boolean;
  };
  loading?: boolean; // For mock loading state
}

// Form Validation Errors
export interface FormErrors {
  vehicleType?: string;
  nric?: string;
  plateNumber?: string;
  postcode?: string;
  phoneNumber?: string;
  email?: string;
  customerType?: string;
}

// API Response Types
export interface PolicySearchResponse {
  success: boolean;
  data: InsurancePolicy[];
  message?: string;
}

// WhatsApp Message Data
export interface WhatsAppMessageData {
  customerInfo: InsuranceFormData;
  selectedPolicy: InsurancePolicy;
  timestamp: string;
}

// Loading State
export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
}

// Navigation State
export interface NavigationState {
  currentStep: 'form' | 'loading' | 'results' | 'payment' | 'confirmation';
  formData?: InsuranceFormData;
  selectedPolicy?: InsurancePolicy;
}
