'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout, Container, StepIndicator } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Check, Shield, Car, Info, FileText, ExternalLink } from 'lucide-react';
import { generateQuote, getLOV, checkUBB, updateQuote } from '@/lib/allianz-api';
import type { InsuranceFormData } from '@/types';
import type {
  VehicleDetailsResponse,
  NvicItem,
  QuotationResponse,
  AdditionalCoverItem,
  AVVariantItem,
  IdentityType,
  Gender,
  MaritalStatus,
} from '@/types/allianz';

const steps = ['Details', 'Processed', 'Results', 'Payment'];

const DEMO_FORM_DATA: InsuranceFormData = {
  fullName: 'DEMO USER',
  vehicleType: 'car',
  plateNumber: 'VAP2104',
  nric: '841103-01-1116',
  postcode: '50000',
  customerType: 'individual',
  identityType: 'NRIC',
  email: 'demo@example.com',
  phoneNumber: '0121234567',
  isEhailing: false,
  isElectricVehicle: false,
  pdpaConsent: true,
};

const DEMO_VEHICLE: VehicleDetailsResponse = {
  contractNumber: 'CNAZ00004272328',
  vehicleLicenseId: 'VAP2104',
  avMakeCode: '33',
  makeCode: '33',
  vehicleMake: 'PERODUA',
  modelCode: '10',
  vehicleModel: 'MYVI',
  vehicleModelDesc: 'MYVI',
  vehicleEngineCC: '1498',
  vehicleEngine: 'K3M48C',
  vehicleChassis: 'PM2B200S003264462',
  yearOfManufacture: '2022',
  seatingCapacity: 5,
  ncdPercentage: 55,
  prevPolExpiryDate: '2026-08-29',
  polEffectiveDate: '2026-08-30',
  polExpiryDate: '2027-08-29',
  lapseDays: 0,
  nextNcdEffDate: '2026-08-30',
  currPeriodCover: '2025-08-30 to 2026-08-29',
  insCode: '216',
  currInsurer: 'Allianz General Insurance Company (Malaysia) Berhad',
  currNcdPercentage: 55,
  currNcdEffDate: '2025-08-30',
  coverType: 'Comprehensive',
  currNcdLvl: 7,
  nextNcdLvl: 8,
  ismSrespCode: '',
  ismSrespValue: '',
  nvicList: [
    { nvic: 'KXY22A', vehicleMarketValue: 56000, vehicleVariant: 'H MY22 5D HATCHBACK CVT CKD 1498 CC', engineType: 'ICE', uom: 'CC', vehicleEngineCC: '1498', recommendInd: 'Y' },
    { nvic: 'KXZ22A', vehicleMarketValue: 62000, vehicleVariant: 'AV MY22 5D HATCHBACK CVT CKD 1498 CC', engineType: 'ICE', uom: 'CC', vehicleEngineCC: '1498' },
    { nvic: 'KXW22A', vehicleMarketValue: 48000, vehicleVariant: 'G MY22 5D HATCHBACK CVT CKD 1498 CC', engineType: 'ICE', uom: 'CC', vehicleEngineCC: '1498' },
  ],
};

