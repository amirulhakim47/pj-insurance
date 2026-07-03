'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout, Container, StepIndicator } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Check, Shield, Car, Info, FileText, ExternalLink, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
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

const STEPS = ['Vehicle Details', 'Quotation', 'Customer Info', 'Review & Pay'];

const ADDON_TOOLTIPS: Record<string, { text: string; link?: string }> = {
  'ROAD_RANGERS': {
    text: 'Allianz Road Rangers is a nationwide motor accident assistance provided free-of-charge to all our Motor Comprehensive (Private Car) policyholders.',
    link: 'https://www.allianz.com.my/road-rangers',
  },
  'PAB-ERW': {
    text: 'Enhanced Road Warrior (ERW) is a 24-Hour Car Assistance Program with the following benefits: 24-Hour Unlimited Emergency Tow Truck Service, Car Replacement, Minor Roadside Repair, Flood Coverage, Medical Expenses Benefit.',
    link: 'https://www.allianz.com.my/enhanced-road-warrior',
  },
  '89': { text: 'Cover for Windscreens, Windows and Sunroof covers the cost to repair or replace any glass in the windscreen, window or sunroof (including the cost of lamination/tinting film, if any) of your car that is accidentally damaged. A claim under this benefit does not affect your No Claim Discount (NCD) entitlement, provided no other claim for other damage is submitted for the same incident.' },
  'A202': { text: 'Private Hire Car (e-Hailing) add on covers you for: 1. Loss or damage of your own car, 2. Liability to third parties, 3. Legal liability to fare paying passengers, 4. Personal accident benefit due to accidental injury or death of the authorized e-Hailing driver, 5. Legal liability of fare paying passengers for negligent acts.' },
  '72': { text: 'Legal Liability of Passengers for Negligent Acts protects you against legal liability sought by third party against you for the action of your passenger(s) in your car provided that the passenger is not driving your car and other conditions set are satisfied.' },
  'A209': { text: 'Car Break-in/Robbery reimburses you the actual expenses incurred up to RM500, to repair or replace your personal effects that were in your car if they are lost or damaged due to a break-in or robbery.' },
  '57': { text: 'Inclusion of Special Perils covers loss or damage to your car caused by flood, typhoon, hurricane, storm, tempest, volcanic eruption, earthquake, landslide, landslip, subsidence or sinking of the soil/earth or other convulsions of nature.' },
  'PAB3': { text: 'Driver and Passengers\' Personal Accident covers you and your passengers while travelling in your car. Benefits include Death/Permanent Disablement Benefit.' },
  'A206': { text: 'Key Care reimburses you the actual expenses up to RM1,000, to replace one set of car key if your car key is lost, stolen or damaged due to theft or attempted theft or house break-in.' },
  '100A': { text: 'Legal Liability to Passengers covers you against legal liability sought by your passenger(s) (except your own family members) against you in the event of an accident due to your negligence.' },
  '112': { text: 'Compensation for Assessed Repair Time (CART) compensates you, up to 21 days, for the number of days required (assessed by us) to repair your damaged car.' },
  '25': { text: 'Strike, Riot and Civil Commotion covers for loss or damage to your car caused by various kinds of strikes, riots and civil commotions.' },
  '111': { text: 'Current Year "NCD" Relief compensates you an amount equal to the current year NCD amount in the event of a claim being made under the policy that may forfeit your NCD. This is a one-off compensation.' },
  '97A': { text: 'Gas Conversion Kit and Tank covers for loss or damage to the Gas Conversion Kit and Tank of your car as a separate item provided it is installed by a qualified installer.' },
};

const UPFRONT_COVER_CODES = new Set(['PAB-ERW', '89', 'A202', '72']);
const UPFRONT_MAX_SEQUENCE = 6;

interface AdditionalDriverInfo {
  fullName: string;
  nationality: string;
  idType: string;
  idNumber: string;
}

