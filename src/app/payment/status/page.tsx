'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout, CenteredLayout } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Home, RefreshCcw } from 'lucide-react';
import { verifySenangPayHash } from '@/lib/senangpay';
import { submitTransaction } from '@/lib/allianz-api';
import type { InsuranceFormData } from '@/types';
import type { QuotationResponse, VehicleDetailsResponse, NvicItem, IdentityType, Gender } from '@/types/allianz';

function extractGenderFromNRIC(nric: string): Gender {
  const digits = nric.replace(/-/g, '');
  const lastDigit = parseInt(digits[digits.length - 1], 10);
  return lastDigit % 2 === 0 ? 'F' : 'M';
}

function extractBirthDateFromNRIC(nric: string): string {
  const digits = nric.replace(/-/g, '');
  const yy = digits.substring(0, 2);
  const mm = digits.substring(2, 4);
  const dd = digits.substring(4, 6);
  const year = parseInt(yy, 10) > 30 ? `19${yy}` : `20${yy}`;
  return `${year}-${mm}-${dd}`;
}

async function submitWithRetry(params: Parameters<typeof submitTransaction>[0], maxRetries = 3): Promise<{ Status: string }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await submitTransaction(params);
    } catch (err: unknown) {
      const apiErr = err as { status?: number };
      if (apiErr?.status === 500 && attempt < maxRetries) {
        const delay = Math.min(2000 * Math.pow(2, attempt), 15000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<'loading' | 'submitting' | 'success' | 'failed'>('loading');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    const status_id = searchParams.get('status_id');
    const msg = searchParams.get('msg');
    const transaction_id = searchParams.get('transaction_id');
    const order_id = searchParams.get('order_id');
    const hash = searchParams.get('hash');

    if (!status_id || !hash) { setStatus('failed'); setMessage('Invalid payment response.'); return; }

    const verifyAndSubmit = async () => {
      try {
        const isValid = await verifySenangPayHash(status_id, order_id || '', transaction_id || '', msg || '', hash);
        if (!isValid) { setStatus('failed'); setMessage('Security verification failed. Data may be tampered.'); return; }
        if (status_id !== '1') { setStatus('failed'); setMessage(msg ? msg.replace(/_/g, ' ') : 'Payment failed'); return; }

        setStatus('submitting');

        const formDataRaw = sessionStorage.getItem('insuranceFormData');
        const quotationRaw = sessionStorage.getItem('allianz_quotation');
        const vehicleRaw = sessionStorage.getItem('allianz_vehicleDetails');
        const nvicRaw = sessionStorage.getItem('allianz_selectedNvic');

        if (!formDataRaw || !quotationRaw) { setStatus('success'); setTimeout(() => router.push('/thank-you'), 1500); return; }

        const formData: InsuranceFormData = JSON.parse(formDataRaw);
        const quotation: QuotationResponse = JSON.parse(quotationRaw);
        const vehicleDetails: VehicleDetailsResponse | null = vehicleRaw ? JSON.parse(vehicleRaw) : null;
        const selectedNvic: NvicItem | null = nvicRaw ? JSON.parse(nvicRaw) : null;
        const marketingConsent = sessionStorage.getItem('allianz_marketingConsent') || 'N';
        const customerDetailsRaw = sessionStorage.getItem('allianz_customerDetails');
        const driverPlan = sessionStorage.getItem('allianz_driverPlan') || '0';
        const additionalDriversRaw = sessionStorage.getItem('allianz_additionalDrivers');
        const ehailingDriverRaw = sessionStorage.getItem('allianz_ehailingDriver');
        const selectedAddonsRaw = sessionStorage.getItem('allianz_selectedAddons');
        const driverPlanCostRaw = sessionStorage.getItem('allianz_driverPlanCost');

        let mobilePrefix = '6012';
        let mobile = formData.phoneNumber;
        let fullName = formData.fullName;
        let email = formData.email;
        let postalCode = formData.postcode;
        let addressLine1 = formData.postcode;
        let addressLine2: string | undefined;
        let addressLine3: string | undefined;

        if (customerDetailsRaw) {
          const cd = JSON.parse(customerDetailsRaw);
          mobilePrefix = cd.mobilePrefix || mobilePrefix;
          mobile = cd.mobileNumber || mobile;
          fullName = cd.fullName || fullName;
          email = cd.email || email;
          postalCode = cd.postcode || postalCode;
          addressLine1 = cd.addressLine1 || addressLine1;
          addressLine2 = cd.addressLine2 || undefined;
          addressLine3 = cd.addressLine3 || undefined;
        } else {
          const phoneParts = formData.phoneNumber.match(/^(\+?6?0\d{1,2})(\d{7,8})$/);
          mobilePrefix = phoneParts ? phoneParts[1] : '6012';
          mobile = phoneParts ? phoneParts[2] : formData.phoneNumber;
        }

        const driverDetails: Array<{ fullName: string; identityNumber: string; driverType?: string }> = [];

        if ((driverPlan === '1' || driverPlan === '2') && additionalDriversRaw) {
          const drivers = JSON.parse(additionalDriversRaw);
          drivers.forEach((d: { fullName: string; idNumber: string }) => {
            if (d.fullName && d.idNumber) driverDetails.push({ fullName: d.fullName, identityNumber: d.idNumber });
          });
        }

        if (selectedAddonsRaw) {
          const addons: string[] = JSON.parse(selectedAddonsRaw);
          if (addons.includes('A202') && ehailingDriverRaw) {
            const ehd = JSON.parse(ehailingDriverRaw);
            if (ehd.fullName && ehd.idNumber) driverDetails.push({ fullName: ehd.fullName, identityNumber: ehd.idNumber, driverType: 'EHAIL' });
          }
        }

        const addonsTotal = selectedAddonsRaw
          ? quotation.additionalCover.filter((c) => JSON.parse(selectedAddonsRaw).includes(c.coverCode)).reduce((s, c) => s + c.displayPremium, 0) + parseFloat(driverPlanCostRaw || '0')
          : 0;
        const totalAmount = (quotation.premium.premiumDueRounded + addonsTotal).toFixed(2);

        try {
          await submitWithRetry({
            salesChannel: 'PTR',
            contract: { contractNumber: quotation.contract.contractNumber, emarketingConsentInd: marketingConsent as 'Y' | 'N' },
            person: {
              identityType: (formData.identityType as IdentityType) || 'NRIC',
              identityNumber: formData.nric.replace(/-/g, ''),
              fullName, birthDate: extractBirthDateFromNRIC(formData.nric),
              gender: formData.customerType === 'company' ? 'C' : extractGenderFromNRIC(formData.nric),
              email, postalCode, mobilePrefix, mobile, addressLine1, addressLine2, addressLine3,
            },
            vehicle: {
              nvicCode: selectedNvic?.nvic || '',
              vehicleEngineCC: vehicleDetails?.vehicleEngineCC || '',
              yearOfManufacture: vehicleDetails?.yearOfManufacture || '',
              occupantsNumber: vehicleDetails?.seatingCapacity || 5,
            },
            driverDetails,
            payment: {
              paymentMode: 'ONLCCN', paymentBankRef: transaction_id || '',
              paymentId: transaction_id || '',
              paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
              paymentAmount: totalAmount,
            },
          });
        } catch (submissionErr) {
          console.error('Allianz submission error (non-blocking):', submissionErr);
        }

        setStatus('success');
        setTimeout(() => router.push('/thank-you'), 1500);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
        setMessage('Error verifying payment status.');
      }
    };

    verifyAndSubmit();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <CenteredLayout maxWidth="max-w-md">
        <div className="flex flex-col items-center justify-center space-y-5 p-8">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <h2 className="font-serif text-lg font-semibold">Verifying payment...</h2>
          <p className="text-sm text-muted-foreground text-center">Do not close this window.</p>
        </div>
      </CenteredLayout>
    );
  }

  if (status === 'submitting') {
    return (
      <CenteredLayout maxWidth="max-w-md">
        <div className="flex flex-col items-center justify-center space-y-5 p-8">
          <div className="w-12 h-12 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="font-serif text-lg font-semibold text-green-600">Payment verified</h2>
          <p className="text-sm text-muted-foreground text-center">Submitting your policy to Allianz...</p>
        </div>
      </CenteredLayout>
    );
  }

  if (status === 'success') {
    return (
      <CenteredLayout maxWidth="max-w-md">
        <div className="flex flex-col items-center justify-center space-y-5 p-8">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center shadow-lg shadow-green-100/50">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-serif text-xl font-bold text-green-600">Payment successful</h2>
          <p className="text-sm text-center text-muted-foreground">Redirecting to confirmation...</p>
        </div>
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout maxWidth="max-w-lg">
      <Card className="border-destructive/20 shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-red-100/50"><XCircle className="w-8 h-8 text-red-600" /></div>
          <CardTitle className="font-serif text-xl text-red-600">Payment failed</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-sm font-medium">{message}</p>
          <p className="text-xs text-muted-foreground">Please try again or use a different payment method.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full h-11" onClick={() => router.push('/payment')}><RefreshCcw className="w-4 h-4 mr-2" />Try again</Button>
          <Button variant="outline" className="w-full h-11" onClick={() => router.push('/')}><Home className="w-4 h-4 mr-2" />Return home</Button>
        </CardFooter>
      </Card>
    </CenteredLayout>
  );
}

export default function PaymentStatusPage() {
  return (
    <PageLayout>
      <Suspense fallback={<CenteredLayout maxWidth="max-w-md"><div className="flex flex-col items-center justify-center space-y-4 p-8"><div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" /><h2 className="text-lg font-semibold">Loading...</h2></div></CenteredLayout>}>
        <PaymentStatusContent />
      </Suspense>
    </PageLayout>
  );
}
