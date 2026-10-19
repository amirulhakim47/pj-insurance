'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AllianzLogo } from '@/components/ui/allianz-logo';
import { PageLayout, Container, StepIndicator } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Check, ChevronDown, Shield, Car, Info, FileText, ExternalLink, HelpCircle } from 'lucide-react';
import {
  AdditionalCoveragesSection,
  RoadRangersTooltipButton,
} from '@/components/AdditionalCoveragesSection';
import { isCoverVisibleForDcAuto } from '@/config/addon-tooltips';
import { generateQuote, getLOV, checkUBB, updateQuote } from '@/lib/allianz-api';
import { createQuoteUpdateGate } from '@/lib/quote-update-gate';
import { ageOnDate, birthDateFromNric } from '@/lib/age';
import { formatCoveragePeriod } from '@/lib/date-format';
import {
  buildAdditionalCoverPayload,
  clampWindscreenSumInsured,
  clampGasKitSumInsured,
  defaultAddonInputsForCover,
  getUniqueAvVariantNames,
  getAvTierOptions,
  getAvSumInsuredRange,
  type AddonInputState,
} from '@/lib/addon-quote';
import { applyDemoQuoteUpdate } from '@/lib/demo-quote';
import {
  ALLIANZ_IS_DEMO_KEY,
  restoreInsuranceFormDraftFromSubmitted,
  vehicleDetailsPagePath,
} from '@/lib/insurance-session';
import {
  ehailingDriverFromPolicyholder,
  validateQuotationStepBeforeProceed,
} from '@/lib/quote-step-validation';
import {
  AdditionalDriverFormFields,
  type AdditionalDriverFormValues,
} from '@/components/AdditionalDriverFormFields';
import {
  formatDriverIdentityInput,
  reformatDriverIdForTypeChange,
  validateNamedDriverFields,
} from '@/lib/validations';
import { syncQuotePremiumForPayment } from '@/lib/quote-premium-sync';
import { DEMO_AV_VARIANTS_FROM_UAT_LOV } from '@/data/demoAvVariants';
import {
  ALLIANZ_DOCUMENTS,
  AGENT_DISPLAY_NAME,
  RAHMAH_MAX_ENGINE_CC,
  RAHMAH_MAX_SUM_INSURED,
  RAHMAH_PACKAGE_CODE,
  RAHMAH_INCLUSIONS,
} from '@/config/allianz-documents';
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

const STEPS = ['Vehicle Details', 'Quotation', 'Customer Info', 'Review & Pay'];

function resolvePersonGender(formData: InsuranceFormData): Gender {
  if (formData.customerType === 'company') return 'C';
  if (formData.gender === 'M' || formData.gender === 'F') return formData.gender;
  return extractGenderFromNRIC(formData.nric);
}

interface AdditionalDriverInfo {
  fullName: string;
  nationality: string;
  idType: string;
  idNumber: string;
}

const DEMO_FORM_DATA: InsuranceFormData = {
  fullName: 'DEMO USER', vehicleType: 'car', plateNumber: 'VAP2104', nric: '841103-01-1116',
  postcode: '50000', customerType: 'individual', identityType: 'NRIC', email: 'demo@example.com',
  phoneNumber: '0121234567', gender: 'M', nationality: 'MALAYSIA', maritalStatus: '0',
  isEhailing: false, isElectricVehicle: false, pdpaConsent: true,
};

const DEMO_VEHICLE: VehicleDetailsResponse = {
  contractNumber: 'CNAZ00004272328', vehicleLicenseId: 'VAP2104', avMakeCode: '33', makeCode: '33',
  vehicleMake: 'PERODUA', modelCode: '10', vehicleModel: 'MYVI', vehicleModelDesc: 'MYVI',
  vehicleEngineCC: '1498', vehicleEngine: 'K3M48C', vehicleChassis: 'PM2B200S003264462',
  yearOfManufacture: '2022', seatingCapacity: 5, ncdPercentage: 55, prevPolExpiryDate: '2026-08-29',
  polEffectiveDate: '2026-08-30', polExpiryDate: '2027-08-29', lapseDays: 0,
  nextNcdEffDate: '2026-08-30', currPeriodCover: '2025-08-30 to 2026-08-29', insCode: '216',
  currInsurer: 'Allianz General Insurance Company (Malaysia) Berhad', currNcdPercentage: 55,
  currNcdEffDate: '2025-08-30', coverType: 'Comprehensive', currNcdLvl: 7, nextNcdLvl: 8,
  ismSrespCode: '', ismSrespValue: '',
  nvicList: [
    { nvic: 'KXY22A', vehicleMarketValue: 56000, vehicleVariant: 'H MY22 5D HATCHBACK CVT CKD 1498 CC', engineType: 'ICE', uom: 'CC', vehicleEngineCC: '1498', recommendInd: 'Y' },
    { nvic: 'KXZ22A', vehicleMarketValue: 62000, vehicleVariant: 'AV MY22 5D HATCHBACK CVT CKD 1498 CC', engineType: 'ICE', uom: 'CC', vehicleEngineCC: '1498' },
    { nvic: 'KXW22A', vehicleMarketValue: 48000, vehicleVariant: 'G MY22 5D HATCHBACK CVT CKD 1498 CC', engineType: 'ICE', uom: 'CC', vehicleEngineCC: '1498' },
  ],
};