const DEMO_QUOTATION: QuotationResponse = {
  contract: { contractNumber: 'CNAZ00004272328', hrtvInd: false, highPerformanceInd: false, excessWaiveInd: false },
  premium: {
    basicPremium: 2215.40,
    annualPremium: 996.93,
    grossPremium: 996.93,
    premiumDue: 1086.48,
    premiumDueRounded: 1086.50,
    stampDuty: 10,
    serviceTaxPercentage: 8,
    serviceTaxAmount: 79.75,
    excessAmount: 0,
    ncdPct: 55,
    ncdAmt: 1218.47,
    rebatePct: 0,
    rebateAmt: 0,
    commissionAmount: 0,
    commissionPercentage: 0,
    basicAnnualPremium: 2215.40,
    premiumDueAfterPTV: 1086.48,
    premiumDueRoundedAfterPTV: 1086.50,
    packagePremium: 0,
  },
  additionalCover: [
    { coverCode: 'PAB-ERW', coverName: 'Motor Enhanced Road Warrior', coverDescription: '24-hour free unlimited towing and roadside assistance, plus car replacement and compassionate cover.', coverNarration: '', displayPremium: 60.00, coverSumInsured: 0, selectedIndicator: false, addDisplayInd: true, sequence: 1, azolSequence: 1, azolHiddenInd: 0 },
    { coverCode: '72', coverName: 'Legal Liability of Passengers', coverDescription: 'Covers legal liabilities from the negligence of passengers in your vehicle.', coverNarration: '', displayPremium: 7.50, coverSumInsured: 0, selectedIndicator: false, addDisplayInd: true, sequence: 2, azolSequence: 2, azolHiddenInd: 0 },
    { coverCode: '89', coverName: 'Compensation for Assessed Repair Time (CART)', coverDescription: 'Daily allowance while your car is being repaired after an accident.', coverNarration: '', displayPremium: 30.00, coverSumInsured: 100, selectedIndicator: false, addDisplayInd: true, sequence: 3, azolSequence: 3, azolHiddenInd: 0 },
    { coverCode: '97A', coverName: 'Windscreen Damage Cover', coverDescription: 'Protection against windscreen, window, and sunroof damage.', coverNarration: '', displayPremium: 80.00, coverSumInsured: 1000, selectedIndicator: false, addDisplayInd: true, sequence: 4, azolSequence: 4, azolHiddenInd: 0 },
    { coverCode: 'A205', coverName: 'Compassionate Flood Cover', coverDescription: 'Flood allowance if your vehicle is damaged due to flood.', coverNarration: '', displayPremium: 0.00, coverSumInsured: 3000, selectedIndicator: true, addDisplayInd: false, sequence: 5, azolSequence: 5, azolHiddenInd: 1, packageCode: 'RP_0100', packageInd: true },
    { coverCode: 'RPPA1', coverName: 'Hospital Income', coverDescription: 'Daily income while hospitalised due to a road accident.', coverNarration: '', displayPremium: 15.00, coverSumInsured: 50, selectedIndicator: false, addDisplayInd: true, sequence: 6, azolSequence: 6, azolHiddenInd: 0 },
    { coverCode: '111', coverName: 'Special Perils (Flood & Landslide)', coverDescription: 'Covers damage caused by flood, storm, tempest, and landslide.', coverNarration: '', displayPremium: 85.00, coverSumInsured: 56000, selectedIndicator: false, addDisplayInd: true, sequence: 7, azolSequence: 7, azolHiddenInd: 0 },
  ],
};

function extractBirthDateFromNRIC(nric: string): string {
  const digits = nric.replace(/-/g, '');
  const yy = digits.substring(0, 2);
  const mm = digits.substring(2, 4);
  const dd = digits.substring(4, 6);
  const year = parseInt(yy, 10) > 30 ? `19${yy}` : `20${yy}`;
  return `${year}-${mm}-${dd}`;
}

function extractGenderFromNRIC(nric: string): Gender {
  const digits = nric.replace(/-/g, '');
  const lastDigit = parseInt(digits[digits.length - 1], 10);
  return lastDigit % 2 === 0 ? 'F' : 'M';
}

export default function ResultsPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <ResultsPage />
    </Suspense>
  );
}

