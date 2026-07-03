// ── Enums ──

export type TransactionType = 'NWOO' | 'NWNN' | 'NWTR';

export type IdentityType = 'NRIC' | 'OLD_IC' | 'PASS' | 'POL' | 'BR_NO';

export type Gender = 'F' | 'M' | 'C';

export type MaritalStatus = '0' | '1' | '2' | '3';

export type SalesChannel =
  | 'PTR'
  | 'PTR_MOL'
  | 'PTR_IPAY'
  | 'PTR_MOL_INQ'
  | 'PTR_IPAY_INQ';

// ── Vehicle Details ──

export interface NvicItem {
  nvic: string;
  vehicleMarketValue: number;
  vehicleVariant: string;
  engineType?: string;
  uom?: string;
  vehicleEngineCC?: string;
  recommendInd?: string;
}

export interface VehicleDetailsResponse {
  contractNumber: string;
  vehicleLicenseId: string;
  avMakeCode: string;
  makeCode: string;
  vehicleMake: string;
  modelCode: string;
  vehicleModel: string;
  vehicleEngineCC: string;
  vehicleEngine: string;
  vehicleChassis: string;
  yearOfManufacture: string;
  seatingCapacity: number;
  ncdPercentage: number;
  prevPolExpiryDate: string;
  polEffectiveDate: string;
  polExpiryDate: string;
  lapseDays: number;
  nextNcdEffDate: string;
  currPeriodCover: string;
  insCode: string;
  currInsurer: string;
  currNcdPercentage: number;
  currNcdEffDate: string;
  coverType: string;
  currNcdLvl: number;
  nextNcdLvl: number;
  ismSrespCode: string;
  ismSrespValue: string;
  nvicList: NvicItem[];
  vehicleModelDesc?: string;
}

// ── NCD Details ──

export interface NcdDetailsResponse {
  contractNumber: string;
  vehicleLicenseId: string;
  ncdPercentage: number;
  prevPolExpiryDate: string;
  polEffectiveDate: string;
  polExpiryDate: string;
  lapseDays: number;
  nextNcdEffDate: string;
  currPeriodCover: string;
  insCode: string;
  currInsurer: string;
  currNcdPercentage: number;
  currNcdEffDate: string;
  coverType: string;
  currNcdLvl: number;
  nextNcdLvl: number;
}

// ── Check UBB ──

export interface ReferRiskItem {
  CoverId: string;
  ReferCode: string;
  ReferLevel: string;
  RiskId: string;
  RoutingCode: string;
}

export interface CheckUBBResponse {
  ReferRiskList: ReferRiskItem[];
}

// ── Quotation ──

export interface AdditionalCoverItem {
  coverCode: string;
  coverName: string;
  coverDescription: string;
  coverNarration: string;
  displayPremium: number;
  coverSumInsured: number;
  selectedIndicator: boolean;
  addDisplayInd: boolean;
  sequence: number;
  azolSequence: number;
  azolHiddenInd: number;
  packageCode?: string;
  packageInd?: boolean;
}

export interface QuotationResponse {
  contract: {
    contractNumber: string;
    hrtvInd: boolean;
    highPerformanceInd: boolean;
    excessWaiveInd: boolean;
  };
  premium: {
    basicPremium: number;
    annualPremium: number;
    grossPremium: number;
    premiumDue: number;
    premiumDueRounded: number;
    stampDuty: number;
    serviceTaxPercentage: number;
    serviceTaxAmount: number;
    excessAmount: number;
    ncdPct: number;
    ncdAmt: number;
    rebatePct: number;
    rebateAmt: number;
    commissionAmount: number;
    commissionPercentage: number;
    basicAnnualPremium: number;
    premiumDueAfterPTV: number;
    premiumDueRoundedAfterPTV: number;
    packagePremium?: number;
  };
  additionalCover: AdditionalCoverItem[];
  calculatedPremiumDiscount?: {
    grossPremium: number;
    discountPercentage: number;
    discountAmt: number;
    grossPremiumAfterDiscount: number;
    premiumDueAfterDiscount: number;
    premiumDueAfterDiscountRounded: number;
  };
  unlimitedDriverInfo?: {
    description: string;
    amount: number;
  };
  packageCodes?: string[];
  selectedPackageCode?: string;
}

