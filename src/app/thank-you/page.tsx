'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, CenteredLayout } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home, Info, ExternalLink, Shield } from 'lucide-react';
import type { QuotationResponse, VehicleDetailsResponse } from '@/types/allianz';
import type { InsuranceFormData } from '@/types';

export default function ThankYouPage() {
  const router = useRouter();
  const [quotation, setQuotation] = React.useState<QuotationResponse | null>(null);
  const [vehicleDetails, setVehicleDetails] = React.useState<VehicleDetailsResponse | null>(null);
  const [formData, setFormData] = React.useState<InsuranceFormData | null>(null);
  const [selectedAddons, setSelectedAddons] = React.useState<string[]>([]);
  const [driverPlanCost, setDriverPlanCost] = React.useState(0);

  React.useEffect(() => {
    const storedQuotation = sessionStorage.getItem('allianz_quotation');
    const storedVehicle = sessionStorage.getItem('allianz_vehicleDetails');
    const storedForm = sessionStorage.getItem('insuranceFormData');
    const storedAddons = sessionStorage.getItem('allianz_selectedAddons');
    const storedDriverCost = sessionStorage.getItem('allianz_driverPlanCost');

    if (storedQuotation) setQuotation(JSON.parse(storedQuotation));
    if (storedVehicle) setVehicleDetails(JSON.parse(storedVehicle));
    if (storedForm) setFormData(JSON.parse(storedForm));
    if (storedAddons) setSelectedAddons(JSON.parse(storedAddons));
    if (storedDriverCost) setDriverPlanCost(parseFloat(storedDriverCost));
  }, []);

  const addonsTotal = React.useMemo(() => {
    if (!quotation) return 0;
    return quotation.additionalCover
      .filter((c) => selectedAddons.includes(c.coverCode))
      .reduce((sum, c) => sum + c.displayPremium, 0) + driverPlanCost;
  }, [quotation, selectedAddons, driverPlanCost]);

  const grandTotal = React.useMemo(() => {
    if (!quotation) return 0;
    return quotation.premium.premiumDueRounded + addonsTotal;
  }, [quotation, addonsTotal]);

  const handleDownload = (type: 'policy' | 'receipt') => {
    const contractNumber = quotation?.contract?.contractNumber || 'unknown';
    const blob = new Blob([
      type === 'policy'
        ? `Allianz Motor Insurance Policy Schedule\nContract: ${contractNumber}\nVehicle: ${vehicleDetails?.vehicleLicenseId || ''}\nTotal Premium: RM ${grandTotal.toFixed(2)}\n\nYour e-policy will be emailed to you within 24 hours. If you do not receive it, please contact 1-300-22-5542.`
        : `Payment Receipt\nContract: ${contractNumber}\nAmount: RM ${grandTotal.toFixed(2)}\nDate: ${new Date().toLocaleDateString('en-GB')}\n\nThank you for choosing Allianz.`,
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'policy' ? `Policy_${contractNumber}.txt` : `Receipt_${contractNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout>
      <CenteredLayout maxWidth="max-w-lg">
        <div className="text-center mb-10">
          <div className="w-18 h-18 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100/50" style={{ width: '4.5rem', height: '4.5rem' }}>
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">Payment successful</h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md mx-auto">
            Your policy has been renewed. A confirmation email with your e-Policy and Payment Acknowledgement will be sent to{' '}
            <span className="font-medium text-foreground">{formData?.email || 'your registered email'}</span>.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-3">Your policy is encrypted with the last 6 digits of your NRIC/Old IC/Passport No. as password to view the policy.</p>
        </div>

        <Card className="border-border/40 shadow-sm">
          <CardHeader><CardTitle className="font-serif text-base">Policy summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {quotation && (
              <div className="p-5 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl space-y-2.5 text-sm border border-border/30">
                <div className="flex justify-between"><span className="text-muted-foreground">Insurer</span><span className="font-medium">Allianz General Insurance</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Contract No.</span><span className="font-medium font-mono text-xs">{quotation.contract.contractNumber}</span></div>
                {vehicleDetails && (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">Vehicle</span><span className="font-medium">{vehicleDetails.vehicleLicenseId}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Coverage Period</span><span className="font-medium text-xs">{vehicleDetails.polEffectiveDate} to {vehicleDetails.polExpiryDate}</span></div>
                  </>
                )}
                <div className="flex justify-between pt-3 border-t border-border/40"><span className="text-muted-foreground">Total Paid</span><span className="font-serif font-bold text-lg text-primary">RM {grandTotal.toFixed(2)}</span></div>
              </div>
            )}

            {/* Free Look Period */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Free look period</h4>
                  <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">You may cancel within 15 days for a full premium refund, provided no claim has been made.</p>
                </div>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">Refund policy</h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Refunds upon cancellation are pro-rata if insured continuously for more than 12 months, or at short period rates otherwise. See the{' '}
                    <a href="https://www.allianz.com.my/motor-comprehensive-insurance" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline hover:text-amber-900 inline-flex items-center gap-0.5">Policy Wording <ExternalLink className="w-2.5 h-2.5" /></a>.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <Button variant="outline" className="w-full justify-start h-11 text-sm border-border/40 hover:border-primary/30 transition-all duration-300" onClick={() => handleDownload('policy')}>
                <Download className="w-4 h-4 mr-3 text-primary" />Download Policy Summary
              </Button>
              <Button variant="outline" className="w-full justify-start h-11 text-sm border-border/40 hover:border-primary/30 transition-all duration-300" onClick={() => handleDownload('receipt')}>
                <Download className="w-4 h-4 mr-3 text-primary" />Download Receipt
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Your full e-Policy (PDF) will be emailed to you within 24 hours. For any inquiries, call 1-300-22-5542 or email{' '}
              <a href="mailto:customer.service@allianz.com.my" className="text-primary hover:underline">customer.service@allianz.com.my</a>.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300" onClick={() => { sessionStorage.clear(); router.push('/'); }}>
              <Home className="w-4 h-4 mr-2" />Return to home
            </Button>
          </CardFooter>
        </Card>
      </CenteredLayout>
    </PageLayout>
  );
}
