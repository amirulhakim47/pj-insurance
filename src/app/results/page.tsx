'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, Container, StepIndicator, Grid } from '@/components/ui/layout';
import { PolicyCard } from '@/components/ui/policy-card';
import { Button } from '@/components/ui/button';
import { getPoliciesByVehicleType } from '@/data/mockPolicyData';
import { InsuranceFormData, InsurancePolicy } from '@/types';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { getHref } from '@/lib/utils';

const steps = ['Details', 'Processing', 'Results', 'Payment'];

export default function ResultsPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<InsuranceFormData | null>(null);
  const [selectedPolicy, setSelectedPolicy] = React.useState<InsurancePolicy | null>(null);
  const [policies, setPolicies] = React.useState<InsurancePolicy[]>([]);

  React.useEffect(() => {
    // Get form data from sessionStorage
    const storedFormData = sessionStorage.getItem('insuranceFormData');
    if (!storedFormData) {
      router.push('/');
      return;
    }

    try {
      const parsedFormData: InsuranceFormData = JSON.parse(storedFormData);
      setFormData(parsedFormData);
      
      // Get policies based on vehicle type
      const allPolicies = getPoliciesByVehicleType(parsedFormData.vehicleType);
      
      // Initialize policies with loading state logic
      // First policy is ready immediately (or very quickly)
      // Others are loading
      const initialPolicies = allPolicies.map((policy, index) => ({
        ...policy,
        loading: index > 0 // First one is ready, others wait
      }));
      
      setPolicies(initialPolicies);

      // Simulate staggered loading
      initialPolicies.forEach((policy, index) => {
        if (index > 0) {
            // Random delay between 1.5s and 4s for subsequent policies
            const delay = 1500 + (index * 1000) + (Math.random() * 500);
            
            setTimeout(() => {
                setPolicies(prevPolicies => 
                    prevPolicies.map(p => 
                        p.id === policy.id ? { ...p, loading: false } : p
                    )
                );
            }, delay);
        }
      });

    } catch (error) {
      console.error('Error parsing form data:', error);
      router.push('/');
    }
  }, [router]);

  const handlePolicySelect = (policy: InsurancePolicy) => {
    if (policy.loading) return;
    setSelectedPolicy(policy);
    // Save to session storage for the payment page
    sessionStorage.setItem('selectedPolicy', JSON.stringify(policy));
  };

  const handlePaymentRedirect = () => {
    if (!selectedPolicy) return;
    router.push('/payment');
  };

  const handleBackToForm = () => {
    router.push('/');
  };

  if (!formData) {
    return null; // Loading or redirecting
  }

  // Current step for results page
  const currentStep = 2;
  // Display "Processed" instead of "Processing" when the step is completed
  const displaySteps = steps.map((label, index) =>
    index === 1 && currentStep > 1 ? 'Processed' : label
  );

  return (
    <PageLayout>
      <Container className="py-8">
        <StepIndicator steps={displaySteps} currentStep={currentStep} />
        
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Your Insurance Options
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We found {policies.length} insurance policies for your {formData.vehicleType}. 
              Compare and select the best option for you.
            </p>
          </div>

          {/* Vehicle Info Summary */}
          <div className="bg-card border rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-semibold text-foreground mb-3">Your Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium capitalize">{formData.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plate Number:</span>
                <span className="font-medium">{formData.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Postcode:</span>
                <span className="font-medium">{formData.postcode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer Type:</span>
                <span className="font-medium capitalize">{formData.customerType}</span>
              </div>
            </div>
          </div>

          {/* Policy Cards Grid */}
          <Grid 
            cols={{ default: 1, md: 2, lg: 3 }} 
            gap={6}
            className="max-w-7xl mx-auto"
          >
            {policies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                isSelected={selectedPolicy?.id === policy.id}
                onSelect={handlePolicySelect}
              />
            ))}
          </Grid>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Button
              variant="outline"
              onClick={handleBackToForm}
              className="w-full sm:w-auto h-12"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>

            <Button
              onClick={handlePaymentRedirect}
              disabled={!selectedPolicy}
              className={`w-full sm:w-auto h-12 text-lg font-semibold shadow-lg transition-all duration-200 ${
                selectedPolicy
                  ? 'bg-primary hover:bg-primary/90 shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]'
                  : ''
              }`}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Proceed to Payment
            </Button>
          </div>

          {selectedPolicy && (
            <div className="text-center text-sm text-muted-foreground max-w-md mx-auto">
              <p>
                You've selected <strong>{selectedPolicy.provider.name}</strong> for{' '}
                <strong>RM{selectedPolicy.finalPrice.toFixed(2)}</strong>. 
                Click "Proceed to Payment" to complete your purchase.
              </p>
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