// ── Submission ──

export interface SubmitTransactionRequest {
  salesChannel?: SalesChannel;
  contract: {
    contractNumber: string;
    emarketingConsentInd?: 'Y' | 'N';
  };
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

// ── LOV ──

export interface AllianzMakeItem {
  Code: string;
  Description: string;
}

export interface AllianzModelItem {
  Code: string;
  Description: string;
}

export interface AllianzVariantItem {
  ModelCode: string;
  MakeCode: string;
  Descp: string;
  Capacity: number;
  UOM: string;
  SeatCapacity: number;
}

export interface AVVariantItem {
  Variant: string;
  AvCode: string;
  SumInsured: string;
  VehicleEngineCC: number;
  MakeYear: string;
}

// ── UBB Refer Codes ──

export type UBBReferCode =
  | 'UBBE001'   // Lapse Policy
  | 'UBBE001R'  // Referred Lapse Policy
  | 'UBBE002'   // Too early to renew (>90 days before expiry)
  | 'UBBE002R'  // Referred Policy Date Checking
  | 'UBBE003'   // Referred Claims Experience
  | 'UBBE004'   // 2+ claim experience
  | 'UBBE005'   // Referred Recon Risk
  | 'UBBE006';  // Recon Risk

export const UBB_REFER_MESSAGES: Record<string, string> = {
  UBBE001: 'Oops! Your previous policy expired on {{EXPIRY_DATE}} and therefore we are unable to process your request online.',
  UBBE001R: 'Oops! Your previous policy expired on {{EXPIRY_DATE}} and therefore we are unable to process your request online.',
  UBBE002: 'Oops! Your motor policy will expire on {{EXPIRY_DATE}}. Please come back again on {{RENEWAL_DATE}} to renew your motor policy.',
  UBBE002R: 'Oops! Your motor policy will expire on {{EXPIRY_DATE}}. Please come back again on {{RENEWAL_DATE}} to renew your motor policy.',
  UBBE003: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  UBBE004: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  UBBE005: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  UBBE006: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  RP007: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  CM001: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  CM002: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  CM003: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  CM004: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  CM006: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  CM007: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  CM008: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  CM010: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  CM011: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  CM019: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
  ID_MISMATCH: 'Oops! The ID (NRIC / Old IC / Passport / Army / Police) no. does not match the vehicle no. provided. Please refer to your previous policy or vehicle registration card for the ID no. and retry.',
  NCD_UNAVAILABLE: 'Oops! We are unable to obtain your vehicle No Claim Discount or your motor insurance has already been renewed.',
  CLAIMS_CURRENT: 'Oops! Your current policy has a claim and we are unable to process your request online.',
};

export function formatUBBMessage(code: string, expiryDate?: string): string {
  let msg = UBB_REFER_MESSAGES[code] || 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.';
  if (expiryDate) {
    msg = msg.replace(/\{\{EXPIRY_DATE\}\}/g, expiryDate);
    const expiry = new Date(expiryDate);
    const renewal = new Date(expiry);
    renewal.setDate(renewal.getDate() - 90);
    const renewalStr = renewal.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    msg = msg.replace(/\{\{RENEWAL_DATE\}\}/g, renewalStr);
  }
  return msg;
}

// ── API Error ──

export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  ubbReferCodes?: string[];
  policyExpiryDate?: string;
}

// ── Session state for the insurance flow ──

export interface AllianzFlowState {
  transactionType: TransactionType;
  vehicleDetails: VehicleDetailsResponse | null;
  selectedNvic: NvicItem | null;
  quotation: QuotationResponse | null;
  ubbResult: CheckUBBResponse | null;
}
