// ── Transaction & Identity Enums ──

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

export type Region = 'E' | 'W';

// ── OAuth ──

export interface AllianzTokenResponse {
  access_token: string;
  expires_in: string;
  token_type: string;
}

// ── Vehicle Details ──

export interface GetVehicleDetailsRequest {
  sourceSystem: string;
  vehicleLicenseId: string;
  identityType: IdentityType;
  identityNumber: string;
  checkUbbInd: number;
  postalCode?: string;
}

export interface NvicItem {
  nvic: string;
  vehicleMarketValue: number;
  vehicleVariant: string;
  engineType?: string;
  uom?: string;
  vehicleEngineCC?: string;
  recommendInd?: string;
}

export interface GetVehicleDetailsResponse {
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

export interface GetNcdDetailsRequest {
  partnerId: string;
  vehicleLicenseId: string;
  contractNumber: string;
  productCat?: string;
}

export interface GetNcdDetailsResponse {
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
  ismSrespCode: string;
  ismSrespValue: string;
}

// ── Check UBB ──

export interface CheckUBBRequest {
  ReferenceNo: string;
  ProductCat: string;
  SourceSystem: string;
  ClaimsExp: string;
  ReconInd: string;
  ExcessWaiveInd: boolean;
  CheckUbbInd: number;
  Policy: {
    PolicyEffectiveDate: string;
    PolicyExpiryDate: string;
    Client: {
      IdentificationNumber: string;
      IdType: string;
      Age: string;
    };
    RiskList: Array<{
      RiskId: string;
      InsuredPerson: {
        IdentificationNumber: string;
        IdType: string;
      };
      Vehicle: {
        AvCode: string;
        Capacity: string;
        MakeCode: string;
        Model: string;
        PiamModel: string;
        Seat: number;
        VehicleNo: string;
        YearOfManufacture: string;
        NamedDriverList: Array<{
          Age: string;
          IdentificationNumber: string;
        }>;
        HighPerformanceInd: boolean;
        HrtvInd: boolean;
      };
      CoverList: Array<{
        CoverPremium: {
          SumInsured: string;
        };
      }>;
    }>;
  };
}

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

// ── Quotation (Generate) ──

export interface GetPlanRecommendationRequest {
  partnerId: string;
  transactionType: TransactionType;
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

// ── Quotation (Update) ──

export interface AdditionalCoverInput {
  coverCode: string;
  coverSumInsured: number;
  cartDay?: string;
  cartAmount?: string;
  planCode?: string;
  actionCode?: string;
  sequence?: number;
  coverOptionCode?: string;
}

export interface UpdatePlanRecommendationRequest {
  salesChannel?: SalesChannel;
  partnerId: string;
  transactionType: TransactionType;
  contractNumber: string;
  effectiveDate?: string;
  expirationDate?: string;
  packageCode?: string;
  additionalCover?: AdditionalCoverInput[];
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

// ── Quotation Response (shared by generate & update) ──

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

export interface GetPlanRecommendationResponse {
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

export interface SubmitTransactionResponse {
  Status: string;
}

// ── LOV Responses ──

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

export interface AVMakeItem {
  Code: string;
  Description: string;
}

export interface AVModelItem {
  AvModelCode: string;
  AvModelDesc: string;
}

export interface AVVariantItem {
  Variant: string;
  AvCode: string;
  SumInsured: string;
  VehicleEngineCC: number;
  MakeYear: string;
  AzVariant?: string;
}

export interface GetAllianzMakeListResponse {
  MakeList: AllianzMakeItem[];
}

export interface GetAllianzModelListResponse {
  ModelList: AllianzModelItem[];
}

export interface GetAllianzVariantListResponse {
  VehicleList: AllianzVariantItem[];
}

export interface GetAVMakeListResponse {
  AVMakeList: AVMakeItem[];
}

export interface GetAVModelListResponse {
  ModelGrp: AVModelItem[];
}

export interface GetAVVariantListResponse {
  VariantGrp: AVVariantItem[];
}

// ── Error ──

export interface AllianzError {
  errorCode: string;
  errorMessage: string;
}
