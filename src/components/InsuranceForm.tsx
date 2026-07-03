'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { insuranceFormSchema, type InsuranceFormData } from '@/lib/validations';
import { PageLayout, CenteredLayout, StepIndicator } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioField, TextField, NRICField, PlateNumberField } from '@/components/ui/form-field';
import { DataProtectionCard } from '@/components/ui/data-protection-card';
import { PDPAConsent } from '@/components/ui/pdpa-consent';
import { vehicleTypeOptions, customerTypeOptions } from '@/data/mockUserData';
import { Car, Bike, FileText, ArrowRight } from 'lucide-react';

const steps = ['Details', 'Loading', 'Results'];

const isLocalDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

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
  isEhailing: false,
  isElectricVehicle: false,
  pdpaConsent: false,
};

export default function InsuranceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceFormSchema),
    mode: 'onChange',
    defaultValues: {
      identityType: 'NRIC',
      isEhailing: false,
      isElectricVehicle: false,
      pdpaConsent: false,
      ...(isLocalDev ? DEV_DEFAULTS : {}),
    },
  });

  React.useEffect(() => {
    const plate = searchParams.get('plate');
    if (plate) {
      setValue('plateNumber', plate.toUpperCase(), { shouldValidate: true });
    }
  }, [searchParams, setValue]);

  const pdpaConsent = watch('pdpaConsent');

  const onSubmit = async (data: InsuranceFormData) => {
    setIsSubmitting(true);
    try {
      sessionStorage.setItem('insuranceFormData', JSON.stringify(data));
      router.push('/loading');
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <CenteredLayout
        title="Get your insurance quote"
        subtitle="Fill in your details to compare the best policies available"
        maxWidth="max-w-2xl"
      >
        <StepIndicator steps={steps} currentStep={0} />

        <div className="mb-6">
          <DataProtectionCard />
        </div>

        <Card className="border-border/60">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-semibold text-foreground">
              Vehicle &amp; personal details
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    options={vehicleTypeOptions.map(option => ({
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
                      description: undefined,
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    error={errors.vehicleType?.message}
                    required
                  />
                )}
              />

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
                      onChange={(e) => field.onChange(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="NRIC">NRIC (National Registration Identity Card)</option>
                      <option value="OLD_IC">Old IC / Others</option>
                      <option value="PASS">Passport</option>
                      <option value="POL">Police / Army ID</option>
                      <option value="BR_NO">Company Registration (BR No)</option>
                    </select>
                    {errors.identityType?.message && (
                      <p className="text-sm text-destructive">{errors.identityType.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="nric"
                control={control}
                render={({ field }) => (
                  <NRICField
                    label="NRIC / ID Number"
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.nric?.message}
                    required
                    placeholder="123456-12-1234"
                  />
                )}
              />

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
                name="customerType"
                control={control}
                render={({ field }) => (
                  <RadioField
                    label="Customer Type"
                    name="customerType"
                    options={customerTypeOptions.map(option => ({
                      value: option.value,
                      label: (
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-primary" />
                          <div>
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                      ),
                      description: undefined,
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    error={errors.customerType?.message}
                    required
                  />
                )}
              />

              <div className="space-y-3 pt-3 border-t border-border/60">
                <h3 className="text-sm font-semibold text-foreground">
                  Additional vehicle information
                </h3>

                <Controller
                  name="isEhailing"
                  control={control}
                  render={({ field }) => (
                    <label
                      htmlFor="isEhailing"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <input
                          type="checkbox"
                          id="isEhailing"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="peer h-4.5 w-4.5 shrink-0 rounded border-2 border-muted-foreground/30 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 appearance-none cursor-pointer checked:bg-primary checked:border-primary transition-colors"
                        />
                        {field.value && (
                          <svg className="absolute h-3 w-3 text-primary-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm select-none">
                        Used for e-hailing (Grab, etc.)
                      </span>
                    </label>
                  )}
                />

                <Controller
                  name="isElectricVehicle"
                  control={control}
                  render={({ field }) => (
                    <label
                      htmlFor="isElectricVehicle"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <input
                          type="checkbox"
                          id="isElectricVehicle"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="peer h-4.5 w-4.5 shrink-0 rounded border-2 border-muted-foreground/30 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 appearance-none cursor-pointer checked:bg-primary checked:border-primary transition-colors"
                        />
                        {field.value && (
                          <svg className="absolute h-3 w-3 text-primary-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm select-none">
                        Electric vehicle (EV)
                      </span>
                    </label>
                  )}
                />
              </div>

              <div className="pt-3 border-t border-border/60">
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
                      <ArrowRight className="w-4 h-4 ml-2" />
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