const NATIONALITY_OPTIONS = [
  'MALAYSIA', 'SINGAPORE', 'INDONESIA', 'THAILAND', 'PHILIPPINES',
  'INDIA', 'CHINA', 'BANGLADESH', 'PAKISTAN', 'MYANMAR', 'OTHERS',
];

const DEMO_FORM_DATA: InsuranceFormData = {
  fullName: 'DEMO USER', vehicleType: 'car', plateNumber: 'VAP2104', nric: '841103-01-1116',
  postcode: '50000', customerType: 'individual', identityType: 'NRIC', email: 'demo@example.com',
  phoneNumber: '0121234567', isEhailing: false, isElectricVehicle: false, pdpaConsent: true,
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

function TooltipButton({ coverCode }: { coverCode: string }) {
  const [open, setOpen] = React.useState(false);
  const tooltip = ADDON_TOOLTIPS[coverCode];
  if (!tooltip) return null;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-muted-foreground hover:text-primary transition-colors"
        aria-label="More info"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-popover border border-border rounded-xl shadow-lg p-3 text-xs text-popover-foreground leading-relaxed">
            {tooltip.text}
            {tooltip.link && (
              <a href={tooltip.link} target="_blank" rel="noopener noreferrer" className="block mt-1.5 text-primary hover:underline font-medium">
                Click here to find out more <ExternalLink className="w-2.5 h-2.5 inline" />
              </a>
            )}
          </div>
        </>
      )}
    </span>
  );
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

  const [addonInputs, setAddonInputs] = React.useState<Record<string, { sumInsured?: number; cartDay?: string; cartAmount?: string; planCode?: string }>>({});

  const [siBasis, setSiBasis] = React.useState<'MV' | 'AV'>('MV');
  const [avVariants, setAvVariants] = React.useState<AVVariantItem[]>([]);
  const [selectedAvVariant, setSelectedAvVariant] = React.useState<AVVariantItem | null>(null);
  const [isLoadingAv, setIsLoadingAv] = React.useState(false);
  const [isReconditioned, setIsReconditioned] = React.useState<boolean | null>(null);
  const [avAvailable, setAvAvailable] = React.useState(true);
  const [showRecondTooltip, setShowRecondTooltip] = React.useState(false);

  const [showMoreCoverages, setShowMoreCoverages] = React.useState(false);

  const [driverPlan, setDriverPlan] = React.useState<'0' | '1' | '2' | 'unlimited'>('0');
  const [additionalDrivers, setAdditionalDrivers] = React.useState<AdditionalDriverInfo[]>([]);
  const [ehailingDriver, setEhailingDriver] = React.useState<{ fullName: string; idNumber: string }>({ fullName: '', idNumber: '' });

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
    if (!vehicleDetails || isDemo) return;
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
            ReferenceNo: vehicleDetails.contractNumber, ProductCat: 'MPC', SourceSystem: 'PTR',
            ClaimsExp: noOfClaims, ReconInd: reconInd, ExcessWaiveInd: false, CheckUbbInd: 2,
            Policy: {
              PolicyEffectiveDate: vehicleDetails.polEffectiveDate,
              PolicyExpiryDate: vehicleDetails.polExpiryDate,
              Client: { IdentificationNumber: formData.nric.replace(/-/g, ''), IdType: formData.identityType || 'NRIC', Age: '30' },
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

        const birthDate = extractBirthDateFromNRIC(formData.nric);
        const gender = formData.customerType === 'company' ? 'C' as Gender : extractGenderFromNRIC(formData.nric);
        const maritalStatus: MaritalStatus = formData.customerType === 'company' ? '3' : '0';
        const sumInsured = useAv ? selectedAvVariant!.SumInsured : selectedNvic!.vehicleMarketValue.toFixed(2);

        result = await generateQuote({
          transactionType: 'NWOO', contractNumber: vehicleDetails.contractNumber,
          effectiveDate: vehicleDetails.polEffectiveDate, expirationDate: vehicleDetails.polExpiryDate,
          person: { identityType: (formData.identityType as IdentityType) || 'NRIC', identityNumber: formData.nric.replace(/-/g, ''), gender, birthDate, maritalStatus, postalCode: formData.postcode, noOfClaims: '0' },
          vehicle: {
            vehicleLicenseId: vehicleDetails.vehicleLicenseId, vehicleMake: vehicleDetails.makeCode,
            vehicleModel: vehicleDetails.modelCode,
            vehicleEngineCC: parseInt(vehicleDetails.vehicleEngineCC, 10) || parseInt(selectedNvic?.vehicleEngineCC || selectedAvVariant?.VehicleEngineCC?.toString() || '0', 10),
            yearOfManufacture: vehicleDetails.yearOfManufacture, occupantsNumber: vehicleDetails.seatingCapacity,
            ncdPercentage: vehicleDetails.ncdPercentage, sumInsured,
            avCode: useAv ? selectedAvVariant!.AvCode : '', mvInd: useAv ? 'N' : 'Y',
          },
        });
      }

      setQuotation(result);
      sessionStorage.setItem('allianz_quotation', JSON.stringify(result));

      const preSelected = new Set<string>();
      result.additionalCover?.forEach((cover) => {
        if (cover.selectedIndicator) preSelected.add(cover.coverCode);
      });
      setSelectedAddons(preSelected);
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
    return quotation.premium.premiumDueRounded + addonsTotal;
  }, [quotation, addonsTotal]);

  const handleToggleAddon = async (cover: AdditionalCoverItem) => {
    if (!quotation || !vehicleDetails || isUpdatingQuote) return;

    const newSelected = new Set(selectedAddons);
    if (newSelected.has(cover.coverCode)) newSelected.delete(cover.coverCode);
    else newSelected.add(cover.coverCode);
    setSelectedAddons(newSelected);

    if (cover.coverCode === 'A202' && !newSelected.has('A202')) {
      setEhailingDriver({ fullName: '', idNumber: '' });
    }

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
            ...(inputs?.planCode && { planCode: inputs.planCode }),
          };
        });

      const updatedQuote = await updateQuote({
        transactionType: 'NWOO', contractNumber: quotation.contract.contractNumber,
        effectiveDate: vehicleDetails.polEffectiveDate, expirationDate: vehicleDetails.polExpiryDate,
        additionalCover,
        unlimitedDriverInd: driverPlan === 'unlimited',
        driverDetails: driverPlan !== '0' && driverPlan !== 'unlimited' ? additionalDrivers.map((d) => ({ fullName: d.fullName, identityNumber: d.idNumber })) : undefined,
      });

      setQuotation(updatedQuote);
      sessionStorage.setItem('allianz_quotation', JSON.stringify(updatedQuote));
    } catch (err) { console.error('Update quotation error:', err); }
    finally { setIsUpdatingQuote(false); }
  };

  const handleAddonInputChange = (coverCode: string, field: string, value: string) => {
    setAddonInputs((prev) => ({
      ...prev,
      [coverCode]: { ...prev[coverCode], [field]: field === 'sumInsured' ? parseInt(value, 10) || 0 : value },
    }));
  };

  const handleDriverPlanChange = (plan: '0' | '1' | '2' | 'unlimited') => {
    setDriverPlan(plan);
    if (plan === '1') setAdditionalDrivers([{ fullName: '', nationality: 'MALAYSIA', idType: 'NRIC', idNumber: '' }]);
    else if (plan === '2') setAdditionalDrivers([
      { fullName: '', nationality: 'MALAYSIA', idType: 'NRIC', idNumber: '' },
      { fullName: '', nationality: 'MALAYSIA', idType: 'NRIC', idNumber: '' },
    ]);
    else setAdditionalDrivers([]);
  };

  const updateDriverInfo = (index: number, field: keyof AdditionalDriverInfo, value: string) => {
    setAdditionalDrivers((prev) => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  const handleProceedToPayment = () => {
    if (!quotation) return;
    sessionStorage.setItem('allianz_quotation', JSON.stringify(quotation));
    sessionStorage.setItem('allianz_selectedAddons', JSON.stringify([...selectedAddons]));
    sessionStorage.setItem('allianz_driverPlan', driverPlan);
    sessionStorage.setItem('allianz_additionalDrivers', JSON.stringify(additionalDrivers));
    sessionStorage.setItem('allianz_ehailingDriver', JSON.stringify(ehailingDriver));
    sessionStorage.setItem('allianz_addonInputs', JSON.stringify(addonInputs));
    sessionStorage.setItem('allianz_driverPlanCost', driverPlanCost.toString());
    router.push('/customer-details');
  };

  if (!formData && !isDemo) return null;

  const isUpfront = (cover: AdditionalCoverItem) =>
    cover.sequence <= UPFRONT_MAX_SEQUENCE || UPFRONT_COVER_CODES.has(cover.coverCode);

  const visibleCovers = quotation?.additionalCover?.filter((c) => c.azolHiddenInd !== 1) || [];
  const upfrontCovers = visibleCovers.filter(isUpfront);
  const moreCovers = visibleCovers.filter((c) => !isUpfront(c));

  const currentSumInsured = siBasis === 'AV' && selectedAvVariant
    ? parseFloat(selectedAvVariant.SumInsured)
    : selectedNvic?.vehicleMarketValue || 0;

  return (
    <PageLayout>
      <Container className="py-8 sm:py-10">
        <StepIndicator steps={STEPS} currentStep={1} />

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
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
                  <div className="col-span-2 pt-2 mt-1 border-t border-border/40"><span className="text-muted-foreground text-xs">Coverage Period</span><p className="font-medium text-sm">{vehicleDetails.polEffectiveDate} to {vehicleDetails.polExpiryDate}</p></div>
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
                        <a href="/docs/allianz-motor-pds.pdf" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
                          View PDS (PDF) <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a href="https://www.allianz.com.my/motor-comprehensive-insurance" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
                          Policy Wording <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                    <button onClick={() => { setSiBasis('MV'); setQuotation(null); }} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${siBasis === 'MV' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>Market Value</button>
                    <button onClick={() => { setSiBasis('AV'); setQuotation(null); }} disabled={isReconditioned === true} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${siBasis === 'AV' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'} disabled:opacity-50 disabled:cursor-not-allowed`}>Agreed Value</button>
                  </div>

                  {/* Reconditioned declaration with tooltip */}
                  <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 relative">
                    <div className="flex items-center gap-1.5 mb-2">
                      <p className="text-xs font-medium text-amber-900">Is your vehicle reconditioned?</p>
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
                      <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="reconditioned" checked={isReconditioned === false} onChange={() => setIsReconditioned(false)} className="text-primary" /><span>No</span></label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="reconditioned" checked={isReconditioned === true} onChange={() => { setIsReconditioned(true); setSiBasis('MV'); }} className="text-primary" /><span>Yes</span></label>
                    </div>
                    {isReconditioned === true && <p className="text-xs text-amber-700 mt-2">Reconditioned vehicles are only eligible for Market Value basis.</p>}
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
                    {avVariants.map((av) => (
                      <button key={av.AvCode} onClick={() => setSelectedAvVariant(av)} className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-300 ${selectedAvVariant?.AvCode === av.AvCode ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-border/40 hover:border-primary/30 hover:shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                          <div><p className="font-medium text-sm">{av.Variant}</p><p className="text-xs text-muted-foreground">{av.VehicleEngineCC} CC | {av.MakeYear}</p></div>
                          <div className="text-right"><p className="font-bold text-base">RM {parseFloat(av.SumInsured).toLocaleString('en-MY')}</p><p className="text-[10px] text-muted-foreground uppercase">Sum Insured</p></div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="text-center pt-2">
                    <Button onClick={handleGenerateQuote} disabled={!selectedAvVariant || isLoadingQuote} className="h-12 px-8 text-base font-semibold">
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
                <Button onClick={handleGenerateQuote} disabled={!selectedNvic || isLoadingQuote} className="h-12 px-8 text-base font-semibold">
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
                {addonsTotal > 0 && <p className="text-xs text-muted-foreground mt-2">Base RM {quotation.premium.premiumDueRounded.toFixed(2)} + Add-ons RM {addonsTotal.toFixed(2)}</p>}
                <p className="text-xs text-muted-foreground mt-2.5">Comprehensive &middot; Sum insured RM {currentSumInsured.toLocaleString('en-MY')}</p>
              </div>

              {/* Premium Breakdown */}
              <Card className="border-border/40 shadow-sm">
                <CardHeader><CardTitle className="flex items-center text-sm font-semibold"><Shield className="w-4 h-4 mr-2 text-primary" />Premium breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Basic Premium</span><span>RM {quotation.premium.basicPremium.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-green-600"><span>NCD Discount ({quotation.premium.ncdPct}%)</span><span>- RM {quotation.premium.ncdAmt.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Annual Premium</span><span>RM {quotation.premium.annualPremium.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Service Tax ({quotation.premium.serviceTaxPercentage}%)</span><span>RM {quotation.premium.serviceTaxAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Stamp Duty</span><span>RM {quotation.premium.stampDuty.toFixed(2)}</span></div>
                  {addonsTotal > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Selected Add-ons</span><span>+ RM {addonsTotal.toFixed(2)}</span></div>}
                  <div className="pt-3 border-t border-border/40 flex justify-between items-center"><span className="font-bold text-sm">Total</span><span className="font-bold text-lg text-primary">RM {totalWithAddons.toFixed(2)}</span></div>
                  <p className="text-[11px] text-muted-foreground italic mt-2">* Excess of RM {quotation.premium.excessAmount.toFixed(0)} is applicable</p>
                </CardContent>
              </Card>

              {/* ═══ Road Rangers (always shown, always selected) ═══ */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Included coverage</h3>
                <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded bg-green-500 flex items-center justify-center mt-0.5"><Check className="w-3 h-3 text-white" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5"><span className="font-medium text-sm">Road Rangers</span><TooltipButton coverCode="ROAD_RANGERS" /></div>
                      <p className="text-xs text-muted-foreground mt-0.5">Nationwide motor accident assistance — included free with your policy.</p>
                    </div>
                    <span className="font-semibold text-sm text-green-600">FREE</span>
                  </div>
                </div>
              </div>

              {/* ═══ Additional Drivers (custom add-on) ═══ */}
              <div className="space-y-3">
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
                    <CardContent className="space-y-3">
                      <div><label className="text-xs font-medium">Name as per ID *</label><input value={driver.fullName} onChange={(e) => updateDriverInfo(idx, 'fullName', e.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm uppercase" placeholder="FULL NAME" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-medium">Nationality *</label><select value={driver.nationality} onChange={(e) => updateDriverInfo(idx, 'nationality', e.target.value)} className="mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm">{NATIONALITY_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
                        <div><label className="text-xs font-medium">ID Type *</label><select value={driver.idType} onChange={(e) => updateDriverInfo(idx, 'idType', e.target.value)} className="mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm"><option value="NRIC">NRIC</option><option value="OLD_IC">Old IC</option><option value="PASS">Passport</option></select></div>
                      </div>
                      <div><label className="text-xs font-medium">ID Number *</label><input value={driver.idNumber} onChange={(e) => updateDriverInfo(idx, 'idNumber', e.target.value)} className="mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm" placeholder="ID Number" /></div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ═══ Upfront Add-ons ═══ */}
              {upfrontCovers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-semibold text-sm">Enhance your coverage</h3><span className="text-xs text-muted-foreground">Optional add-ons</span></div>
                  {upfrontCovers.sort((a, b) => a.sequence - b.sequence).map((cover) => (
                    <AddonCoverCard key={cover.coverCode} cover={cover} isSelected={selectedAddons.has(cover.coverCode)} isUpdating={isUpdatingQuote} onToggle={() => handleToggleAddon(cover)} addonInputs={addonInputs} onInputChange={handleAddonInputChange} ehailingDriver={ehailingDriver} onEhailingChange={setEhailingDriver} />
                  ))}
                </div>
              )}

              {/* ═══ Display More Coverages ═══ */}
              {moreCovers.length > 0 && (
                <div className="space-y-3">
                  <button onClick={() => setShowMoreCoverages(!showMoreCoverages)} className="w-full flex items-center justify-center gap-2 text-sm text-primary font-medium hover:underline py-2">
                    {showMoreCoverages ? <><ChevronUp className="w-4 h-4" /> Hide additional coverages</> : <><ChevronDown className="w-4 h-4" /> Display more coverages ({moreCovers.length})</>}
                  </button>
                  {showMoreCoverages && moreCovers.sort((a, b) => a.sequence - b.sequence).map((cover) => (
                    <AddonCoverCard key={cover.coverCode} cover={cover} isSelected={selectedAddons.has(cover.coverCode)} isUpdating={isUpdatingQuote} onToggle={() => handleToggleAddon(cover)} addonInputs={addonInputs} onInputChange={handleAddonInputChange} ehailingDriver={ehailingDriver} onEhailingChange={setEhailingDriver} />
                  ))}
                </div>
              )}

              {/* Error */}
              {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center"><p className="text-red-700 text-sm">{error}</p></div>}

              {/* Actions */}
              <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/30 -mx-5 px-5 py-4 sm:relative sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:mx-0 sm:px-0 sm:py-0 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:shadow-none">
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-lg mx-auto">
                  <Button variant="outline" onClick={() => { setQuotation(null); setSelectedNvic(null); }} className="w-full sm:w-auto h-11"><ArrowLeft className="w-4 h-4 mr-2" />Change variant</Button>
                  <Button onClick={handleProceedToPayment} disabled={!quotation} className="w-full sm:w-auto h-12 text-base font-semibold"><CreditCard className="w-4 h-4 mr-2" />Proceed &middot; RM {totalWithAddons.toFixed(2)}</Button>
                </div>
              </div>
            </div>
          )}

          {/* No vehicle details fallback */}
          {!vehicleDetails && formData && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">No vehicle details available. The backend may not be running.</p>
              <Button variant="outline" onClick={() => router.push('/')}><ArrowLeft className="w-4 h-4 mr-2" />Back to form</Button>
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}

/* ═══ AddonCoverCard Component ═══ */

function AddonCoverCard({ cover, isSelected, isUpdating, onToggle, addonInputs, onInputChange, ehailingDriver, onEhailingChange }: {
  cover: AdditionalCoverItem;
  isSelected: boolean;
  isUpdating: boolean;
  onToggle: () => void;
  addonInputs: Record<string, { sumInsured?: number; cartDay?: string; cartAmount?: string; planCode?: string }>;
  onInputChange: (code: string, field: string, value: string) => void;
  ehailingDriver: { fullName: string; idNumber: string };
  onEhailingChange: (d: { fullName: string; idNumber: string }) => void;
}) {
  const inputs = addonInputs[cover.coverCode];

  return (
    <button onClick={onToggle} disabled={isUpdating} className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${isSelected ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-border/40 hover:border-primary/20 hover:shadow-sm'} ${isUpdating ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>{isSelected && <Check className="w-3 h-3 text-primary-foreground" />}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm">{cover.coverName}</span>
            <TooltipButton coverCode={cover.coverCode} />
          </div>
          {cover.coverDescription && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cover.coverDescription}</p>}

          {/* ERW plan dropdown */}
          {isSelected && cover.coverCode === 'PAB-ERW' && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <label className="text-xs text-muted-foreground">No. of Car Replacement Days</label>
              <select value={inputs?.planCode || 'PABERWA'} onChange={(e) => onInputChange(cover.coverCode, 'planCode', e.target.value)} className="mt-1 w-48 rounded-lg border border-input px-2 py-1 text-xs">
                <option value="PABERWA">Plan A — 5 days</option>
                <option value="PABERWB">Plan B — 6 days</option>
                <option value="PABERWC">Plan C — 7 days</option>
              </select>
            </div>
          )}

          {/* Windscreen SI input (cover code 89) */}
          {isSelected && cover.coverCode === '89' && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <label className="text-xs text-muted-foreground">Windscreen Sum Insured (RM)</label>
              <input type="number" min={300} max={5000} step={100} value={inputs?.sumInsured || cover.coverSumInsured || 500} onChange={(e) => onInputChange(cover.coverCode, 'sumInsured', e.target.value)} className="mt-1 w-32 rounded-lg border border-input px-2 py-1 text-xs" />
            </div>
          )}

          {/* Gas Conversion Kit SI input (cover code 97A) */}
          {isSelected && cover.coverCode === '97A' && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <label className="text-xs text-muted-foreground">Gas Kit Sum Insured (RM)</label>
              <input type="number" min={100} max={10000} step={100} value={inputs?.sumInsured || cover.coverSumInsured || 1000} onChange={(e) => onInputChange(cover.coverCode, 'sumInsured', e.target.value)} className="mt-1 w-32 rounded-lg border border-input px-2 py-1 text-xs" />
            </div>
          )}

          {/* CART LOV dropdowns (cover code 112) */}
          {isSelected && cover.coverCode === '112' && (
            <div className="mt-2 flex gap-3" onClick={(e) => e.stopPropagation()}>
              <div>
                <label className="text-xs text-muted-foreground">No. of Days</label>
                <select value={inputs?.cartDay || '7'} onChange={(e) => onInputChange(cover.coverCode, 'cartDay', e.target.value)} className="mt-1 w-20 rounded-lg border border-input px-2 py-1 text-xs">
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="21">21 days</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Amount per Day</label>
                <select value={inputs?.cartAmount || '100'} onChange={(e) => onInputChange(cover.coverCode, 'cartAmount', e.target.value)} className="mt-1 w-24 rounded-lg border border-input px-2 py-1 text-xs">
                  <option value="50">RM 50</option>
                  <option value="100">RM 100</option>
                  <option value="200">RM 200</option>
                </select>
              </div>
            </div>
          )}

          {/* Driver PA plan (cover code PAB3) */}
          {isSelected && cover.coverCode === 'PAB3' && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <label className="text-xs text-muted-foreground">Death/Permanent Disablement Benefit (per person)</label>
              <select value={inputs?.planCode || 'PAB3A'} onChange={(e) => onInputChange(cover.coverCode, 'planCode', e.target.value)} className="mt-1 w-56 rounded-lg border border-input px-2 py-1 text-xs">
                <option value="PAB3A">Plan A — RM 25,000</option>
                <option value="PAB3B">Plan B — RM 50,000</option>
              </select>
            </div>
          )}

          {/* e-Hailing driver details (cover code A202) */}
          {isSelected && cover.coverCode === 'A202' && (
            <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs text-muted-foreground font-medium">e-Hailing Driver Details</p>
              <div><label className="text-xs text-muted-foreground">Driver Name *</label><input value={ehailingDriver.fullName} onChange={(e) => onEhailingChange({ ...ehailingDriver, fullName: e.target.value.toUpperCase() })} className="mt-1 w-full rounded-lg border border-input px-2 py-1 text-xs uppercase" placeholder="DRIVER NAME" /></div>
              <div><label className="text-xs text-muted-foreground">ID No. *</label><input value={ehailingDriver.idNumber} onChange={(e) => onEhailingChange({ ...ehailingDriver, idNumber: e.target.value })} className="mt-1 w-full rounded-lg border border-input px-2 py-1 text-xs" placeholder="ID Number" /></div>
            </div>
          )}
        </div>
        <span className={`font-semibold text-sm flex-shrink-0 ${cover.displayPremium === 0 ? 'text-green-600' : ''}`}>{cover.displayPremium === 0 ? 'FREE' : `+ RM ${cover.displayPremium.toFixed(2)}`}</span>
      </div>
    </button>
  );
}
