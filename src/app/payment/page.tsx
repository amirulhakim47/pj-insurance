'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, CenteredLayout, StepIndicator } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { InsuranceFormData } from '@/types';
import type { QuotationResponse, VehicleDetailsResponse } from '@/types/allianz';
import { ShieldCheck, ArrowLeft, CreditCard, AlertCircle, FileText, ExternalLink, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SENANGPAY_CONFIG, generateSenangPayHash } from '@/lib/senangpay';

const steps = ['Details', 'Results', 'Payment'];

export default function PaymentPage() {
  const router = useRouter();
  const [quotation, setQuotation] = React.useState<QuotationResponse | null>(null);
  const [vehicleDetails, setVehicleDetails] = React.useState<VehicleDetailsResponse | null>(null);
  const [formData, setFormData] = React.useState<InsuranceFormData | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pdsAcknowledged, setPdsAcknowledged] = React.useState(false);
  const [marketingConsent, setMarketingConsent] = React.useState(false);

  React.useEffect(() => {
    const storedQuotation = sessionStorage.getItem('allianz_quotation');
    const storedVehicle = sessionStorage.getItem('allianz_vehicleDetails');
    const storedFormData = sessionStorage.getItem('insuranceFormData');

    if (!storedQuotation || !storedFormData) {
      router.push('/results');
      return;
    }

    try {
      setQuotation(JSON.parse(storedQuotation));
      setFormData(JSON.parse(storedFormData));
      if (storedVehicle) setVehicleDetails(JSON.parse(storedVehicle));
    } catch {
      router.push('/results');
    }
  }, [router]);

  const handlePayment = async () => {
    if (!quotation || !formData || !pdsAcknowledged) return;

    setIsProcessing(true);
    setError(null);

    sessionStorage.setItem('allianz_marketingConsent', marketingConsent ? 'Y' : 'N');

    try {
      const orderId = `ORDER-${quotation.contract.contractNumber}-${Date.now()}`;
      const formattedAmount = quotation.premium.premiumDueRounded.toFixed(2);
      const detail = `Motor_Insurance_${quotation.contract.contractNumber}`;

      const hash = await generateSenangPayHash(detail, formattedAmount, orderId);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = SENANGPAY_CONFIG.url;

      const fields: Record<string, string> = {
        detail,
        amount: formattedAmount,
        order_id: orderId,
        hash,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment request. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!quotation || !formData) return null;

  const premium = quotation.premium;

  return (
    <PageLayout>
      <CenteredLayout maxWidth="max-w-4xl">
        <StepIndicator steps={steps} currentStep={2} />

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Payment Action */}
          <div className="space-y-5 md:order-1">
            <Card className="border-border/60 shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Secure payment</CardTitle>
                <CardDescription>
                  You&apos;ll be redirected to SenangPay to complete your purchase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">Encrypted and secure</h4>
                      <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                        Your payment is processed securely by SenangPay. We never store card details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payer</span>
                    <span className="font-medium">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{formData.phoneNumber}</span>
                  </div>
                </div>

                {/* PDS Acknowledgment */}
                <div className="space-y-3 pt-4 border-t border-border/60">
                  <label htmlFor="pds-acknowledgment" className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="pds-acknowledgment"
                      checked={pdsAcknowledged}
                      onChange={(e) => setPdsAcknowledged(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I confirm that I have read and understood the{' '}
                      <a href="/docs/allianz-motor-pds.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                        Product Disclosure Sheet <ExternalLink className="w-2.5 h-2.5" />
                      </a>,{' '}
                      <a href="https://www.allianz.com.my/motor-comprehensive-insurance" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                        Policy Wording <ExternalLink className="w-2.5 h-2.5" />
                      </a>{' '}
                      &amp;{' '}
                      <a href="https://www.allianz.com.my/privacy-statement" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                        Privacy Notice <ExternalLink className="w-2.5 h-2.5" />
                      </a>{' '}
                      and agree to the processing of my personal data.
                    </span>
                  </label>

                  <label htmlFor="marketing-consent" className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="marketing-consent"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I consent to Allianz disclosing my details to the Allianz Malaysia Berhad group for marketing purposes.{' '}
                      <span className="italic">(Optional)</span>
                    </span>
                  </label>

                  {!pdsAcknowledged && (
                    <p className="text-xs text-amber-600 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      Please acknowledge the Product Disclosure Sheet to proceed.
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button
                  onClick={handlePayment}
                  className="w-full h-12 text-base font-semibold"
                  disabled={isProcessing || !pdsAcknowledged}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Redirecting...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay RM {premium.premiumDueRounded.toFixed(2)}
                    </>
                  )}
                </Button>

                <Button variant="ghost" className="w-full" onClick={() => router.back()} disabled={isProcessing}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:order-2">
            <Card className="bg-muted/20 border-border/60 shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="pb-4 border-b border-border/60">
                  <h3 className="font-semibold text-sm">Allianz Motor Comprehensive</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Contract: {quotation.contract.contractNumber}
                  </p>
                  {vehicleDetails && (
                    <p className="text-xs text-muted-foreground">
                      {vehicleDetails.vehicleLicenseId} — {vehicleDetails.vehicleMake}
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Premium</span>
                    <span>RM {premium.basicPremium.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>NCD Discount ({premium.ncdPct}%)</span>
                    <span>- RM {premium.ncdAmt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Premium</span>
                    <span>RM {premium.grossPremium.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Tax ({premium.serviceTaxPercentage}%)</span>
                    <span>RM {premium.serviceTaxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stamp Duty</span>
                    <span>RM {premium.stampDuty.toFixed(2)}</span>
                  </div>

                  {/* Commission Disclosure */}
                  <div className="pt-3 mt-3 border-t border-dashed border-border/60 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Commission Disclosure</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Commission Rate</span>
                      <span>{premium.commissionPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Commission Amount</span>
                      <span>RM {premium.commissionAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed">
                      Commission is paid by the insurer to the intermediary. No additional charges are imposed on you.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-2xl text-primary">
                    RM {premium.premiumDueRounded.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CenteredLayout>
    </PageLayout>
  );
}
