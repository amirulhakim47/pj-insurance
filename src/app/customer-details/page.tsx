'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageLayout, Container, StepIndicator } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, User, Phone, MapPin, Users } from 'lucide-react';
import { customerDetailsSchema, type CustomerDetailsData } from '@/lib/validations';
import { getLOV } from '@/lib/allianz-api';
import type { InsuranceFormData } from '@/types';
import type { VehicleDetailsResponse } from '@/types/allianz';

const STEPS = ['Vehicle Details', 'Quotation', 'Customer Info', 'Review & Pay'];

const MARITAL_STATUS_OPTIONS = [
  { value: '0', label: 'Single' },
  { value: '1', label: 'Married' },
  { value: '2', label: 'Divorced / Widowed' },
  { value: '3', label: 'Others' },
];

const MOBILE_PREFIXES = [
  '6010', '6011', '6012', '6013', '6014', '6015', '6016', '6017', '6018', '6019',
];

const NATIONALITY_OPTIONS = [
  'MALAYSIA', 'SINGAPORE', 'INDONESIA', 'THAILAND', 'PHILIPPINES',
  'INDIA', 'CHINA', 'BANGLADESH', 'PAKISTAN', 'MYANMAR', 'OTHERS',
];

interface AdditionalDriverInfo {
  fullName: string;
  nationality: string;
  idType: string;
  idNumber: string;
}

function extractBirthDateFromNRIC(nric: string): string {
  const digits = nric.replace(/-/g, '');
  const yy = digits.substring(0, 2);
  const mm = digits.substring(2, 4);
  const dd = digits.substring(4, 6);
  const year = parseInt(yy, 10) > 30 ? `19${yy}` : `20${yy}`;
  return `${year}-${mm}-${dd}`;
}

function extractGenderFromNRIC(nric: string): 'M' | 'F' {
  const digits = nric.replace(/-/g, '');
  const lastDigit = parseInt(digits[digits.length - 1], 10);
  return lastDigit % 2 === 0 ? 'F' : 'M';
}

const inputClass = 'mt-1 w-full rounded-lg border border-input/80 bg-background px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 placeholder:text-muted-foreground/50';
const readonlyClass = 'mt-1 w-full rounded-lg border border-input/60 bg-muted/30 px-3 py-2.5 text-sm';

