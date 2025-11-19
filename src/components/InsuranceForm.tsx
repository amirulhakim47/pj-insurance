'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { insuranceFormSchema, type InsuranceFormData } from '@/lib/validations';
import { PageLayout, CenteredLayout, StepIndicator } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioField, TextField, NRICField, PlateNumberField } from '@/components/ui/form-field';
import { vehicleTypeOptions, customerTypeOptions } from '@/data/mockUserData';
import { Car, Bike, Shield, FileText } from 'lucide-react';

const steps = ['Details', 'Loading', 'Results'];

export default function InsuranceForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceFormSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: InsuranceFormData) => {
    setIsSubmitting(true);
    
    try {
      // Store form data in sessionStorage for the next page
      sessionStorage.setItem('insuranceFormData', JSON.stringify(data));
      
      // Navigate to loading page
      router.push('/loading');
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <CenteredLayout
        title="Get Your Insurance Quote"
        subtitle="Fill in your details to find the best insurance policies for you"
        maxWidth="max-w-2xl"
      >
        <StepIndicator steps={steps} currentStep={0} />
        
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center space-x-2">
              <Shield className="w-6 h-6 text-primary" />
              <span>Insurance Details</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Vehicle Type Selection */}
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
                        <div className="flex items-center space-x-3">
                          {option.value === 'car' ? (
                            <Car className="w-5 h-5 text-primary" />
                          ) : (
                            <Bike className="w-5 h-5 text-primary" />
                          )}
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
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

              {/* NRIC Input */}
              <Controller
                name="nric"
                control={control}
                render={({ field }) => (
                  <NRICField
                    label="NRIC Number"
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.nric?.message}
                    required
                    placeholder="123456-12-1234"
                  />
                )}
              />

              {/* Plate Number Input */}
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

              {/* Postcode Input */}
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

              {/* Phone Number Input */}
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

              {/* Email Input */}
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

              {/* Customer Type Selection */}
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
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
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

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Get Insurance Quotes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Your information is secure and will only be used to provide insurance quotes.
          </p>
        </div>
      </CenteredLayout>
    </PageLayout>
  );
}
