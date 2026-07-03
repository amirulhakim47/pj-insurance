import type {
  VehicleDetailsResponse,
  NcdDetailsResponse,
  CheckUBBResponse,
  QuotationResponse,
  IdentityType,
  TransactionType,
  Gender,
  MaritalStatus,
  ApiErrorResponse,
  UBBReferCode,
} from '@/types/allianz';

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error: ApiErrorResponse = await res.json().catch(() => ({
      status: res.status,
      code: 'NETWORK_ERROR',
      message: res.statusText,
    }));
    throw error;
  }

  const data = await res.json();

  if (data?.errors?.length) {
    const error: ApiErrorResponse = {
      status: 200,
      code: 'ALLIANZ_BUSINESS_ERROR',
      message: data.errors.join('; '),
    };
    throw error;
  }

  if (data?.UBBStatus?.ReferRiskList?.length && !data.nvicList) {
    const referCodes = data.UBBStatus.ReferRiskList.map(
      (r: { ReferCode: string }) => r.ReferCode,
    );
    const error: ApiErrorResponse = {
      status: 200,
      code: 'UBB_REFER',
      message: referCodes.join('; '),
      ubbReferCodes: referCodes,
      policyExpiryDate: data.prevPolExpiryDate,
    };
    throw error;
  }

  return data as T;
}

// ── Vehicle Details ──

export async function getVehicleDetails(params: {
  plateNumber: string;
  identityNumber: string;
  identityType?: IdentityType;
  postalCode?: string;
}): Promise<VehicleDetailsResponse> {
  return request<VehicleDetailsResponse>('/api/vehicle-details', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ── NCD Details ──

export async function getNcdDetails(params: {
  vehicleLicenseId: string;
  contractNumber: string;
  productCat?: string;
}): Promise<NcdDetailsResponse> {
  return request<NcdDetailsResponse>('/api/ncd-details', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ── Check UBB ──

export async function checkUBB(
  body: Record<string, unknown>,
): Promise<CheckUBBResponse> {
  return request<CheckUBBResponse>('/api/check-ubb', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ── Generate Quotation ──

export interface GenerateQuoteParams {
  transactionType?: TransactionType;
  contractNumber?: string;
  effectiveDate?: string;
  expirationDate?: string;
  person: {
    identityType: IdentityType;
    identityNumber: string;
    gender: Gender;
    birthDate: string;
    maritalStatus: MaritalStatus;
    postalCode: string;
    noOfClaims: string;
  };
  calculateDiscount?: {
    discountPercentage: string;
  };
  vehicle: {
    vehicleLicenseId: string;
    ncdVehicleLicenseId?: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleEngineCC: number;
    yearOfManufacture: string;
    occupantsNumber: number;
    ncdPercentage: number;
    sumInsured: string;
    avCode: string;
    mvInd: string;
    vehicleEngineNo?: string;
    vehicleChassisNo?: string;
  };
}

export async function generateQuote(
  params: GenerateQuoteParams,
): Promise<QuotationResponse> {
  return request<QuotationResponse>('/api/quote', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ── Update Quotation ──

export interface UpdateQuoteParams {
  transactionType?: TransactionType;
  contractNumber: string;
  effectiveDate?: string;
  expirationDate?: string;
  salesChannel?: string;
  packageCode?: string;
  additionalCover?: Array<{
    coverCode: string;
    coverSumInsured: number;
    cartDay?: string;
    cartAmount?: string;
    planCode?: string;
  }>;
  calculateDiscount?: {
    discountPercentage: string;
  };
  unlimitedDriverInd?: boolean;
  allRiderDriverInd?: boolean;
  driverDetails?: Array<{
    fullName: string;
    identityNumber: string;
  }>;
  vehicle?: {
    avCode?: string;
    ncdPercentage?: number;
  };
}

export async function updateQuote(
  params: UpdateQuoteParams,
): Promise<QuotationResponse> {
  return request<QuotationResponse>('/api/quote', {
    method: 'PUT',
    body: JSON.stringify(params),
  });
}

// ── Submission ──

export interface SubmitParams {
  salesChannel?: string;
  contract: { contractNumber: string; emarketingConsentInd?: 'Y' | 'N' };
  person: {
    identityType: IdentityType;
    identityNumber: string;
    fullName: string;
    birthDate: string;
    gender: Gender;
    email: string;
    postalCode: string;
    mobilePrefix: string;
    mobile: string;
    addressLine1: string;
    addressLine2?: string;
    addressLine3?: string;
  };
  vehicle: {
    nvicCode: string;
    vehicleEngineCC: string;
    yearOfManufacture: string;
    occupantsNumber: number;
    vehicleModel?: string;
  };
  driverDetails: Array<{
    fullName: string;
    identityNumber: string;
    driverType?: string;
  }>;
  payment: {
    paymentMode: string;
    paymentBankRef: string;
    paymentId: string;
    paymentDate: string;
    paymentAmount: string;
  };
}

export async function submitTransaction(
  params: SubmitParams,
): Promise<{ Status: string }> {
  return request<{ Status: string }>('/api/submission', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ── LOV ──

export async function getLOV<T>(
  type: string,
  query?: Record<string, string>,
): Promise<T> {
  const qs = query
    ? '?' + new URLSearchParams(query).toString()
    : '';
  return request<T>(`/api/lov/${type}${qs}`, { method: 'GET' });
}

// ── Health Check ──

export async function healthCheck(): Promise<{
  status: string;
  allianzConfigured: boolean;
  timestamp: string;
}> {
  return request('/api/health', { method: 'GET' });
}