export default function CustomerDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<InsuranceFormData | null>(null);
  const [vehicleDetails, setVehicleDetails] = React.useState<VehicleDetailsResponse | null>(null);
  const [driverPlan, setDriverPlan] = React.useState<string>('0');
  const [additionalDrivers, setAdditionalDrivers] = React.useState<AdditionalDriverInfo[]>([]);
  const [postcodeValid, setPostcodeValid] = React.useState<boolean | null>(null);
  const [postcodeChecking, setPostcodeChecking] = React.useState(false);

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerDetailsData>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: { nationality: 'MALAYSIA', maritalStatus: '0', mobilePrefix: '6012', addressLine2: '', addressLine3: '' },
  });

  const identityType = watch('identityType');
  const postcode = watch('postcode');

  React.useEffect(() => {
    const storedFormData = sessionStorage.getItem('insuranceFormData');
    const storedVehicle = sessionStorage.getItem('allianz_vehicleDetails');
    const storedQuotation = sessionStorage.getItem('allianz_quotation');

    if (!storedFormData || !storedQuotation) { router.push('/results'); return; }

    const parsed: InsuranceFormData = JSON.parse(storedFormData);
    setFormData(parsed);
    if (storedVehicle) setVehicleDetails(JSON.parse(storedVehicle));

    const plan = sessionStorage.getItem('allianz_driverPlan') || '0';
    setDriverPlan(plan);
    const storedDrivers = sessionStorage.getItem('allianz_additionalDrivers');
    if (storedDrivers) setAdditionalDrivers(JSON.parse(storedDrivers));

    const idType = (parsed.identityType || 'NRIC') as CustomerDetailsData['identityType'];
    setValue('fullName', parsed.fullName?.toUpperCase() || '');
    setValue('identityType', idType);
    setValue('identityNumber', parsed.nric.replace(/-/g, ''));
    setValue('email', parsed.email || '');
    setValue('postcode', parsed.postcode || '');

    if (idType === 'NRIC') {
      setValue('dateOfBirth', extractBirthDateFromNRIC(parsed.nric));
      setValue('gender', extractGenderFromNRIC(parsed.nric));
      setValue('nationality', 'MALAYSIA');
    }

    if (parsed.phoneNumber) {
      const match = parsed.phoneNumber.match(/^(\+?6?0\d{1,2})(\d{7,8})$/);
      if (match) {
        const prefix = match[1].startsWith('60') ? match[1] : `60${match[1].replace(/^\+?6?/, '')}`;
        setValue('mobilePrefix', prefix);
        setValue('mobileNumber', match[2]);
      }
    }

    const existingDetails = sessionStorage.getItem('allianz_customerDetails');
    if (existingDetails) {
      const details: CustomerDetailsData = JSON.parse(existingDetails);
      Object.entries(details).forEach(([key, value]) => {
        if (value) setValue(key as keyof CustomerDetailsData, value as string);
      });
    }
  }, [router, setValue]);

  const validatePostcode = React.useCallback(async (code: string) => {
    if (!code || code.length !== 5) return;
    setPostcodeChecking(true);
    try {
      const result = await getLOV<{ city?: string; state?: string; valid?: boolean }>('postcode', { postcode: code });
      if (result.city) setValue('city', result.city);
      if (result.state) setValue('state', result.state);
      setPostcodeValid(result.valid !== false);
    } catch {
      setPostcodeValid(null);
    } finally { setPostcodeChecking(false); }
  }, [setValue]);

  React.useEffect(() => {
    if (postcode?.length === 5) validatePostcode(postcode);
  }, [postcode, validatePostcode]);

  const updateDriverInfo = (index: number, field: keyof AdditionalDriverInfo, value: string) => {
    setAdditionalDrivers((prev) => {
      const updated = prev.map((d, i) => i === index ? { ...d, [field]: value } : d);
      sessionStorage.setItem('allianz_additionalDrivers', JSON.stringify(updated));
      return updated;
    });
  };

  const onSubmit = (data: CustomerDetailsData) => {
    sessionStorage.setItem('allianz_customerDetails', JSON.stringify(data));
    sessionStorage.setItem('allianz_additionalDrivers', JSON.stringify(additionalDrivers));
    router.push('/payment');
  };

  if (!formData) return null;
  const isNRIC = identityType === 'NRIC';
  const showDriverForms = driverPlan === '1' || driverPlan === '2';

  return (
    <PageLayout>
      <Container className="py-8 sm:py-10">
        <StepIndicator steps={STEPS} currentStep={2} />

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Policyholder details</h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed">Confirm your personal details for the insurance policy.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Personal Information */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="flex items-center text-sm font-semibold"><User className="w-4 h-4 mr-2 text-primary" />Personal information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="fullName">Name as per ID *</label>
                  <input id="fullName" {...register('fullName')} className={`${inputClass} uppercase`} placeholder="FULL NAME AS PER IC" />
                  {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium" htmlFor="identityType">ID Type</label><input id="identityType" {...register('identityType')} readOnly className={readonlyClass} /></div>
                  <div><label className="text-sm font-medium" htmlFor="identityNumber">ID Number</label><input id="identityNumber" {...register('identityNumber')} readOnly className={`${readonlyClass} uppercase`} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium" htmlFor="nationality">Nationality *</label><select id="nationality" {...register('nationality')} disabled={isNRIC} className={isNRIC ? readonlyClass : inputClass}>{NATIONALITY_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
                  <div><label className="text-sm font-medium" htmlFor="dateOfBirth">Date of Birth *</label><input id="dateOfBirth" type="date" {...register('dateOfBirth')} readOnly={isNRIC} className={isNRIC ? readonlyClass : inputClass} />{errors.dateOfBirth && <p className="text-xs text-destructive mt-1">{errors.dateOfBirth.message}</p>}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium" htmlFor="gender">Gender *</label><select id="gender" {...register('gender')} disabled={isNRIC} className={isNRIC ? readonlyClass : inputClass}><option value="M">Male</option><option value="F">Female</option>{formData.customerType === 'company' && <option value="C">Company</option>}</select></div>
                  <div><label className="text-sm font-medium" htmlFor="maritalStatus">Marital Status *</label><select id="maritalStatus" {...register('maritalStatus')} className={inputClass}>{MARITAL_STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{errors.maritalStatus && <p className="text-xs text-destructive mt-1">{errors.maritalStatus.message}</p>}</div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="flex items-center text-sm font-semibold"><Phone className="w-4 h-4 mr-2 text-primary" />Contact information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Mobile Number *</label>
                  <div className="grid grid-cols-[130px_1fr] gap-2 mt-1">
                    <select {...register('mobilePrefix')} className={inputClass.replace('mt-1 ', '')}>{MOBILE_PREFIXES.map((p) => <option key={p} value={p}>{p.replace('60', '+60')}</option>)}</select>
                    <input {...register('mobileNumber')} placeholder="12345678" className={inputClass.replace('mt-1 ', '')} />
                  </div>
                  {errors.mobilePrefix && <p className="text-xs text-destructive mt-1">{errors.mobilePrefix.message}</p>}
                  {errors.mobileNumber && <p className="text-xs text-destructive mt-1">{errors.mobileNumber.message}</p>}
                </div>
                <div><label className="text-sm font-medium" htmlFor="email">Email Address *</label><input id="email" type="email" {...register('email')} className={inputClass} />{errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}</div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="flex items-center text-sm font-semibold"><MapPin className="w-4 h-4 mr-2 text-primary" />Address</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium" htmlFor="addressLine1">Address Line 1 *</label><input id="addressLine1" {...register('addressLine1')} className={`${inputClass} uppercase`} placeholder="STREET ADDRESS" maxLength={100} />{errors.addressLine1 && <p className="text-xs text-destructive mt-1">{errors.addressLine1.message}</p>}</div>
                <div><label className="text-sm font-medium" htmlFor="addressLine2">Address Line 2</label><input id="addressLine2" {...register('addressLine2')} className={`${inputClass} uppercase`} maxLength={100} /></div>
                <div><label className="text-sm font-medium" htmlFor="addressLine3">Address Line 3</label><input id="addressLine3" {...register('addressLine3')} className={`${inputClass} uppercase`} maxLength={100} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium" htmlFor="postcode">Postcode *</label>
                    <input id="postcode" {...register('postcode')} className={inputClass} maxLength={5} />
                    {postcodeChecking && <p className="text-xs text-muted-foreground mt-1">Validating...</p>}
                    {postcodeValid === false && <p className="text-xs text-destructive mt-1">Invalid postcode</p>}
                  </div>
                  <div><label className="text-sm font-medium" htmlFor="city">City</label><input id="city" {...register('city')} className={inputClass} placeholder="City" /></div>
                  <div><label className="text-sm font-medium" htmlFor="state">State</label><input id="state" {...register('state')} className={inputClass} placeholder="State" /></div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Drivers */}
            {showDriverForms && (
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="flex items-center text-sm font-semibold"><Users className="w-4 h-4 mr-2 text-primary" />Additional driver details</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  {additionalDrivers.map((driver, idx) => (
                    <div key={idx} className="space-y-3 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Driver {idx + 1}</p>
                      <div><label className="text-sm font-medium">Name as per ID *</label><input value={driver.fullName} onChange={(e) => updateDriverInfo(idx, 'fullName', e.target.value.toUpperCase())} className={`${inputClass} uppercase`} placeholder="FULL NAME" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-sm font-medium">Nationality *</label><select value={driver.nationality} onChange={(e) => updateDriverInfo(idx, 'nationality', e.target.value)} className={inputClass}>{NATIONALITY_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
                        <div><label className="text-sm font-medium">ID Type *</label><select value={driver.idType} onChange={(e) => updateDriverInfo(idx, 'idType', e.target.value)} className={inputClass}><option value="NRIC">NRIC</option><option value="OLD_IC">Old IC</option><option value="PASS">Passport</option></select></div>
                      </div>
                      <div><label className="text-sm font-medium">ID Number *</label><input value={driver.idNumber} onChange={(e) => updateDriverInfo(idx, 'idNumber', e.target.value)} className={inputClass} placeholder="ID Number" /></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Vehicle summary */}
            {vehicleDetails && (
              <div className="bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl p-4 border border-border/30 shadow-sm">
                <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.15em] mb-1.5">Vehicle</p>
                <p className="text-sm font-semibold">{vehicleDetails.vehicleLicenseId} — {vehicleDetails.vehicleMake} {vehicleDetails.vehicleModelDesc || vehicleDetails.vehicleModel}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{vehicleDetails.yearOfManufacture} | {vehicleDetails.vehicleEngineCC} CC | NCD {vehicleDetails.ncdPercentage}%</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()} className="sm:w-auto h-11"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              <Button type="submit" disabled={isSubmitting} className="sm:w-auto h-12 px-8 text-base font-semibold">Proceed to payment<ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </form>
        </div>
      </Container>
    </PageLayout>
  );
}