function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const [formData, setFormData] = React.useState<InsuranceFormData | null>(null);
  const [vehicleDetails, setVehicleDetails] = React.useState<VehicleDetailsResponse | null>(null);
  const [selectedNvic, setSelectedNvic] = React.useState<NvicItem | null>(null);
  const [quotation, setQuotation] = React.useState<QuotationResponse | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = React.useState(false);
  const [isUpdatingQuote, setIsUpdatingQuote] = React.useState(false);
  const [selectedAddons, setSelectedAddons] = React.useState<Set<string>>(new Set());
  const [error, setError] = React.useState<string | null>(null);

  const [addonInputs, setAddonInputs] = React.useState<Record<string, { sumInsured?: number; cartDay?: string; cartAmount?: string }>>({});

  const [siBasis, setSiBasis] = React.useState<'MV' | 'AV'>('MV');
  const [avVariants, setAvVariants] = React.useState<AVVariantItem[]>([]);
  const [selectedAvVariant, setSelectedAvVariant] = React.useState<AVVariantItem | null>(null);
  const [isLoadingAv, setIsLoadingAv] = React.useState(false);
  const [isReconditioned, setIsReconditioned] = React.useState<boolean | null>(null);
  const [avAvailable, setAvAvailable] = React.useState(true);

  React.useEffect(() => {
    if (isDemo) {
      setFormData(DEMO_FORM_DATA);
      setVehicleDetails(DEMO_VEHICLE);
      const recommended = DEMO_VEHICLE.nvicList.find((n) => n.recommendInd === 'Y');
      if (recommended) setSelectedNvic(recommended);
      return;
    }

    const storedFormData = sessionStorage.getItem('insuranceFormData');
    const storedVehicle = sessionStorage.getItem('allianz_vehicleDetails');

    if (!storedFormData) {
      router.push('/');
      return;
    }

    try {
      const parsed: InsuranceFormData = JSON.parse(storedFormData);
      setFormData(parsed);

      if (storedVehicle) {
        const vehicle: VehicleDetailsResponse = JSON.parse(storedVehicle);
        setVehicleDetails(vehicle);

        const recommended = vehicle.nvicList?.find((n) => n.recommendInd === 'Y');
        if (recommended) {
          setSelectedNvic(recommended);
        } else if (vehicle.nvicList?.length === 1) {
          setSelectedNvic(vehicle.nvicList[0]);
        }
      }
    } catch {
      router.push('/');
    }
  }, [router, isDemo]);

  React.useEffect(() => {
    if (!vehicleDetails || isDemo) return;

    const fetchAvVariants = async () => {
      setIsLoadingAv(true);
      try {
        const region = 'W';
        const result = await getLOV<{ VariantGrp: AVVariantItem[] }>(
          'avVariant',
          {
            region,
            makeCode: vehicleDetails.avMakeCode,
            modelCode: vehicleDetails.vehicleModel,
            makeYear: vehicleDetails.yearOfManufacture,
          },
        );
        if (result.VariantGrp?.length > 0) {
          setAvVariants(result.VariantGrp);
          setAvAvailable(true);
        } else {
          setAvAvailable(false);
        }
      } catch {
        setAvAvailable(false);
      } finally {
        setIsLoadingAv(false);
      }
    };

    fetchAvVariants();
  }, [vehicleDetails, isDemo]);

  const handleNvicSelect = (nvic: NvicItem) => {
    setSelectedNvic(nvic);
    setQuotation(null);
    sessionStorage.setItem('allianz_selectedNvic', JSON.stringify(nvic));
  };

  const handleGenerateQuote = async () => {
    if (!formData || !vehicleDetails) return;

    const useAv = siBasis === 'AV' && selectedAvVariant;
    const useMv = siBasis === 'MV' && selectedNvic;

    if (!useAv && !useMv) return;

    setIsLoadingQuote(true);
    setError(null);

    try {
      let result: QuotationResponse;

      if (isDemo) {
        await new Promise((r) => setTimeout(r, 800));
        result = DEMO_QUOTATION;
      } else {
        const noOfClaims = sessionStorage.getItem('allianz_noOfClaims') || '0';
        const reconInd = isReconditioned ? 'Y' : 'N';

        try {
          const ubb2Result = await checkUBB({
            ReferenceNo: vehicleDetails.contractNumber,
            ProductCat: 'MPC',
            SourceSystem: 'PTR',
            ClaimsExp: noOfClaims,
            ReconInd: reconInd,
            ExcessWaiveInd: false,
            CheckUbbInd: 2,
            Policy: {
              PolicyEffectiveDate: vehicleDetails.polEffectiveDate,
              PolicyExpiryDate: vehicleDetails.polExpiryDate,
              Client: {
                IdentificationNumber: formData.nric.replace(/-/g, ''),
                IdType: formData.identityType || 'NRIC',
                Age: '30',
              },
              RiskList: [{
                RiskId: '1',
                InsuredPerson: {
                  IdentificationNumber: formData.nric.replace(/-/g, ''),
                  IdType: formData.identityType || 'NRIC',
                },
                Vehicle: {
                  AvCode: useAv ? selectedAvVariant!.AvCode : '',
                  Capacity: vehicleDetails.vehicleEngineCC,
                  MakeCode: vehicleDetails.makeCode,
                  Model: vehicleDetails.modelCode,
                  PiamModel: vehicleDetails.vehicleModel,
                  Seat: vehicleDetails.seatingCapacity,
                  VehicleNo: vehicleDetails.vehicleLicenseId,
                  YearOfManufacture: vehicleDetails.yearOfManufacture,
                  NamedDriverList: [],
                  HighPerformanceInd: false,
                  HrtvInd: false,
                },
                CoverList: [{
                  CoverPremium: {
                    SumInsured: useAv ? selectedAvVariant!.SumInsured : selectedNvic!.vehicleMarketValue.toFixed(2),
                  },
                }],
              }],
            },
          });

          if (ubb2Result.ReferRiskList?.length > 0) {
            setError('We are unable to process your application online. Your policy requires further review by an underwriter.');
            setIsLoadingQuote(false);
            return;
          }
        } catch (ubbErr: unknown) {
          const ubbApiErr = ubbErr as { code?: string; message?: string };
          if (ubbApiErr?.code === 'UBB_REFER') {
            setError('We are unable to process your application online. Please contact our customer service.');
            setIsLoadingQuote(false);
            return;
          }
        }

        const birthDate = extractBirthDateFromNRIC(formData.nric);
        const gender = formData.customerType === 'company' ? 'C' as Gender : extractGenderFromNRIC(formData.nric);
        const maritalStatus: MaritalStatus = formData.customerType === 'company' ? '3' : '0';

        const sumInsured = useAv
          ? selectedAvVariant!.SumInsured
          : selectedNvic!.vehicleMarketValue.toFixed(2);

        result = await generateQuote({
          transactionType: 'NWOO',
          contractNumber: vehicleDetails.contractNumber,
          effectiveDate: vehicleDetails.polEffectiveDate,
          expirationDate: vehicleDetails.polExpiryDate,
          person: {
            identityType: (formData.identityType as IdentityType) || 'NRIC',
            identityNumber: formData.nric.replace(/-/g, ''),
            gender,
            birthDate,
            maritalStatus,
            postalCode: formData.postcode,
            noOfClaims: '0',
          },
          vehicle: {
            vehicleLicenseId: vehicleDetails.vehicleLicenseId,
            vehicleMake: vehicleDetails.makeCode,
            vehicleModel: vehicleDetails.modelCode,
            vehicleEngineCC: parseInt(vehicleDetails.vehicleEngineCC, 10) || parseInt(selectedNvic?.vehicleEngineCC || selectedAvVariant?.VehicleEngineCC?.toString() || '0', 10),
            yearOfManufacture: vehicleDetails.yearOfManufacture,
            occupantsNumber: vehicleDetails.seatingCapacity,
            ncdPercentage: vehicleDetails.ncdPercentage,
            sumInsured,
            avCode: useAv ? selectedAvVariant!.AvCode : '',
            mvInd: useAv ? 'N' : 'Y',
          },
        });
      }

      setQuotation(result);
      sessionStorage.setItem('allianz_quotation', JSON.stringify(result));

      const preSelected = new Set<string>();
      result.additionalCover?.forEach((cover) => {
        if (cover.selectedIndicator) {
          preSelected.add(cover.coverCode);
        }
      });
      setSelectedAddons(preSelected);
    } catch (err: unknown) {
      console.error('Quote generation error:', err);
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Failed to generate quotation. Please try again.');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const addonsTotal = React.useMemo(() => {
    if (!quotation) return 0;
    return quotation.additionalCover
      .filter((c) => selectedAddons.has(c.coverCode))
      .reduce((sum, c) => sum + c.displayPremium, 0);
  }, [quotation, selectedAddons]);

  const totalWithAddons = React.useMemo(() => {
    if (!quotation) return 0;
    return quotation.premium.premiumDueRounded + addonsTotal;
  }, [quotation, addonsTotal]);

  const handleToggleAddon = async (cover: AdditionalCoverItem) => {
    if (!quotation || !vehicleDetails || isUpdatingQuote) return;

    const newSelected = new Set(selectedAddons);
    if (newSelected.has(cover.coverCode)) {
      newSelected.delete(cover.coverCode);
    } else {
      newSelected.add(cover.coverCode);
    }
    setSelectedAddons(newSelected);

    setIsUpdatingQuote(true);
    try {
      const additionalCover = quotation.additionalCover
        .filter((c) => newSelected.has(c.coverCode))
        .map((c) => {
          const inputs = addonInputs[c.coverCode];
          return {
            coverCode: c.coverCode,
            coverSumInsured: inputs?.sumInsured ?? c.coverSumInsured,
            ...(inputs?.cartDay && { cartDay: inputs.cartDay }),
            ...(inputs?.cartAmount && { cartAmount: inputs.cartAmount }),
          };
        });

      const updatedQuote = await updateQuote({
        transactionType: 'NWOO',
        contractNumber: quotation.contract.contractNumber,
        effectiveDate: vehicleDetails.polEffectiveDate,
        expirationDate: vehicleDetails.polExpiryDate,
        additionalCover,
      });

      setQuotation(updatedQuote);
      sessionStorage.setItem('allianz_quotation', JSON.stringify(updatedQuote));
    } catch (err) {
      console.error('Update quotation error:', err);
    } finally {
      setIsUpdatingQuote(false);
    }
  };

  const handleAddonInputChange = (coverCode: string, field: string, value: string) => {
    setAddonInputs((prev) => ({
      ...prev,
      [coverCode]: { ...prev[coverCode], [field]: field === 'sumInsured' ? parseInt(value, 10) || 0 : value },
    }));
  };

  const handleProceedToPayment = () => {
    if (!quotation) return;
    sessionStorage.setItem('allianz_quotation', JSON.stringify(quotation));
    sessionStorage.setItem('allianz_selectedAddons', JSON.stringify([...selectedAddons]));
    router.push('/customer-details');
  };

  if (!formData && !isDemo) return null;

  return (
    <PageLayout>
      <Container className="py-8 sm:py-10">
        <StepIndicator steps={steps} currentStep={2} />

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {quotation ? 'Your insurance quote' : 'Confirm your vehicle'}
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {quotation
                ? 'Review your premium breakdown and customize coverage below.'
                : vehicleDetails
                  ? 'We found your vehicle. Confirm the variant that matches yours.'
                  : 'Loading vehicle details...'}
            </p>
          </div>

          {/* Vehicle Info */}
          {vehicleDetails && (
            <Card className="max-w-lg mx-auto border-border/60 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-semibold">
                  <Car className="w-4 h-4 mr-2 text-primary" />
                  {vehicleDetails.vehicleMake} {vehicleDetails.vehicleModelDesc || vehicleDetails.vehicleModel}
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    {vehicleDetails.yearOfManufacture}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Plate Number</span>
                    <p className="font-semibold">{vehicleDetails.vehicleLicenseId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Engine</span>
                    <p className="font-semibold">{vehicleDetails.vehicleEngineCC} CC</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">No Claim Discount</span>
                    <p className="font-semibold text-green-600">{vehicleDetails.ncdPercentage}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Coverage Type</span>
                    <p className="font-semibold">{vehicleDetails.coverType || 'Comprehensive'}</p>
                  </div>
                  <div className="col-span-2 pt-2 mt-1 border-t border-border/60">
                    <span className="text-muted-foreground text-xs">Coverage Period</span>
                    <p className="font-medium text-sm">{vehicleDetails.polEffectiveDate} to {vehicleDetails.polExpiryDate}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground text-xs">Current Insurer</span>
                    <p className="font-medium text-sm">{vehicleDetails.currInsurer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Documents */}
          {vehicleDetails && (
            <div className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
                <a
                  href="/docs/allianz-motor-pds.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Product Disclosure Sheet
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.allianz.com.my/motor-comprehensive-insurance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Policy Wording
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* SI Basis & Reconditioned */}
          {vehicleDetails && !quotation && (
            <div className="max-w-2xl mx-auto space-y-4">
              {avAvailable && !isLoadingAv && (
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="font-semibold text-sm">Sum insured basis</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose how your vehicle is valued for coverage.</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => { setSiBasis('MV'); setQuotation(null); }}
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        siBasis === 'MV'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Market Value
                    </button>
                    <button
                      onClick={() => { setSiBasis('AV'); setQuotation(null); }}
                      disabled={isReconditioned === true}
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        siBasis === 'AV'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Agreed Value
                    </button>
                  </div>

                  <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3">
                    <p className="text-xs font-medium text-amber-900 mb-2">Is your vehicle reconditioned?</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="reconditioned"
                          checked={isReconditioned === false}
                          onChange={() => { setIsReconditioned(false); }}
                          className="text-primary"
                        />
                        <span>No</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="reconditioned"
                          checked={isReconditioned === true}
                          onChange={() => { setIsReconditioned(true); setSiBasis('MV'); }}
                          className="text-primary"
                        />
                        <span>Yes</span>
                      </label>
                    </div>
                    {isReconditioned === true && (
                      <p className="text-xs text-amber-700 mt-2">
                        Reconditioned vehicles are only eligible for Market Value basis.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* AV Variant Selection */}
              {siBasis === 'AV' && avVariants.length > 0 && (
                <div className="space-y-3">
                  <div className="text-center space-y-1">
                    <h3 className="font-semibold text-base">Select agreed value variant</h3>
                    <p className="text-xs text-muted-foreground">Choose the variant and sum insured.</p>
                  </div>
                  <div className="space-y-2">
                    {avVariants.map((av) => {
                      const isSelected = selectedAvVariant?.AvCode === av.AvCode;
                      return (
                        <button
                          key={av.AvCode}
                          onClick={() => setSelectedAvVariant(av)}
                          className={`w-full text-left p-3.5 rounded-xl border-2 transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border/60 hover:border-primary/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{av.Variant}</p>
                              <p className="text-xs text-muted-foreground">{av.VehicleEngineCC} CC | {av.MakeYear}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-base">RM {parseFloat(av.SumInsured).toLocaleString('en-MY')}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">Sum Insured</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-center pt-2">
                    <Button
                      onClick={handleGenerateQuote}
                      disabled={!selectedAvVariant || isLoadingQuote}
                      className="h-12 px-8 text-base font-semibold"
                    >
                      {isLoadingQuote ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Calculating...</span>
                        </div>
                      ) : (
                        'Get my quote'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NVIC Variant Selection (MV) */}
          {vehicleDetails && !quotation && siBasis === 'MV' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-base">Which variant do you own?</h3>
                <p className="text-xs text-muted-foreground">
                  Market value determines your sum insured — the maximum payout for total loss.
                </p>
              </div>

              <div className="space-y-2">
                {vehicleDetails.nvicList
                  ?.slice()
                  .sort((a, b) => b.vehicleMarketValue - a.vehicleMarketValue)
                  .map((nvic) => {
                    const isSelected = selectedNvic?.nvic === nvic.nvic;
                    const variantParts = nvic.vehicleVariant.split(' ');
                    const trimName = variantParts[0];

                    return (
                      <button
                        key={nvic.nvic}
                        onClick={() => handleNvicSelect(nvic)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border/60 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {isSelected ? <Check className="w-4 h-4" /> : trimName.substring(0, 2)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{trimName} Variant</p>
                              {nvic.recommendInd === 'Y' && (
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded uppercase tracking-wide">
                                  Best Match
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {nvic.vehicleVariant}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-sm text-foreground">
                              RM {nvic.vehicleMarketValue.toLocaleString('en-MY', { minimumFractionDigits: 0 })}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Market Value</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>

              <div className="flex items-start gap-2 px-3 py-2.5 bg-muted/50 rounded-lg">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Not sure which variant? Check your vehicle registration card (grant) or previous insurance policy.
                </p>
              </div>

              <div className="text-center pt-2">
                <Button
                  onClick={handleGenerateQuote}
                  disabled={!selectedNvic || isLoadingQuote}
                  className="h-12 px-8 text-base font-semibold"
                >
                  {isLoadingQuote ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Calculating...</span>
                    </div>
                  ) : (
                    'Get my quote'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Quotation Display */}
          {quotation && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Total Premium */}
              <div className="text-center py-8 bg-muted/30 rounded-2xl border border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Annual Premium</p>
                <p className="text-4xl font-bold text-foreground tracking-tight transition-all">
                  RM {totalWithAddons.toFixed(2)}
                </p>
                {addonsTotal > 0 && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Base RM {quotation.premium.premiumDueRounded.toFixed(2)} + Add-ons RM {addonsTotal.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Comprehensive &middot; {selectedNvic?.vehicleVariant?.split(' ')[0]} variant &middot; Sum insured RM {selectedNvic?.vehicleMarketValue.toLocaleString('en-MY')}
                </p>
              </div>

              {/* Premium Breakdown */}
              <Card className="border-border/60 shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm font-semibold">
                    <Shield className="w-4 h-4 mr-2 text-primary" />
                    Premium breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Basic Premium</span>
                    <span>RM {quotation.premium.basicPremium.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>NCD Discount ({quotation.premium.ncdPct}%)</span>
                    <span>- RM {quotation.premium.ncdAmt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Premium</span>
                    <span>RM {quotation.premium.annualPremium.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Tax ({quotation.premium.serviceTaxPercentage}%)</span>
                    <span>RM {quotation.premium.serviceTaxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stamp Duty</span>
                    <span>RM {quotation.premium.stampDuty.toFixed(2)}</span>
                  </div>
                  {quotation.premium.excessAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Excess</span>
                      <span>RM {quotation.premium.excessAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {addonsTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selected Add-ons</span>
                      <span>+ RM {addonsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border/60 flex justify-between items-center">
                    <span className="font-bold text-sm">Total</span>
                    <span className="font-bold text-lg text-primary">
                      RM {totalWithAddons.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Covers */}
              {quotation.additionalCover?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Enhance your coverage</h3>
                    <span className="text-xs text-muted-foreground">Optional add-ons</span>
                  </div>
                  {quotation.additionalCover
                    .filter((c) => c.azolHiddenInd !== 1)
                    .map((cover) => {
                      const isSelected = selectedAddons.has(cover.coverCode);
                      return (
                        <button
                          key={cover.coverCode}
                          onClick={() => handleToggleAddon(cover)}
                          disabled={isUpdatingQuote}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border/60 hover:border-primary/30'
                          } ${isUpdatingQuote ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                              isSelected
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground/30'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm">{cover.coverName}</span>
                              {cover.coverDescription && (
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                  {cover.coverDescription}
                                </p>
                              )}
                              {isSelected && cover.coverCode === '97A' && (
                                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                  <label className="text-xs text-muted-foreground">Windscreen Sum Insured (RM)</label>
                                  <input
                                    type="number"
                                    min={300}
                                    max={5000}
                                    step={100}
                                    value={addonInputs[cover.coverCode]?.sumInsured || cover.coverSumInsured || 1000}
                                    onChange={(e) => handleAddonInputChange(cover.coverCode, 'sumInsured', e.target.value)}
                                    className="mt-1 w-32 rounded-lg border border-input px-2 py-1 text-xs"
                                  />
                                </div>
                              )}
                              {isSelected && cover.coverCode === '89' && (
                                <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                                  <div>
                                    <label className="text-xs text-muted-foreground">Days</label>
                                    <input
                                      type="number"
                                      min={1}
                                      max={30}
                                      value={addonInputs[cover.coverCode]?.cartDay || '7'}
                                      onChange={(e) => handleAddonInputChange(cover.coverCode, 'cartDay', e.target.value)}
                                      className="mt-1 w-16 rounded-lg border border-input px-2 py-1 text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">Amount/Day (RM)</label>
                                    <input
                                      type="number"
                                      min={50}
                                      max={300}
                                      step={50}
                                      value={addonInputs[cover.coverCode]?.cartAmount || '100'}
                                      onChange={(e) => handleAddonInputChange(cover.coverCode, 'cartAmount', e.target.value)}
                                      className="mt-1 w-20 rounded-lg border border-input px-2 py-1 text-xs"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className={`font-semibold text-sm flex-shrink-0 ${
                              cover.displayPremium === 0 ? 'text-green-600' : ''
                            }`}>
                              {cover.displayPremium === 0 ? 'FREE' : `+ RM ${cover.displayPremium.toFixed(2)}`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/60 -mx-5 px-5 py-4 sm:relative sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:mx-0 sm:px-0 sm:py-0">
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-lg mx-auto">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuotation(null);
                      setSelectedNvic(null);
                    }}
                    className="w-full sm:w-auto h-11"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change variant
                  </Button>

                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!quotation}
                    className="w-full sm:w-auto h-12 text-base font-semibold"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed &middot; RM {totalWithAddons.toFixed(2)}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* No vehicle details fallback */}
          {!vehicleDetails && formData && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                No vehicle details available. The backend may not be running.
              </p>
              <Button variant="outline" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to form
              </Button>
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
