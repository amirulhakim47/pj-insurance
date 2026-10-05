'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  insuranceFormSchema,
  type InsuranceFormData,
  identityNumberLabel,
} from '@/lib/validations';
import { AllianzLogo } from '@/components/ui/allianz-logo';
import { PageLayout, CenteredLayout, StepIndicator } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioField, TextField, PlateNumberField, IdentityNumberField } from '@/components/ui/form-field';
import { DataProtectionCard } from '@/components/ui/data-protection-card';
import { PDPAConsent } from '@/components/ui/pdpa-consent';
import { vehicleTypeOptions, customerTypeOptions } from '@/data/mockUserData';
import { Car, Bike, ArrowRight, ArrowLeft } from 'lucide-react';

const FORM_DRAFT_KEY = 'insuranceFormDraft';

const steps = ['Details', 'Loading', 'Results'];

const isLocalDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const MARITAL_STATUS_OPTIONS = [
  { value: '0', label: 'Single' },
  { value: '1', label: 'Married' },
  { value: '2', label: 'Divorced / Widowed' },
  { value: '3', label: 'Others' },
];

const NATIONALITY_OPTIONS = [
  'MALAYSIA', 'SINGAPORE', 'INDONESIA', 'THAILAND', 'PHILIPPINES',
  'INDIA', 'CHINA', 'BANGLADESH', 'PAKISTAN', 'MYANMAR', 'OTHERS',
];

const DEV_DEFAULTS: Partial<InsuranceFormData> = {
  fullName: 'AHMAD BIN IBRAHIM',
  vehicleType: 'car',
  identityType: 'NRIC',
  nric: '841103-01-1116',
  plateNumber: 'VAP2104',
  postcode: '50000',
  phoneNumber: '0121234567',
  email: 'ahmad@example.com',
  customerType: 'individual',
  gender: 'M',
  nationality: 'MALAYSIA',
  maritalStatus: '0',
  isEhailing: false,
  isElectricVehicle: false,
  pdpaConsent: false,
};

function extractGenderFromNRIC(nric: string): 'M' | 'F' {
  const digits = nric.replace(/-/g, '');
  const lastDigit = parseInt(digits[digits.length - 1], 10);
  return lastDigit % 2 === 0 ? 'F' : 'M';
}

