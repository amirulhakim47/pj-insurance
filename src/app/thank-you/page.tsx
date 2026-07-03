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

  React.useEffect(() => {
    const storedQuotation = sessionStorage.getItem('allianz_quotation');
    const storedVehicle = sessionStorage.getItem('allianz_vehicleDetails');
    const storedForm = sessionStorage.getItem('insuranceFormData');

    if (storedQuotation) setQuotation(JSON.parse(storedQuotation));
    if (storedVehicle) setVehicleDetails(JSON.parse(storedVehicle));
    if (storedForm) setFormData(JSON.parse(storedForm));
  }, []);

  return (
    <PageLayout>
      <CenteredLayout maxWidth="max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your insurance policy has been successfully renewed. A confirmation email will be sent to{' '}
            {formData?.email || 'your registered email'}.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Policy Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotation && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Insurer</span>
                  <span className="font-medium">Allianz General Insurance</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Contract No.</span>
                  <span className="font-medium font-mono text-xs">{quotation.contract.contractNumber}</span>
                </div>
                {vehicleDetails && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Vehicle</span>
                      <span className="font-medium">{vehicleDetails.vehicleLicenseId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Coverage Period</span>
                      <span className="font-medium text-xs">{vehicleDetails.polEffectiveDate} to {vehicleDetails.polExpiryDate}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Total Paid</span>
                  <span className="font-bold text-primary">RM {quotation.premium.premiumDueRounded.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Free Look Period Disclosure (BNM Requirement) */}
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-blue-900">Free Look Period</h4>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    This product is eligible for free-look for 15 days. You may cancel the policy within this period and are entitled to a full premium refund.
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Policy Statement (BNM Requirement) */}
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-amber-900">Refund Policy</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    You are entitled to a premium refund upon cancellation of the policy, subject to the refund policy as outlined in the Policy Wording. Please refer to the Policy Wording available at{' '}
                    <a
                      href="https://www.allianz.com.my/motor-comprehensive-insurance"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 underline hover:text-amber-900 inline-flex items-center gap-0.5"
                    >
                      Allianz Malaysia <ExternalLink className="w-2.5 h-2.5" />
                    </a>.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button variant="outline" className="w-full justify-start h-12">
                <Download className="w-5 h-5 mr-3" />
                Download Policy Schedule (PDF)
              </Button>
              <Button variant="outline" className="w-full justify-start h-12">
                <Download className="w-5 h-5 mr-3" />
                Download Receipt (PDF)
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => {
                sessionStorage.clear();
                router.push('/');
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </CenteredLayout>
    </PageLayout>
  );
}
