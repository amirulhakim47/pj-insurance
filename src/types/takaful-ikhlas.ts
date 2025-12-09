/**
 * Takaful Ikhlas API Types
 * 
 * These types define the structure for interacting with Takaful Ikhlas API.
 * Register at https://go.takaful-ikhlas.com.my/register to get API credentials.
 */

// API Configuration
export interface TakafulIkhlasConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

// Vehicle Information for Quote Request
export interface TakafulVehicleData {
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle';
  postcode: string;
  isEhailing?: boolean;
  isElectricVehicle?: boolean;
  customerType: 'individual' | 'company';
}

// Customer Information
export interface TakafulCustomerData {
  fullName: string;
  nric: string;
  email: string;
  phoneNumber: string;
}

// Quote Request
export interface TakafulQuoteRequest {
  vehicle: TakafulVehicleData;
  customer: TakafulCustomerData;
}

// Quote Response
export interface TakafulQuoteResponse {
  success: boolean;
  quoteId: string;
  quotes: TakafulQuote[];
  message?: string;
  timestamp: string;
}

// Individual Quote
export interface TakafulQuote {
  planId: string;
  planName: string;
  description: string;
  coverage: {
    liability: string;
    comprehensive: boolean;
    theft: boolean;
    flood: boolean;
    windscreen: boolean;
    personalAccident?: boolean;
  };
  originalPrice: number;
  discountPercentage?: number;
  finalPrice: number;
  features: string[];
  surplusDistribution?: boolean;
  shariahCompliant: boolean;
  validityPeriod: {
    startDate: string;
    expiryDate: string;
  };
}

// Policy Application Request
export interface TakafulApplicationRequest {
  quoteId: string;
  planId: string;
  vehicle: TakafulVehicleData;
  customer: TakafulCustomerData;
  paymentMethod: 'online' | 'bank_transfer' | 'credit_card';
}

// Policy Application Response
export interface TakafulApplicationResponse {
  success: boolean;
  applicationId: string;
  policyNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  paymentUrl?: string;
  timestamp: string;
}

// API Error Response
export interface TakafulApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