export default function InsuranceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceFormSchema),
    mode: 'onChange',
    defaultValues: {
      identityType: 'NRIC',
      customerType: 'individual',
      gender: undefined,
      nationality: 'MALAYSIA',
      maritalStatus: '0',
      isEhailing: false,
      isElectricVehicle: false,
      pdpaConsent: false,
      ...(isLocalDev ? DEV_DEFAULTS : {}),
    },
  });

  const identityType = watch('identityType');
  const customerType = watch('customerType');
  const nricValue = watch('nric');

  React.useEffect(() => {
    const draft = sessionStorage.getItem(FORM_DRAFT_KEY);
    if (draft) {
      try {
        reset(JSON.parse(draft) as InsuranceFormData);
      } catch {
        /* ignore corrupt draft */
      }
    }
    const plate = searchParams.get('plate');
    if (plate) {
      setValue('plateNumber', plate.toUpperCase(), { shouldValidate: true });
    }
  }, [searchParams, setValue, reset]);

  const watched = watch();
  React.useEffect(() => {
    sessionStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(watched));
  }, [watched]);

  React.useEffect(() => {
    if (identityType === 'NRIC' && nricValue && /^\d{6}-\d{2}-\d{4}$/.test(nricValue)) {
      setValue('gender', extractGenderFromNRIC(nricValue), { shouldValidate: true });
      setValue('nationality', 'MALAYSIA');
    }
  }, [identityType, nricValue, setValue]);

  React.useEffect(() => {
    if (customerType === 'company') {
      setValue('identityType', 'BR_NO', { shouldValidate: true });
      setValue('gender', 'C', { shouldValidate: true });
      setValue('maritalStatus', '3', { shouldValidate: true });
    }
  }, [customerType, setValue]);

  const showNationality =
    customerType === 'individual' &&
    identityType !== 'NRIC' &&
    identityType !== 'BR_NO';

  const onSubmit = async (data: InsuranceFormData) => {
    setIsSubmitting(true);
    try {
      sessionStorage.setItem('insuranceFormData', JSON.stringify(data));
      sessionStorage.removeItem(FORM_DRAFT_KEY);
      router.push('/loading');
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <CenteredLayout maxWidth="max-w-2xl">
        <div className="text-center space-y-3">
          <AllianzLogo />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Get your insurance quote
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            Fill in your details to compare the best policies available
          </p>
        </div>

        <StepIndicator steps={steps} currentStep={0} />

        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to home
          </Link>
        </div>

        <div className="mb-6">
          <DataProtectionCard />
        </div>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-semibold text-foreground">
              Vehicle &amp; personal details
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Controller
                name="customerType"
                control={control}
                render={({ field }) => (
                  <RadioField
                    label="Customer Type"
                    name="customerType"
                    options={customerTypeOptions.map((option) => ({
                      value: option.value,
                      label: (
                        <div>
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      ),
                    }))}
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      if (v === 'individual') {
                        setValue('identityType', 'NRIC', { shouldValidate: true });
                      }
                    }}
                    error={errors.customerType?.message}
                    required
                  />
                )}
              />

              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Full Name"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={errors.fullName?.message}
                    required
                    placeholder="ENTER YOUR FULL NAME"
                    type="text"
                  />
                )}
              />

              <Controller
                name="vehicleType"
                control={control}
                render={({ field }) => (
                  <RadioField
                    label="Vehicle Type"
                    name="vehicleType"
                    options={vehicleTypeOptions.map((option) => ({
                      value: option.value,
                      label: (
                        <div className="flex items-center gap-3">
                          {option.value === 'car' ? (
                            <Car className="w-4 h-4 text-primary" />
                          ) : (
                            <Bike className="w-4 h-4 text-primary" />
                          )}
                          <div>
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                      ),
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    error={errors.vehicleType?.message}
                    required
                  />
                )}
              />

              {customerType === 'individual' && (
                <Controller
                  name="identityType"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">
                        Identity Type <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={field.value || 'NRIC'}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setValue('nric', '', { shouldValidate: false });
                        }}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="NRIC">NRIC (National Registration Identity Card)</option>
                        <option value="OLD_IC">Old IC / Others</option>
                        <option value="PASS">Passport</option>
                        <option value="POL">Police / Army ID</option>
                      </select>
                      {errors.identityType?.message && (
                        <p className="text-sm text-destructive">{errors.identityType.message}</p>
                      )}
                    </div>
                  )}
                />
              )}

              <Controller
                name="nric"
                control={control}
                render={({ field }) => (
                  <IdentityNumberField
                    identityType={identityType}
                    label={identityNumberLabel(identityType)}
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.nric?.message}
                    required
                  />
                )}
              />

              {showNationality && (
                <Controller
                  name="nationality"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">
                        Nationality <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select nationality</option>
                        {NATIONALITY_OPTIONS.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      {errors.nationality?.message && (
                        <p className="text-sm text-destructive">{errors.nationality.message}</p>
                      )}
                    </div>
                  )}
                />
              )}

              {customerType === 'individual' && (
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">
                        Gender <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={identityType === 'NRIC'}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:opacity-70"
                      >
                        <option value="">Select gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                      {errors.gender?.message && (
                        <p className="text-sm text-destructive">{errors.gender.message}</p>
                      )}
                    </div>
                  )}
                />
              )}

              <Controller
                name="plateNumber"
                control={control}
                render={({ field }) => (
                  <PlateNumberField
                    label="Vehicle Plate Number"
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.plateNumber?.message}
                    required
                    placeholder="ABC1234"
                  />
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="postcode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Postcode"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      error={errors.postcode?.message}
                      required
                      placeholder="50450"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                    />
                  )}
                />

                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Phone Number"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      error={errors.phoneNumber?.message}
                      required
                      placeholder="0123456789"
                      type="tel"
                    />
                  )}
                />
              </div>

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Email Address"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={errors.email?.message}
                    required
                    placeholder="your@email.com"
                    type="email"
                  />
                )}
              />

              <Controller
                name="maritalStatus"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Marital Status <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={field.value || '0'}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={customerType === 'company'}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:opacity-70"
                    >
                      {MARITAL_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {errors.maritalStatus?.message && (
                      <p className="text-sm text-destructive">{errors.maritalStatus.message}</p>
                    )}
                  </div>
                )}
              />

              <input type="hidden" {...control.register('isEhailing')} />
              <input type="hidden" {...control.register('isElectricVehicle')} />

              <div className="pt-3 border-t border-border/40">
                <Controller
                  name="pdpaConsent"
                  control={control}
                  render={({ field }) => (
                    <PDPAConsent
                      checked={field.value || false}
                      onChange={field.onChange}
                      error={errors.pdpaConsent?.message}
                    />
                  )}
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      Get insurance quotes
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Your information is secure and will only be used to provide insurance quotes.
        </p>
      </CenteredLayout>
    </PageLayout>
  );
}
