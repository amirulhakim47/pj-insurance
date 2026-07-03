'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, CenteredLayout, StepIndicator } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { InsuranceFormData } from '@/types';
import type { QuotationResponse, VehicleDetailsResponse } from '@/types/allianz';
import { ShieldCheck, ArrowLeft, Lock, AlertCircle, FileText, ExternalLink, Car, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SENANGPAY_CONFIG, generateSenangPayHash } from '@/lib/senangpay';

const STEPS = ['Vehicle Details', 'Quotation', 'Customer Info', 'Review & Pay'];

interface CustomerDetails {
  fullName: string;
  identityType: string;
  identityNumber: string;
  email: string;
  mobilePrefix: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  postcode: string;
  city?: string;
  state?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [quotation, setQuotation] = React.useState<QuotationResponse | null>(null);
  const [vehicleDetails, setVehicleDetails] = React.useState<VehicleDetailsResponse | null>(null);
  const [formData, setFormData] = React.useState<InsuranceFormData | null>(null);
  const [customerDetails, setCustomerDetails] = React.useState<CustomerDetails | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pdsAcknowledged, setPdsAcknowledged] = React.useState(false);
  const [marketingConsent, setMarketingConsent] = React.useState(false);
  const [selectedAddons, setSelectedAddons] = React.useState<string[]>([]);
  const [driverPlanCost, setDriverPlanCost] = React.useState(0);

  React.useEffect(() => {
    const storedQuotation = sessionStorage.getItem('allianz_quotation');
    const storedVehicle = sessionStorage.getItem('allianz_vehicleDetails');
    const storedFormData = sessionStorage.getItem('insuranceFormData');
    const storedCustomer = sessionStorage.getItem('allianz_customerDetails');
    const storedAddons = sessionStorage.getItem('allianz_selectedAddons');
    const storedDriverCost = sessionStorage.getItem('allianz_driverPlanCost');

    if (!storedQuotation || !storedFormData) { router.push('/results'); return; }

    try {
      setQuotation(JSON.parse(storedQuotation));
      setFormData(JSON.parse(storedFormData));
      if (storedVehicle) setVehicleDetails(JSON.parse(storedVehicle));
      if (storedCustomer) setCustomerDetails(JSON.parse(storedCustomer));
      if (storedAddons) setSelectedAddons(JSON.parse(storedAddons));
      if (storedDriverCost) setDriverPlanCost(parseFloat(storedDriverCost));
    } catch { router.push('/results'); }
  }, [router]);

  const selectedAddonCovers = React.useMemo(() => {
    if (!quotation) return [];
    return quotation.additionalCover.filter((c) => selectedAddons.includes(c.coverCode));
  }, [quotation, selectedAddons]);

  const addonsTotal = React.useMemo(() => {
    return selectedAddonCovers.reduce((sum, c) => sum + c.displayPremium, 0) + driverPlanCost;
  }, [selectedAddonCovers, driverPlanCost]);

  const grandTotal = React.useMemo(() => {
    if (!quotation) return 0;
    return quotation.premium.premiumDueRounded + addonsTotal;
  }, [quotation, addonsTotal]);

  const handlePayment = async () => {
    if (!quotation || !formData || !pdsAcknowledged) return;
    setIsProcessing(true);
    setError(null);
    sessionStorage.setItem('allianz_marketingConsent', marketingConsent ? 'Y' : 'N');

    try {
      const orderId = `ORDER-${quotation.contract.contractNumber}-${Date.now()}`;
      const formattedAmount = grandTotal.toFixed(2);
      const detail = `Motor_Insurance_${quotation.contract.contractNumber}`;
      const hash = await generateSenangPayHash(detail, formattedAmount, orderId);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = SENANGPAY_CONFIG.url;

      const name = customerDetails?.fullName || formData.fullName;
      const email = customerDetails?.email || formData.email;
      const phone = customerDetails ? `${customerDetails.mobilePrefix}${customerDetails.mobileNumber}` : formData.phoneNumber;

      const fields: Record<string, string> = { detail, amount: formattedAmount, order_id: orderId, hash, name, email, phone };
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = key; input.value = value;
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
        <StepIndicator steps={STEPS} currentStep={3} />

        <div className="text-center mb-8 space-y-3">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">Review and Pay</h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-lg mx-auto">Please review your details and total amount due before proceeding to payment.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left — Customer & Vehicle Details */}
          <div className="space-y-5 md:order-1">
            {/* Policyholder */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="flex items-center text-sm font-semibold"><User className="w-4 h-4 mr-2 text-primary" />Primary Policy Holder</CardTitle></CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name As Per ID</span><span className="font-medium">{customerDetails?.fullName || formData.fullName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Mobile No</span><span className="font-medium">{customerDetails ? `${customerDetails.mobilePrefix.replace('60', '+60')} ${customerDetails.mobileNumber}` : formData.phoneNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email Address</span><span className="font-medium text-xs">{customerDetails?.email || formData.email}</span></div>
                {customerDetails?.addressLine1 && <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="font-medium text-right text-xs max-w-[200px]">{[customerDetails.addressLine1, customerDetails.addressLine2, customerDetails.addressLine3, customerDetails.postcode].filter(Boolean).join(', ')}</span></div>}
              </CardContent>
            </Card>

            {/* Vehicle */}
            {vehicleDetails && (
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="flex items-center text-sm font-semibold"><Car className="w-4 h-4 mr-2 text-primary" />Vehicle Details</CardTitle></CardHeader>
                <CardContent className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Vehicle No</span><span className="font-medium">{vehicleDetails.vehicleLicenseId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vehicle Maker</span><span className="font-medium">{vehicleDetails.vehicleMake}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vehicle Model</span><span className="font-medium">{vehicleDetails.vehicleModelDesc || vehicleDetails.vehicleModel}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Engine CC</span><span className="font-medium">{vehicleDetails.vehicleEngineCC} CC</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Policy Start Date</span><span className="font-medium">{vehicleDetails.polEffectiveDate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Policy End Date</span><span className="font-medium">{vehicleDetails.polExpiryDate}</span></div>
                </CardContent>
              </Card>
            )}

            {/* Payment Action */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Secure payment</CardTitle>
                <CardDescription>You&apos;ll be redirected to SenangPay to complete your purchase.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div><h4 className="text-sm font-semibold text-blue-900">Encrypted and secure</h4><p className="text-xs text-blue-700 mt-0.5 leading-relaxed">Your payment is processed securely by SenangPay. We never store card details.</p></div>
                  </div>
                </div>

                {/* PDS & PDPA Acknowledgment */}
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <label htmlFor="pds-acknowledgment" className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" id="pds-acknowledgment" checked={pdsAcknowledged} onChange={(e) => setPdsAcknowledged(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I confirm that I have read and understood the{' '}
                      <a href="/docs/allianz-motor-pds.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">Product Disclosure Sheet <ExternalLink className="w-2.5 h-2.5" /></a>,{' '}
                      <a href="https://www.allianz.com.my/motor-comprehensive-insurance" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">Policy Wording <ExternalLink className="w-2.5 h-2.5" /></a>{' '}&amp;{' '}
                      <a href="https://www.allianz.com.my/privacy-statement" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">Privacy Notice <ExternalLink className="w-2.5 h-2.5" /></a>{' '}and agree to the processing of my personal data.
                    </span>
                  </label>

                  <label htmlFor="marketing-consent" className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" id="marketing-consent" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                    <span className="text-xs text-muted-foreground leading-relaxed">I consent to Allianz disclosing my details to the Allianz Malaysia Berhad group for marketing purposes. <span className="italic">(Optional)</span></span>
                  </label>

                  {!pdsAcknowledged && <p className="text-xs text-amber-600 flex items-center gap-1.5"><FileText className="w-3 h-3" />Please acknowledge the Product Disclosure Sheet to proceed.</p>}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button onClick={handlePayment} className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300" disabled={isProcessing || !pdsAcknowledged}>
                  {isProcessing ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Redirecting...</span></div> : <><Lock className="w-4 h-4 mr-2" />Pay RM {grandTotal.toFixed(2)}</>}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => router.back()} disabled={isProcessing}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right — Order Summary */}
          <div className="md:order-2">
            <Card className="bg-gradient-to-b from-muted/10 to-muted/30 border-border/30 shadow-sm sticky top-24">
              <CardHeader><CardTitle className="font-serif text-lg">My Motor Insurance Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="pb-4 border-b border-border/40">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Plan</span><span className="font-medium">Motor Comprehensive Insurance</span></div>
                  {vehicleDetails && <>
                    <div className="flex justify-between text-sm mt-1.5"><span className="text-muted-foreground">Vehicle No</span><span className="font-medium">{vehicleDetails.vehicleLicenseId}</span></div>
                    <div className="flex justify-between text-sm mt-1.5"><span className="text-muted-foreground">Vehicle</span><span className="font-medium">{vehicleDetails.vehicleMake} {vehicleDetails.vehicleModelDesc || vehicleDetails.vehicleModel}</span></div>
                  </>}
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Premium</p>
                  <div className="flex justify-between"><span className="text-muted-foreground">Basic Premium</span><span>RM {premium.basicPremium.toFixed(2)}</span></div>
                  <div className="flex justify-between text-green-600"><span>Less NCD ({premium.ncdPct}%)</span><span>[RM {premium.ncdAmt.toFixed(2)}]</span></div>

                  {/* Selected Add-ons */}
                  {(selectedAddonCovers.length > 0 || driverPlanCost > 0) && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Additional Coverage</p>
                      {selectedAddonCovers.map((cover) => (
                        <div key={cover.coverCode} className="flex justify-between"><span className="text-muted-foreground">{cover.coverName}</span><span>RM {cover.displayPremium.toFixed(2)}</span></div>
                      ))}
                      {driverPlanCost > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Additional Drivers</span><span>RM {driverPlanCost.toFixed(2)}</span></div>}
                    </>
                  )}

                  <div className="flex justify-between pt-1"><span className="text-muted-foreground">Service Tax ({premium.serviceTaxPercentage}%)</span><span>RM {premium.serviceTaxAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Stamp Duty</span><span>RM {premium.stampDuty.toFixed(2)}</span></div>

                  {/* Commission Disclosure */}
                  <div className="pt-3 mt-3 border-t border-dashed border-border/40 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Commission Disclosure</p>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Commission Rate</span><span>{premium.commissionPercentage}%</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Commission Amount</span><span>RM {premium.commissionAmount.toFixed(2)}</span></div>
                    <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed">Commission is paid by the insurer to the intermediary. No additional charges are imposed on you.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <div className="flex justify-between items-center"><span className="font-bold">Premium Payable</span><span className="font-serif font-bold text-2xl text-primary">RM {grandTotal.toFixed(2)}</span></div>
                </div>

                <p className="text-[11px] text-muted-foreground italic">* Excess of RM {premium.excessAmount.toFixed(0)} is applicable</p>
                <p className="text-[11px] text-muted-foreground italic">* {premium.commissionPercentage}% of Commission amounting to RM {premium.commissionAmount.toFixed(2)} is payable to Allianz Contact Centre</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CenteredLayout>
    </PageLayout>
  );
}