const DEMO_QUOTATION: QuotationResponse = {
  contract: { contractNumber: 'CNAZ00004272328', hrtvInd: false, highPerformanceInd: false, excessWaiveInd: false },
  premium: {
    basicPremium: 2215.40, annualPremium: 996.93, grossPremium: 996.93, premiumDue: 1086.48,
    premiumDueRounded: 1086.50, stampDuty: 10, serviceTaxPercentage: 8, serviceTaxAmount: 79.75,
    excessAmount: 0, ncdPct: 55, ncdAmt: 1218.47, rebatePct: 0, rebateAmt: 0,
    commissionAmount: 0, commissionPercentage: 0, basicAnnualPremium: 2215.40,
    premiumDueAfterPTV: 1086.48, premiumDueRoundedAfterPTV: 1086.50, packagePremium: 0,
  },
  additionalCover: [
    { coverCode: 'PAB-ERW', coverName: 'Motor Enhanced Road Warrior', coverDescription: '24-hour free unlimited towing and roadside assistance, plus car replacement and compassionate cover.', coverNarration: '', displayPremium: 60.00, coverSumInsured: 0, selectedIndicator: false, addDisplayInd: true, sequence: 2, azolSequence: 2, azolHiddenInd: 0 },
    { coverCode: '72', coverName: 'Legal Liability of Passengers for Negligent Acts', coverDescription: 'Covers legal liabilities from the negligence of passengers in your vehicle.', coverNarration: '', displayPremium: 7.50, coverSumInsured: 0, selectedIndicator: false, addDisplayInd: true, sequence: 6, azolSequence: 6, azolHiddenInd: 0 },
    { coverCode: '89', coverName: 'Cover for Windscreens, Windows And Sunroof', coverDescription: 'Protection against windscreen, window, and sunroof damage.', coverNarration: '', displayPremium: 80.00, coverSumInsured: 500, selectedIndicator: false, addDisplayInd: true, sequence: 4, azolSequence: 4, azolHiddenInd: 0 },
    { coverCode: 'A202', coverName: 'Private Hire Car (e-Hailing)', coverDescription: 'Coverage for e-Hailing drivers.', coverNarration: '', displayPremium: 45.00, coverSumInsured: 0, selectedIndicator: false, addDisplayInd: true, sequence: 5, azolSequence: 5, azolHiddenInd: 0 },
    { coverCode: 'A209', coverName: 'Car Break-In/Robbery', coverDescription: 'Reimburses expenses from car break-in.', coverNarration: '', displayPremium: 3.00, coverSumInsured: 0, selectedIndicator: false, addDisplayInd: true, sequence: 7, azolSequence: 7, azolHiddenInd: 0 },
    { coverCode: '57', coverName: 'Inclusion of Special Perils', coverDescription: 'Covers damage from flood, storm, landslide.', coverNarration: '', displayPremium: 96.00, coverSumInsured: 0, selectedIndicator: false, addDisplayInd: true, sequence: 8, azolSequence: 8, azolHiddenInd: 0 },
    { coverCode: '111', coverName: 'Current Year NCD Relief', coverDescription: 'Protect your NCD entitlement.', coverNarration: '', displayPremium: 30.00, coverSumInsured: 0, selectedIndicator: false, addDisplayInd: true, sequence: 16, azolSequence: 16, azolHiddenInd: 0 },
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
  const isDemo =
    process.env.NEXT_PUBLIC_ALLOW_DEMO === 'true' && searchParams.get('demo') === 'true';
  const [formData, setFormData] = React.useState<InsuranceFormData | null>(null);
  const [vehicleDetails, setVehicleDetails] = React.useState<VehicleDetailsResponse | null>(null);
  const [selectedNvic, setSelectedNvic] = React.useState<NvicItem | null>(null);
  const [quotation, setQuotation] = React.useState<QuotationResponse | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = React.useState(false);
  const [isUpdatingQuote, setIsUpdatingQuote] = React.useState(false);
  const [selectedAddons, setSelectedAddons] = React.useState<Set<string>>(new Set());
  const [error, setError] = React.useState<string | null>(null);

  const [addonInputs, setAddonInputs] = React.useState<Record<string, { sumInsured?: number; cartDay?: string; cartAmount?: string; planCode?: string }>>({});

  const [siBasis, setSiBasis] = React.useState<'MV' | 'AV'>('MV');
  const [avVariants, setAvVariants] = React.useState<AVVariantItem[]>([]);
  const [selectedAvVariantName, setSelectedAvVariantName] = React.useState<string | null>(null);
  const [selectedAvVariant, setSelectedAvVariant] = React.useState<AVVariantItem | null>(null);
  const [isLoadingAv, setIsLoadingAv] = React.useState(false);
  const [isReconditioned, setIsReconditioned] = React.useState<boolean | null>(null);
  const [recondError, setRecondError] = React.useState<string | null>(null);
  const [avAvailable, setAvAvailable] = React.useState(true);
  const [showRecondTooltip, setShowRecondTooltip] = React.useState(false);

  const [driverPlan, setDriverPlan] = React.useState<'0' | '1' | '2' | 'unlimited'>('0');
  const [additionalDrivers, setAdditionalDrivers] = React.useState<AdditionalDriverInfo[]>([]);
  const [additionalDriverErrors, setAdditionalDriverErrors] = React.useState<
    Record<number, { fullName?: string; idNumber?: string }>
  >({});
  const [ehailingDriver, setEhailingDriver] = React.useState<{ fullName: string; idNumber: string }>({ fullName: '', idNumber: '' });
  const [ehailingErrors, setEhailingErrors] = React.useState<{ fullName?: string; idNumber?: string }>({});
  const [rahmahApplied, setRahmahApplied] = React.useState(false);
  const [pendingAddonSync, setPendingAddonSync] = React.useState(false);
  const addonSyncTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteUpdateGate = React.useRef(createQuoteUpdateGate());

  const avVariantNames = React.useMemo(
    () => getUniqueAvVariantNames(avVariants),
    [avVariants],
  );

  const avTiersForSelectedVariant = React.useMemo(() => {
    if (!selectedAvVariantName) return [];
    return getAvTierOptions(avVariants, selectedAvVariantName);
  }, [avVariants, selectedAvVariantName]);

  const canGenerateQuote = React.useMemo(() => {
    if (isReconditioned === null) return false;
    if (siBasis === 'MV') return Boolean(selectedNvic);
    return Boolean(selectedAvVariantName && selectedAvVariant);
  }, [isReconditioned, siBasis, selectedNvic, selectedAvVariantName, selectedAvVariant]);

  React.useEffect(() => {
    if (isDemo) {
      setFormData(DEMO_FORM_DATA);
      setVehicleDetails(DEMO_VEHICLE);
      sessionStorage.setItem('insuranceFormData', JSON.stringify(DEMO_FORM_DATA));
      sessionStorage.setItem('allianz_vehicleDetails', JSON.stringify(DEMO_VEHICLE));
      const recommended = DEMO_VEHICLE.nvicList.find((n) => n.recommendInd === 'Y');
      if (recommended) setSelectedNvic(recommended);
      return;
    }

    const storedFormData = sessionStorage.getItem('insuranceFormData');
    const storedVehicle = sessionStorage.getItem('allianz_vehicleDetails');

    if (!storedFormData) { router.push('/'); return; }

    try {
      const parsed: InsuranceFormData = JSON.parse(storedFormData);
      setFormData(parsed);

      if (storedVehicle) {
        const vehicle: VehicleDetailsResponse = JSON.parse(storedVehicle);
        setVehicleDetails(vehicle);

        const recommended = vehicle.nvicList?.find((n) => n.recommendInd === 'Y');
        if (recommended) setSelectedNvic(recommended);
        else if (vehicle.nvicList?.length === 1) setSelectedNvic(vehicle.nvicList[0]);
      }
    } catch { router.push('/'); }
  }, [router, isDemo]);

  React.useEffect(() => {
    if (!vehicleDetails) return;
    if (isDemo) {
      setAvVariants(DEMO_AV_VARIANTS_FROM_UAT_LOV);
      setAvAvailable(true);
      setIsLoadingAv(false);
      return;
    }
    const fetchAvVariants = async () => {
      setIsLoadingAv(true);
      try {
        const result = await getLOV<{ VariantGrp: AVVariantItem[] }>('avVariant', {
          region: 'W', makeCode: vehicleDetails.avMakeCode,
          modelCode: vehicleDetails.vehicleModel, makeYear: vehicleDetails.yearOfManufacture,
        });
        if (result.VariantGrp?.length > 0) { setAvVariants(result.VariantGrp); setAvAvailable(true); }
        else setAvAvailable(false);
      } catch { setAvAvailable(false); }
      finally { setIsLoadingAv(false); }
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
    if (isReconditioned === null) {
      setRecondError('Please select whether your vehicle is reconditioned.');
      return;
    }
    setRecondError(null);
    const useAv = siBasis === 'AV' && selectedAvVariant;
    const useMv = siBasis === 'MV' && selectedNvic;
    if (!useAv && !useMv) return;

    setIsLoadingQuote(true);
    setError(null);
    quoteUpdateGate.current.reset();

    try {
      let result: QuotationResponse;

      if (isDemo) {
        await new Promise((r) => setTimeout(r, 800));
        result = DEMO_QUOTATION;
      } else {
        const noOfClaims = sessionStorage.getItem('allianz_noOfClaims') || '0';
        const reconInd = isReconditioned ? 'Y' : 'N';
        const nricBirthDate =
          formData.identityType === 'NRIC'
            ? birthDateFromNric(formData.nric, vehicleDetails.polEffectiveDate)
            : null;
        // TODO: confirm with Allianz what Age to send for passport / other ID / company customers.
        const applicantAge = nricBirthDate
          ? String(ageOnDate(nricBirthDate, vehicleDetails.polEffectiveDate))
          : '30';

        try {
          const ubb2Result = await checkUBB({
            ReferenceNo: vehicleDetails.contractNumber, ProductCat: 'MT', SourceSystem: 'DCAUTO',
            ClaimsExp: noOfClaims, ReconInd: reconInd, ExcessWaiveInd: false, CheckUbbInd: 2,
            Policy: {
              PolicyEffectiveDate: vehicleDetails.polEffectiveDate,
              PolicyExpiryDate: vehicleDetails.polExpiryDate,
              Client: { IdentificationNumber: formData.nric.replace(/-/g, ''), IdType: formData.identityType || 'NRIC', Age: applicantAge },
              RiskList: [{
                RiskId: '1',
                InsuredPerson: { IdentificationNumber: formData.nric.replace(/-/g, ''), IdType: formData.identityType || 'NRIC' },
                Vehicle: {
                  AvCode: useAv ? selectedAvVariant!.AvCode : '', Capacity: vehicleDetails.vehicleEngineCC,
                  MakeCode: vehicleDetails.makeCode, Model: vehicleDetails.modelCode,
                  PiamModel: vehicleDetails.vehicleModel, Seat: vehicleDetails.seatingCapacity,
                  VehicleNo: vehicleDetails.vehicleLicenseId, YearOfManufacture: vehicleDetails.yearOfManufacture,
                  NamedDriverList: [], HighPerformanceInd: false, HrtvInd: false,
                },
                CoverList: [{ CoverPremium: { SumInsured: useAv ? selectedAvVariant!.SumInsured : selectedNvic!.vehicleMarketValue.toFixed(2) } }],
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

        const birthDate =
          formData.identityType === 'NRIC'
            ? extractBirthDateFromNRIC(formData.nric)
            : extractBirthDateFromNRIC(formData.nric);
        const gender = resolvePersonGender(formData);
        const maritalStatus: MaritalStatus =
          formData.maritalStatus || (formData.customerType === 'company' ? '3' : '0');
        const sumInsured = useAv ? selectedAvVariant!.SumInsured : selectedNvic!.vehicleMarketValue.toFixed(2);
        const engineCc =
          parseInt(vehicleDetails.vehicleEngineCC, 10) ||
          parseInt(selectedNvic?.vehicleEngineCC || selectedAvVariant?.VehicleEngineCC?.toString() || '0', 10);

        result = await generateQuote({
          transactionType: 'NWOO', contractNumber: vehicleDetails.contractNumber,
          effectiveDate: vehicleDetails.polEffectiveDate, expirationDate: vehicleDetails.polExpiryDate,
          person: { identityType: (formData.identityType as IdentityType) || 'NRIC', identityNumber: formData.nric.replace(/-/g, ''), gender, birthDate, maritalStatus, postalCode: formData.postcode, noOfClaims: '0' },
          vehicle: {
            vehicleLicenseId: vehicleDetails.vehicleLicenseId, vehicleMake: vehicleDetails.makeCode,
            vehicleModel: vehicleDetails.modelCode,
            vehicleEngineCC: engineCc,
            yearOfManufacture: vehicleDetails.yearOfManufacture, occupantsNumber: vehicleDetails.seatingCapacity,
            ncdPercentage: vehicleDetails.ncdPercentage, sumInsured,
            avCode: useAv ? selectedAvVariant!.AvCode : '', mvInd: useAv ? 'N' : 'Y',
          },
        });

        const siNum = parseFloat(sumInsured);
        const rahmahFromApi =
          result.packageCodes?.find((c) => c.toUpperCase().includes('RAHMAH')) ?? null;
        const eligibleRahmah =
          siNum <= RAHMAH_MAX_SUM_INSURED && engineCc <= RAHMAH_MAX_ENGINE_CC;
        const packageToApply = rahmahFromApi ?? (eligibleRahmah ? RAHMAH_PACKAGE_CODE : null);

        if (packageToApply) {
          try {
            result = await updateQuote({
              transactionType: 'NWOO',
              contractNumber: vehicleDetails.contractNumber,
              effectiveDate: vehicleDetails.polEffectiveDate,
              expirationDate: vehicleDetails.polExpiryDate,
              packageCode: packageToApply,
              additionalCover: [],
            });
            setRahmahApplied(true);
          } catch {
            setRahmahApplied(false);
          }
        } else {
          setRahmahApplied(false);
        }
      }

      setQuotation(result);
      sessionStorage.setItem('allianz_quotation', JSON.stringify(result));
      if (isDemo) {
        sessionStorage.setItem('allianz_isDemo', 'true');
        try {
          await syncQuotePremiumForPayment(
            result.contract.contractNumber,
            result.premium.premiumDueRounded,
            { demo: true },
          );
        } catch (syncErr) {
          console.warn('[demo] Initial quote premium sync failed:', syncErr);
        }
      }

      const preSelected = new Set<string>();
      result.additionalCover?.forEach((cover) => {
        if (cover.selectedIndicator && isCoverVisibleForDcAuto(cover)) {
          preSelected.add(cover.coverCode);
        }
      });
      setSelectedAddons(preSelected);
      if (preSelected.has('A202')) {
        setEhailingDriver(ehailingDriverFromPolicyholder(formData));
      }
    } catch (err: unknown) {
      console.error('Quote generation error:', err);
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Failed to generate quotation. Please try again.');
    } finally { setIsLoadingQuote(false); }
  };

  const driverPlanCost = React.useMemo(() => {
    if (driverPlan === '1') return 0;
    if (driverPlan === '2') return 10;
    if (driverPlan === 'unlimited') return 20;
    return 0;
  }, [driverPlan]);

  const addonsTotal = React.useMemo(() => {
    if (!quotation) return 0;
    const coverTotal = quotation.additionalCover
      .filter((c) => selectedAddons.has(c.coverCode))
      .reduce((sum, c) => sum + c.displayPremium, 0);
    return coverTotal + driverPlanCost;
  }, [quotation, selectedAddons, driverPlanCost]);

  const totalWithAddons = React.useMemo(() => {
    if (!quotation) return 0;
    // premiumDueRounded from Allianz already includes selected add-ons and driver plan costs
    // (after updateQuote). Only use addonsTotal for display breakdown, not for total calculation.
    return quotation.premium.premiumDueRounded;
  }, [quotation]);

  const runQuoteUpdate = React.useCallback(
    async (
      selected: Set<string>,
      inputs: Record<string, AddonInputState>,
      plan: typeof driverPlan,
      drivers: AdditionalDriverInfo[],
    ) => {
      if (!quotation || !vehicleDetails) return;
      setPendingAddonSync(false);

      if (isDemo) {
        setIsUpdatingQuote(true);
        try {
          await new Promise((r) => setTimeout(r, 350));
          const updated = applyDemoQuoteUpdate(
            quotation,
            selected,
            inputs,
            plan,
            rahmahApplied,
          );
          setQuotation(updated);
          sessionStorage.setItem('allianz_quotation', JSON.stringify(updated));
          try {
            await syncQuotePremiumForPayment(
              updated.contract.contractNumber,
              updated.premium.premiumDueRounded,
              { demo: true },
            );
          } catch (syncErr) {
            console.warn('[demo] Quote premium sync failed:', syncErr);
          }
        } finally {
          setIsUpdatingQuote(false);
        }
        return;
      }

      const payload = {
        transactionType: 'NWOO' as const,
        contractNumber: quotation.contract.contractNumber,
        effectiveDate: vehicleDetails.polEffectiveDate,
        expirationDate: vehicleDetails.polExpiryDate,
        ...(rahmahApplied ? { packageCode: RAHMAH_PACKAGE_CODE } : {}),
        additionalCover: buildAdditionalCoverPayload(quotation.additionalCover, selected, inputs),
        unlimitedDriverInd: plan === 'unlimited',
        driverDetails:
          plan !== '0' && plan !== 'unlimited'
            ? drivers.map((d) => ({ fullName: d.fullName, identityNumber: d.idNumber }))
            : undefined,
      };
      const gate = quoteUpdateGate.current;
      const ticket = gate.begin(JSON.stringify(payload));
      if (ticket === null) return;

      setIsUpdatingQuote(true);
      try {
        const updatedQuote = await updateQuote(payload);
        gate.settle(ticket, true);
        if (!gate.isCurrent(ticket)) return;
        setQuotation(updatedQuote);
        sessionStorage.setItem('allianz_quotation', JSON.stringify(updatedQuote));
      } catch (err) {
        gate.settle(ticket, false);
        if (!gate.isCurrent(ticket)) return;
        console.error('Update quotation error:', err);
        const apiErr = err as { message?: string };
        setError(apiErr?.message || 'Failed to update your quote. Please try again.');
      } finally {
        if (gate.isCurrent(ticket)) setIsUpdatingQuote(false);
      }
    },
    [quotation, vehicleDetails, rahmahApplied, isDemo],
  );

  React.useEffect(() => {
    if (!quotation || selectedAddons.size === 0) return;
    if (addonSyncTimer.current) clearTimeout(addonSyncTimer.current);
    setPendingAddonSync(true);
    addonSyncTimer.current = setTimeout(() => {
      runQuoteUpdate(selectedAddons, addonInputs, driverPlan, additionalDrivers);
    }, 400);
    return () => {
      if (addonSyncTimer.current) clearTimeout(addonSyncTimer.current);
    };
  }, [addonInputs, driverPlan, additionalDrivers]); // eslint-disable-line react-hooks/exhaustive-deps -- selectedAddons synced via toggle

  const handleToggleAddon = async (cover: AdditionalCoverItem) => {
    if (!quotation || !vehicleDetails || isUpdatingQuote) return;

    const newSelected = new Set(selectedAddons);
    const adding = !newSelected.has(cover.coverCode);
    if (adding) {
      newSelected.add(cover.coverCode);
      setAddonInputs((prev) => ({
        ...prev,
        [cover.coverCode]: {
          ...defaultAddonInputsForCover(cover),
          ...prev[cover.coverCode],
        },
      }));
    } else {
      newSelected.delete(cover.coverCode);
    }
    setSelectedAddons(newSelected);

    if (cover.coverCode === 'A202') {
      setEhailingDriver(
        newSelected.has('A202')
          ? ehailingDriverFromPolicyholder(formData)
          : { fullName: '', idNumber: '' },
      );
      setEhailingErrors({});
    }

    const nextInputs = adding
      ? {
          ...addonInputs,
          [cover.coverCode]: {
            ...defaultAddonInputsForCover(cover),
            ...addonInputs[cover.coverCode],
          },
        }
      : addonInputs;

    await runQuoteUpdate(newSelected, nextInputs, driverPlan, additionalDrivers);
  };

  const handleAddonInputChange = (coverCode: string, field: string, value: string) => {
    setAddonInputs((prev) => {
      const next = { ...prev[coverCode] };
      (next as Record<string, string>)[field] = value;
      return { ...prev, [coverCode]: next };
    });
  };

  const handleSumInsuredCommit = async (coverCode: string, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '');
    const raw = digits ? parseInt(digits, 10) : 0;
    const committed =
      coverCode === '89'
        ? clampWindscreenSumInsured(Number.isFinite(raw) ? raw : 0)
        : coverCode === '97A'
          ? clampGasKitSumInsured(Number.isFinite(raw) ? raw : 0)
          : raw;
    const nextInputs = {
      ...addonInputs,
      [coverCode]: { ...addonInputs[coverCode], sumInsured: committed },
    };
    setAddonInputs(nextInputs);
    if (quotation && selectedAddons.has(coverCode)) {
      await runQuoteUpdate(selectedAddons, nextInputs, driverPlan, additionalDrivers);
    }
  };

  const handleDriverPlanChange = async (plan: '0' | '1' | '2' | 'unlimited') => {
    setDriverPlan(plan);
    let drivers: AdditionalDriverInfo[] = [];
    if (plan === '1') {
      drivers = [{ fullName: '', nationality: 'MALAYSIA', idType: 'NRIC', idNumber: '' }];
    } else if (plan === '2') {
      drivers = [
        { fullName: '', nationality: 'MALAYSIA', idType: 'NRIC', idNumber: '' },
        { fullName: '', nationality: 'MALAYSIA', idType: 'NRIC', idNumber: '' },
      ];
    }
    setAdditionalDrivers(drivers);
    if (quotation) {
      await runQuoteUpdate(selectedAddons, addonInputs, plan, drivers);
    }
  };

  const updateDriverInfo = (
    index: number,
    field: keyof AdditionalDriverFormValues,
    value: string,
  ) => {
    setAdditionalDrivers((prev) =>
      prev.map((d, i) => {
        if (i !== index) return d;
        if (field === 'idType') {
          const idNumber = reformatDriverIdForTypeChange(value, d.idNumber);
          return { ...d, idType: value, idNumber };
        }
        return { ...d, [field]: value };
      }),
    );
    if (field === 'idType') {
      const driver = additionalDrivers[index];
      if (driver) {
        const idNumber = reformatDriverIdForTypeChange(value, driver.idNumber);
        const errors = validateNamedDriverFields({
          ...driver,
          idType: value,
          idNumber,
        });
        setAdditionalDriverErrors((prev) => ({ ...prev, [index]: errors }));
      }
      return;
    }
    setAdditionalDriverErrors((prev) => {
      const row = prev[index];
      if (!row) return prev;
      const key = field === 'fullName' ? 'fullName' : field === 'idNumber' ? 'idNumber' : null;
      if (!key || !row[key]) return prev;
      return { ...prev, [index]: { ...row, [key]: undefined } };
    });
  };

  const validateAdditionalDriverRow = (index: number) => {
    const driver = additionalDrivers[index];
    if (!driver) return {};
    const errors = validateNamedDriverFields(driver);
    setAdditionalDriverErrors((prev) => ({ ...prev, [index]: errors }));
    return errors;
  };

  const validateAllAdditionalDrivers = () => {
    const next: Record<number, { fullName?: string; idNumber?: string }> = {};
    let hasError = false;
    additionalDrivers.forEach((driver, index) => {
      const errors = validateNamedDriverFields(driver);
      if (Object.keys(errors).length > 0) {
        next[index] = errors;
        hasError = true;
      }
    });
    setAdditionalDriverErrors(next);
    return !hasError;
  };

  const handleEhailingChange = (driver: { fullName: string; idNumber: string }) => {
    setEhailingDriver(driver);
    if (selectedAddons.has('A202')) {
      setEhailingErrors({});
      setError(null);
    }
  };

  const handleProceedToPayment = () => {
    if (!quotation) return;

    const validation = validateQuotationStepBeforeProceed({
      selectedAddons,
      ehailingDriver,
      driverPlan,
      additionalDrivers,
      isUpdatingQuote,
      pendingAddonSync,
    });

    if (!validation.ok) {
      setError(validation.message);
      if (validation.ehailingErrors) {
        setEhailingErrors(validation.ehailingErrors);
      }
      if (validation.focusTarget === 'additionalDrivers') {
        validateAllAdditionalDrivers();
      }
      if (validation.focusTarget === 'ehailing') {
        requestAnimationFrame(() => {
          document.getElementById('ehailing-driver-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        });
      } else if (validation.focusTarget === 'additionalDrivers') {
        requestAnimationFrame(() => {
          document.getElementById('additional-drivers-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        });
      }
      return;
    }

    setError(null);
    setEhailingErrors({});
    setAdditionalDriverErrors({});
    if (isDemo) {
      sessionStorage.setItem('allianz_isDemo', 'true');
    } else {
      sessionStorage.removeItem('allianz_isDemo');
    }
    sessionStorage.setItem('allianz_quotation', JSON.stringify(quotation));
    sessionStorage.setItem('allianz_selectedAddons', JSON.stringify([...selectedAddons]));
    sessionStorage.setItem('allianz_driverPlan', driverPlan);
    sessionStorage.setItem('allianz_additionalDrivers', JSON.stringify(additionalDrivers));
    sessionStorage.setItem('allianz_ehailingDriver', JSON.stringify(ehailingDriver));
    sessionStorage.setItem('allianz_addonInputs', JSON.stringify(addonInputs));
    sessionStorage.setItem('allianz_driverPlanCost', driverPlanCost.toString());
    router.push('/customer-details');
  };

  const selectedCoverBreakdown = React.useMemo(() => {
    if (!quotation) return [];
    return quotation.additionalCover.filter(
      (c) => selectedAddons.has(c.coverCode) && isCoverVisibleForDcAuto(c),
    );
  }, [quotation, selectedAddons]);

  const premiumBusy = isUpdatingQuote || pendingAddonSync;

  const handleBackToVehicleDetails = () => {
    restoreInsuranceFormDraftFromSubmitted();
    if (isDemo) {
      sessionStorage.setItem(ALLIANZ_IS_DEMO_KEY, 'true');
    }
    router.push(vehicleDetailsPagePath({ demo: isDemo }));
  };

  if (!formData && !isDemo) return null;

  const visibleCovers = quotation?.additionalCover?.filter((c) => isCoverVisibleForDcAuto(c)) || [];

  const currentSumInsured = siBasis === 'AV' && selectedAvVariant
    ? parseFloat(selectedAvVariant.SumInsured)
    : selectedNvic?.vehicleMarketValue || 0;

  return (
    <PageLayout>
      <Container className="py-8 sm:py-10">
        <StepIndicator steps={STEPS} currentStep={1} />

        {isDemo && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
          >
            <strong className="font-semibold">Demo mode (UAT).</strong> Sample vehicle and premiums — not from Allianz.
            Use this to walk through quotation, add-ons, customer details, and payment UI when live test data is unavailable.
          </div>
        )}

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <AllianzLogo />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {quotation ? 'Your insurance quote' : 'Confirm your vehicle'}
            </h1>
            <p className="text-[15px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {quotation ? 'Review your premium breakdown and customize coverage below.' : vehicleDetails ? 'We found your vehicle. Confirm the variant that matches yours.' : 'Loading vehicle details...'}
            </p>
          </div>

          {/* Vehicle Info */}
          {vehicleDetails && (
            <Card className="max-w-lg mx-auto border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-semibold">
                  <Car className="w-4 h-4 mr-2 text-primary" />
                  {vehicleDetails.vehicleMake} {vehicleDetails.vehicleModelDesc || vehicleDetails.vehicleModel}
                  <span className="ml-auto text-xs font-normal text-muted-foreground">{vehicleDetails.yearOfManufacture}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><span className="text-muted-foreground text-xs">Plate Number</span><p className="font-semibold">{vehicleDetails.vehicleLicenseId}</p></div>
                  <div><span className="text-muted-foreground text-xs">Engine</span><p className="font-semibold">{vehicleDetails.vehicleEngineCC} CC</p></div>
                  <div><span className="text-muted-foreground text-xs">No Claim Discount</span><p className="font-semibold text-green-600">{vehicleDetails.ncdPercentage}%</p></div>
                  <div><span className="text-muted-foreground text-xs">Coverage Type</span><p className="font-semibold">{vehicleDetails.coverType || 'Comprehensive'}</p></div>
                  <div className="col-span-2 pt-2 mt-1 border-t border-border/40"><span className="text-muted-foreground text-xs">Coverage Period</span><p className="font-medium text-sm">{formatCoveragePeriod(vehicleDetails.polEffectiveDate, vehicleDetails.polExpiryDate)}</p></div>
                  <div className="col-span-2"><span className="text-muted-foreground text-xs">Current Insurer</span><p className="font-medium text-sm">{vehicleDetails.currInsurer}</p></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PDS & Product Documents — Prominent */}
          {vehicleDetails && (
            <div className="max-w-lg mx-auto">
              <Card className="border-blue-200 bg-blue-50/30 shadow-none">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Product Disclosure Sheet</p>
                      <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                        Read the PDS before purchasing. It explains what is covered, fees, and important exclusions.
                      </p>
                      <div className="flex gap-4 mt-2">
                        <a href={ALLIANZ_DOCUMENTS.pds} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
                          View PDS <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a href={ALLIANZ_DOCUMENTS.policyWording} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
                          Policy Wording <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reconditioned, SI basis & AV selection (pre-quote) */}
          {vehicleDetails && !quotation && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-xs font-medium text-amber-900">Is your vehicle reconditioned? *</p>
                  <button type="button" onClick={() => setShowRecondTooltip(!showRecondTooltip)} className="text-amber-700 hover:text-amber-900"><HelpCircle className="w-3.5 h-3.5" /></button>
                </div>
                {showRecondTooltip && (
                  <div className="mb-3 bg-white border border-amber-200 rounded-lg p-3 text-xs space-y-2">
                    <p className="font-semibold text-amber-900">What is considered a reconditioned car?</p>
                    <table className="w-full text-left">
                      <thead><tr className="border-b border-amber-200"><th className="pb-1 text-amber-800">Point of Purchase</th><th className="pb-1 text-amber-800">Status</th></tr></thead>
                      <tbody className="text-amber-700">
                        <tr><td className="py-1">New Import (Import Baru)</td><td>Not Reconditioned</td></tr>
                        <tr><td className="py-1">Used Import (Import Terpakai)</td><td className="font-medium text-amber-900">Reconditioned</td></tr>
                        <tr><td className="py-1">Locally Assembled (Pemasangan Tempatan)</td><td>Not Reconditioned</td></tr>
                      </tbody>
                    </table>
                    <p className="text-amber-600">Check your Vehicle Registration Card or Vehicle Ownership Certificate under &quot;Status Asal&quot; to determine if your vehicle is reconditioned.</p>
                  </div>
                )}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="reconditioned" checked={isReconditioned === false} onChange={() => { setIsReconditioned(false); setRecondError(null); }} className="text-primary" /><span>No</span></label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="reconditioned" checked={isReconditioned === true} onChange={() => { setIsReconditioned(true); setRecondError(null); }} className="text-primary" /><span>Yes</span></label>
                </div>
                {recondError && <p className="text-xs text-destructive mt-2">{recondError}</p>}
              </div>

              {avAvailable && !isLoadingAv && (
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="font-semibold text-sm">Sum insured basis</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose how your vehicle is valued for coverage.</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setSiBasis('MV'); setQuotation(null); setSelectedAvVariantName(null); setSelectedAvVariant(null); }} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${siBasis === 'MV' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>Market Value</button>
                    <button onClick={() => { setSiBasis('AV'); setQuotation(null); setSelectedAvVariantName(null); setSelectedAvVariant(null); }} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${siBasis === 'AV' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>Agreed Value</button>
                  </div>
                </div>
              )}

              {siBasis === 'AV' && avVariants.length > 0 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-center space-y-1">
                      <h3 className="font-semibold text-base">Which variant do you own?</h3>
                      <p className="text-xs text-muted-foreground">Select the variant that matches your vehicle grant, then choose a Low, Med, or High agreed value.</p>
                    </div>
                    <div className="space-y-2">
                      {avVariantNames.map((name) => {
                        const isOpen = selectedAvVariantName === name;
                        const range = getAvSumInsuredRange(avVariants, name);
                        return (
                          <div
                            key={name}
                            className={`rounded-xl border-2 transition-all duration-300 ${isOpen ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-border/40 hover:border-primary/30 hover:shadow-sm'}`}
                          >
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              onClick={() => {
                                setSelectedAvVariantName(isOpen ? null : name);
                                setSelectedAvVariant(null);
                              }}
                              className="w-full text-left p-3.5 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-sm">{name}</p>
                                {range && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {range.min === range.max
                                      ? `RM ${range.min.toLocaleString('en-MY')}`
                                      : `RM ${range.min.toLocaleString('en-MY')} – RM ${range.max.toLocaleString('en-MY')}`}
                                  </p>
                                )}
                              </div>
                              <ChevronDown className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isOpen && avTiersForSelectedVariant.length > 0 && (
                              <div className="px-3.5 pb-3.5 space-y-2">
                                {avTiersForSelectedVariant.map(({ label, variant: av }) => {
                                  const isSelected = selectedAvVariant?.AvCode === av.AvCode;
                                  return (
                                    <button
                                      key={av.AvCode}
                                      type="button"
                                      onClick={() => setSelectedAvVariant(av)}
                                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 bg-background transition-all duration-200 ${isSelected ? 'border-primary' : 'border-border/40 hover:border-primary/30'}`}
                                    >
                                      <span className="flex items-center gap-2 text-sm font-medium">
                                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-muted-foreground/40'}`}>
                                          {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                                        </span>
                                        {label}
                                      </span>
                                      <span className="text-right">
                                        <span className="block font-bold text-sm">RM {parseFloat(av.SumInsured).toLocaleString('en-MY')}</span>
                                        <span className="block text-[10px] text-muted-foreground uppercase">Sum Insured</span>
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <Button onClick={handleGenerateQuote} disabled={!canGenerateQuote || isLoadingQuote} className="h-12 px-8 text-base font-semibold">
                      {isLoadingQuote ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Calculating...</span></div> : 'Get my quote'}
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
                <p className="text-xs text-muted-foreground">Market value determines your sum insured — the maximum payout for total loss.</p>
              </div>
              <div className="space-y-2">
                {vehicleDetails.nvicList?.slice().sort((a, b) => b.vehicleMarketValue - a.vehicleMarketValue).map((nvic) => {
                  const isSelected = selectedNvic?.nvic === nvic.nvic;
                  const trimName = nvic.vehicleVariant.split(' ')[0];
                  return (
                    <button key={nvic.nvic} onClick={() => handleNvicSelect(nvic)} className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${isSelected ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-border/40 hover:border-primary/30 hover:shadow-sm'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{isSelected ? <Check className="w-4 h-4" /> : trimName.substring(0, 2)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2"><p className="font-semibold text-sm">{trimName} Variant</p>{nvic.recommendInd === 'Y' && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded uppercase tracking-wide">Best Match</span>}</div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{nvic.vehicleVariant}</p>
                        </div>
                        <div className="text-right flex-shrink-0"><p className="font-bold text-sm text-foreground">RM {nvic.vehicleMarketValue.toLocaleString('en-MY', { minimumFractionDigits: 0 })}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Market Value</p></div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-start gap-2 px-3 py-2.5 bg-muted/50 rounded-lg"><Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" /><p className="text-xs text-muted-foreground leading-relaxed">Not sure which variant? Check your vehicle registration card (grant) or previous insurance policy.</p></div>
              <div className="text-center pt-2">
                <Button onClick={handleGenerateQuote} disabled={!canGenerateQuote || isLoadingQuote} className="h-12 px-8 text-base font-semibold">
                  {isLoadingQuote ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Calculating...</span></div> : 'Get my quote'}
                </Button>
              </div>
            </div>
          )}

          {/* ═══ Quotation Display ═══ */}
          {quotation && (
            <div className="max-w-3xl mx-auto space-y-6">

              {/* Total Premium */}
              <div className="text-center py-10 bg-gradient-to-b from-muted/20 to-muted/40 rounded-2xl border border-border/30 shadow-sm">
                <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.2em] mb-2">Annual Premium</p>
                <p className="font-serif text-4xl sm:text-5xl font-bold text-foreground tracking-tight transition-all">RM {totalWithAddons.toFixed(2)}</p>
                {addonsTotal > 0 && <p className="text-xs text-muted-foreground mt-2">Includes RM {addonsTotal.toFixed(2)} in add-on coverage</p>}
                <p className="text-xs text-muted-foreground mt-2.5">Comprehensive &middot; Sum insured RM {currentSumInsured.toLocaleString('en-MY')}</p>
              </div>

              {/* Premium Breakdown */}
              <Card className={`border-border/40 shadow-sm ${premiumBusy ? 'opacity-80' : ''}`}>
                <CardHeader><CardTitle className="flex items-center text-sm font-semibold"><Shield className="w-4 h-4 mr-2 text-primary" />Premium breakdown{premiumBusy ? ' (updating…)' : ''}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Basic Premium</span><span>RM {quotation.premium.basicPremium.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-green-600"><span>NCD Discount ({quotation.premium.ncdPct}%)</span><span>- RM {quotation.premium.ncdAmt.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Annual Premium</span><span>RM {quotation.premium.annualPremium.toFixed(2)}</span></div>
                  {selectedCoverBreakdown.map((cover) => (
                    <div key={cover.coverCode} className="flex justify-between text-sm pl-2">
                      <span className="text-muted-foreground truncate pr-2">{cover.coverName}</span>
                      <span className="flex-shrink-0">+ RM {cover.displayPremium.toFixed(2)}</span>
                    </div>
                  ))}
                  {driverPlanCost > 0 && (
                    <div className="flex justify-between text-sm pl-2">
                      <span className="text-muted-foreground">Additional driver plan</span>
                      <span>+ RM {driverPlanCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Service Tax ({quotation.premium.serviceTaxPercentage}%)</span><span>RM {quotation.premium.serviceTaxAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Stamp Duty</span><span>RM {quotation.premium.stampDuty.toFixed(2)}</span></div>
                  {(quotation.premium.packagePremium ?? 0) !== 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Package adjustment</span>
                      <span>RM {(quotation.premium.packagePremium ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border/40 flex justify-between items-center"><span className="font-bold text-sm">Total</span><span className="font-bold text-lg text-primary">RM {totalWithAddons.toFixed(2)}</span></div>
                  <p className="text-[11px] text-muted-foreground italic mt-2">* Excess of RM {quotation.premium.excessAmount.toFixed(0)} is applicable</p>
                  {quotation.premium.commissionPercentage > 0 && (
                    <div className="pt-3 mt-3 border-t border-dashed border-border/40 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Commission disclosure</p>
                      <div className="flex justify-between text-xs"><span className="text-muted-foreground">Commission rate</span><span>{quotation.premium.commissionPercentage}%</span></div>
                      <div className="flex justify-between text-xs"><span className="text-muted-foreground">Commission amount</span><span>RM {quotation.premium.commissionAmount.toFixed(2)}</span></div>
                      <p className="text-[11px] text-muted-foreground italic">
                        * {quotation.premium.commissionPercentage}% commission (RM {quotation.premium.commissionAmount.toFixed(2)}) is payable to {AGENT_DISPLAY_NAME}.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ═══ Road Rangers (always shown, always selected) ═══ */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Included coverage</h3>
                <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded bg-green-500 flex items-center justify-center mt-0.5"><Check className="w-3 h-3 text-white" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5"><span className="font-medium text-sm">Road Rangers</span><RoadRangersTooltipButton /></div>
                      <p className="text-xs text-muted-foreground mt-0.5">Nationwide motor accident assistance — included free with your policy.</p>
                    </div>
                    <span className="font-semibold text-sm text-green-600">FREE</span>
                  </div>
                </div>
                {rahmahApplied && (
                  <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50/50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded bg-green-500 flex items-center justify-center mt-0.5"><Check className="w-3 h-3 text-white" /></div>
                      <div className="flex-1">
                        <span className="font-medium text-sm">Rahmah package</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Coverage provided at no extra cost for eligible vehicles (sum insured ≤ RM 30,000 and engine ≤ 1,500 CC).</p>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside">
                          {RAHMAH_INCLUSIONS.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                      <span className="font-semibold text-sm text-green-600">FREE</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ═══ Additional Drivers (custom add-on) ═══ */}
              <div id="additional-drivers-section" className="space-y-3">
                <h3 className="font-semibold text-sm">Additional driver coverage</h3>
                <div className="space-y-2">
                  {([
                    { value: '0' as const, label: 'No additional drivers', price: 'Default' },
                    { value: '1' as const, label: '1 Additional Driver', price: 'FREE' },
                    { value: '2' as const, label: '2 Additional Drivers', price: 'RM 10.00' },
                    { value: 'unlimited' as const, label: 'Unlimited Named Drivers', price: 'RM 20.00' },
                  ]).map((opt) => (
                    <button key={opt.value} onClick={() => handleDriverPlanChange(opt.value)} className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-300 ${driverPlan === opt.value ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-border/40 hover:border-primary/30 hover:shadow-sm'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${driverPlan === opt.value ? 'border-primary' : 'border-muted-foreground/30'}`}>{driverPlan === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}</div>
                          <span className="text-sm font-medium">{opt.label}</span>
                        </div>
                        <span className={`text-sm font-semibold ${opt.price === 'FREE' ? 'text-green-600' : ''}`}>{opt.price}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Driver detail forms */}
                {(driverPlan === '1' || driverPlan === '2') && additionalDrivers.map((driver, idx) => (
                  <Card key={idx} className="border-border/40 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground">Additional Driver {idx + 1}</CardTitle></CardHeader>
                    <CardContent>
                      <AdditionalDriverFormFields
                        driver={driver}
                        fieldErrors={additionalDriverErrors[idx]}
                        onFieldChange={(field, value) => updateDriverInfo(idx, field, value)}
                        onFieldBlur={() => validateAdditionalDriverRow(idx)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {visibleCovers.length > 0 && (
                <AdditionalCoveragesSection
                  covers={visibleCovers}
                  selectedAddons={selectedAddons}
                  isUpdating={isUpdatingQuote}
                  pendingAddonSync={pendingAddonSync}
                  onToggleAddon={handleToggleAddon}
                  addonInputs={addonInputs}
                  onInputChange={handleAddonInputChange}
                  onSumInsuredCommit={handleSumInsuredCommit}
                  ehailingDriver={ehailingDriver}
                  onEhailingChange={handleEhailingChange}
                  ehailingErrors={ehailingErrors}
                />
              )}

              {/* Error */}
              {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center"><p className="text-red-700 text-sm">{error}</p></div>}

              {/* Actions */}
              <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/30 -mx-5 px-5 py-4 sm:relative sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:mx-0 sm:px-0 sm:py-0 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:shadow-none">
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-lg mx-auto">
                  <Button variant="outline" onClick={handleBackToVehicleDetails} className="w-full sm:w-auto h-11"><ArrowLeft className="w-4 h-4 mr-2" />Back to vehicle details</Button>
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!quotation || isUpdatingQuote || pendingAddonSync}
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
              <p className="text-sm text-muted-foreground">No vehicle details available. The backend may not be running.</p>
              <Button variant="outline" onClick={handleBackToVehicleDetails}><ArrowLeft className="w-4 h-4 mr-2" />Back to vehicle details</Button>
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
