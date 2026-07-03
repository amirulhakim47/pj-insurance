'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageLayout, Container, StepIndicator } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { customerDetailsSchema, type CustomerDetailsData } from '@/lib/validations';
import type { InsuranceFormData } from '@/types';
import type { VehicleDetailsResponse } from '@/types/allianz';

const steps = ['Details', 'Results', 'Customer Info', 'Payment'];

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

export default function CustomerDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<InsuranceFormData | null>(null);
  const [vehicleDetails, setVehicleDetails] = React.useState<VehicleDetailsResponse | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerDetailsData>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      nationality: 'MALAYSIA',
      maritalStatus: '0',
      mobilePrefix: '6012',
      addressLine2: '',
      addressLine3: '',
    },
  });

  const identityType = watch('identityType');

  React.useEffect(() => {
    const storedFormData = sessionStorage.getItem('insuranceFormData');
    const storedVehicle = sessionStorage.getItem('allianz_vehicleDetails');
    const storedQuotation = sessionStorage.getItem('allianz_quotation');

    if (!storedFormData || !storedQuotation) {
      router.push('/results');
      return;
    }

    const parsed: InsuranceFormData = JSON.parse(storedFormData);
    setFormData(parsed);

    if (storedVehicle) {
      setVehicleDetails(JSON.parse(storedVehicle));
    }

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

  const onSubmit = (data: CustomerDetailsData) => {
    sessionStorage.setItem('allianz_customerDetails', JSON.stringify(data));
    router.push('/payment');
  };

  if (!formData) return null;

  const isNRIC = identityType === 'NRIC';

  return (
    <PageLayout>
      <Container className="py-8">
        <StepIndicator steps={steps} currentStep={2} />

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Policyholder Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Please confirm your personal details for the insurance policy.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-base">
                  <User className="w-4 h-4 mr-2 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-sm font-medium" htmlFor="fullName">Name as per ID *</label>
                  <input
                    id="fullName"
                    {...register('fullName')}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase"
                    placeholder="FULL NAME AS PER IC"
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* ID Type */}
                  <div>
                    <label className="text-sm font-medium" htmlFor="identityType">ID Type</label>
                    <input
                      id="identityType"
                      {...register('identityType')}
                      readOnly
                      className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                    />
                  </div>
                  {/* ID Number */}
                  <div>
                    <label className="text-sm font-medium" htmlFor="identityNumber">ID Number</label>
                    <input
                      id="identityNumber"
                      {...register('identityNumber')}
                      readOnly
                      className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Nationality */}
                  <div>
                    <label className="text-sm font-medium" htmlFor="nationality">Nationality *</label>
                    <select
                      id="nationality"
                      {...register('nationality')}
                      disabled={isNRIC}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:bg-muted"
                    >
                      {NATIONALITY_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  {/* Date of Birth */}
                  <div>
                    <label className="text-sm font-medium" htmlFor="dateOfBirth">Date of Birth *</label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                      readOnly={isNRIC}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm read-only:bg-muted"
                    />
                    {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Gender */}
                  <div>
                    <label className="text-sm font-medium" htmlFor="gender">Gender *</label>
                    <select
                      id="gender"
                      {...register('gender')}
                      disabled={isNRIC}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:bg-muted"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      {formData.customerType === 'company' && <option value="C">Company</option>}
                    </select>
                  </div>
                  {/* Marital Status */}
                  <div>
                    <label className="text-sm font-medium" htmlFor="maritalStatus">Marital Status *</label>
                    <select
                      id="maritalStatus"
                      {...register('maritalStatus')}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {MARITAL_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {errors.maritalStatus && <p className="text-xs text-red-500 mt-1">{errors.maritalStatus.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mobile */}
                <div>
                  <label className="text-sm font-medium">Mobile Number *</label>
                  <div className="grid grid-cols-[140px_1fr] gap-2 mt-1">
                    <select
                      {...register('mobilePrefix')}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {MOBILE_PREFIXES.map((p) => (
                        <option key={p} value={p}>{p.replace('60', '+60')}</option>
                      ))}
                    </select>
                    <input
                      {...register('mobileNumber')}
                      placeholder="12345678"
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  {errors.mobilePrefix && <p className="text-xs text-red-500 mt-1">{errors.mobilePrefix.message}</p>}
                  {errors.mobileNumber && <p className="text-xs text-red-500 mt-1">{errors.mobileNumber.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium" htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="addressLine1">Address Line 1 *</label>
                  <input
                    id="addressLine1"
                    {...register('addressLine1')}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase"
                    placeholder="STREET ADDRESS"
                    maxLength={100}
                  />
                  {errors.addressLine1 && <p className="text-xs text-red-500 mt-1">{errors.addressLine1.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="addressLine2">Address Line 2</label>
                  <input
                    id="addressLine2"
                    {...register('addressLine2')}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="addressLine3">Address Line 3</label>
                  <input
                    id="addressLine3"
                    {...register('addressLine3')}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase"
                    maxLength={100}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium" htmlFor="postcode">Postcode *</label>
                    <input
                      id="postcode"
                      {...register('postcode')}
                      readOnly
                      className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="city">City</label>
                    <input
                      id="city"
                      {...register('city')}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="state">State</label>
                    <input
                      id="state"
                      {...register('state')}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="State"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Summary (read-only) */}
            {vehicleDetails && (
              <Card className="bg-muted/30">
                <CardContent className="py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Vehicle</p>
                  <p className="text-sm font-semibold">
                    {vehicleDetails.vehicleLicenseId} - {vehicleDetails.vehicleMake} {vehicleDetails.vehicleModelDesc || vehicleDetails.vehicleModel}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vehicleDetails.yearOfManufacture} | {vehicleDetails.vehicleEngineCC} CC | NCD {vehicleDetails.ncdPercentage}%
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="sm:w-auto h-12 px-8 text-base font-semibold"
              >
                Proceed to Payment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </PageLayout>
  );
}
