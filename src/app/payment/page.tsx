'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, CenteredLayout, StepIndicator } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InsurancePolicy, InsuranceFormData } from '@/types';
import { ShieldCheck, ArrowLeft, CreditCard, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SENANGPAY_CONFIG, generateSenangPayHash } from '@/lib/senangpay';

const steps = ['Details', 'Results', 'Payment'];

export default function PaymentPage() {
  const router = useRouter();
  const [policy, setPolicy] = React.useState<InsurancePolicy | null>(null);
  const [formData, setFormData] = React.useState<InsuranceFormData | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedPolicy = sessionStorage.getItem('selectedPolicy');
    const storedFormData = sessionStorage.getItem('insuranceFormData');
    
    if (!storedPolicy || !storedFormData) {
      router.push('/results');
      return;
    }

    try {
      setPolicy(JSON.parse(storedPolicy));
      setFormData(JSON.parse(storedFormData));
    } catch (e) {
      router.push('/results');
    }
  }, [router]);

  const handlePayment = async () => {
    if (!policy || !formData) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Generate a unique order ID
      const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const formattedAmount = (policy.finalPrice * 1.06 + 10).toFixed(2);
      const detail = `Insurance_${policy.provider.name.replace(/\s+/g, '_')}_${policy.id}`;
      
      // Prepare hash (client-side generation)
      const hash = await generateSenangPayHash(detail, formattedAmount, orderId);

      // Create a form and submit it to SenangPay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = SENANGPAY_CONFIG.url;

      // Add fields
      const fields = {
        detail: detail,
        amount: formattedAmount,
        order_id: orderId,
        hash: hash,
        name: "Customer", // Default or from form if available
        email: formData.email,
        phone: formData.phoneNumber,
      };

      Object.entries(fields).forEach(([key, value]) => {
        if (value) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment request. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!policy || !formData) return null;

  const totalAmount = (policy.finalPrice * 1.06 + 10).toFixed(2);

  return (
    <PageLayout>
      <CenteredLayout maxWidth="max-w-4xl">
        <StepIndicator steps={steps} currentStep={2} />

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Payment Summary */}
          <div className="space-y-6 md:order-2 flex flex-col">
             <Card className="bg-muted/30 h-full">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start pb-4 border-b">
                  <div>
                    <h3 className="font-semibold">{policy.provider.name}</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive Coverage</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">RM{policy.finalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Premium</span>
                    <span>RM{policy.originalPrice.toFixed(2)}</span>
                  </div>
                  {policy.discountPercentage && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({policy.discountPercentage}%)</span>
                      <span>-RM{(policy.originalPrice - policy.finalPrice).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Tax (6%)</span>
                    <span>RM{(policy.finalPrice * 0.06).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stamp Duty</span>
                    <span>RM10.00</span>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">
                    RM{totalAmount}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Action */}
          <div className="space-y-6 md:order-1 flex flex-col">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Secure Payment</CardTitle>
                <CardDescription>
                  You will be redirected to SenangPay secure payment gateway to complete your purchase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-grow">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="rounded-lg border p-4 bg-blue-50/50 border-blue-100">
                  <div className="flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-blue-900">Safe & Secure</h4>
                      <p className="text-xs text-blue-700">
                        Your payment information is encrypted and processed securely by SenangPay. 
                        We do not store your card details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Payer Email:</span> {formData.email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Payer Phone:</span> {formData.phoneNumber}
                    </div>
                </div>

              </CardContent>
              <CardFooter className="flex-col space-y-4 mt-auto">
                 <Button 
                    onClick={handlePayment}
                    className="w-full h-12 text-lg bg-[#38b2ac] hover:bg-[#319795]" // Teal color like SenangPay branding potentially
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Redirecting...</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <CreditCard className="w-5 h-5" />
                            <span>Pay with SenangPay</span>
                        </div>
                    )}
                  </Button>
                  
                  <Button variant="ghost" className="w-full" onClick={() => router.back()} disabled={isProcessing}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Results
                  </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </CenteredLayout>
    </PageLayout>
  );
}
