'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, CenteredLayout, StepIndicator } from '@/components/ui/layout';
import { InsuranceLoading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { loadingMessages } from '@/data/sampleData';
import { getVehicleDetails } from '@/lib/allianz-api';
import type { InsuranceFormData } from '@/types';
import type { IdentityType, ApiErrorResponse } from '@/types/allianz';
import { UBB_REFER_MESSAGES } from '@/types/allianz';
import { AlertTriangle, XCircle, ArrowLeft } from 'lucide-react';

const steps = ['Details', 'Loading', 'Results'];

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = React.useState(0);
  const [messageIndex, setMessageIndex] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [errorDetails, setErrorDetails] = React.useState<{
    ubbReferCodes?: string[];
    policyExpiryDate?: string;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const raw = sessionStorage.getItem('insuranceFormData');
    if (!raw) {
      router.push('/');
      return;
    }

    let formData: InsuranceFormData;
    try {
      formData = JSON.parse(raw);
    } catch {
      router.push('/');
      return;
    }

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1000);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 3;
      });
    }, 100);

    const fetchVehicleDetails = async () => {
      if (cancelled) return;
      try {
        const result = await getVehicleDetails({
          plateNumber: formData.plateNumber,
          identityNumber: formData.nric.replace(/-/g, ''),
          identityType: (formData.identityType as IdentityType) || 'NRIC',
          postalCode: formData.postcode,
        });

        if (cancelled) return;

        sessionStorage.setItem('allianz_vehicleDetails', JSON.stringify(result));

        let noOfClaims = '0';
        if (result.ismSrespCode && result.ismSrespValue) {
          const codes = result.ismSrespCode.split(',').map((s: string) => s.trim());
          const values = result.ismSrespValue.split(',').map((s: string) => s.trim());
          const e012Index = codes.indexOf('E012');
          if (e012Index !== -1 && values[e012Index]) {
            noOfClaims = values[e012Index];
          }
        }
        sessionStorage.setItem('allianz_noOfClaims', noOfClaims);

        if (parseInt(noOfClaims, 10) >= 2) {
          setError('Your claims history exceeds the limit for online processing. Please contact an agent for assistance.');
          setErrorDetails({ ubbReferCodes: ['UBBE004'] });
          setProgress(100);
          return;
        }

        setProgress(100);
        setTimeout(() => {
          router.push('/results');
        }, 400);
      } catch (err: unknown) {
        if (cancelled) return;
        const apiErr = err as ApiErrorResponse;
        if (apiErr?.code !== 'ALLIANZ_BUSINESS_ERROR' && apiErr?.code !== 'UBB_REFER') {
          console.error('Vehicle details fetch error:', err);
        }

        if (apiErr?.code === 'UBB_REFER' && apiErr.ubbReferCodes?.length) {
          const messages = apiErr.ubbReferCodes
            .map((code) => UBB_REFER_MESSAGES[code])
            .filter(Boolean);
          setError(messages[0] || 'Your application requires further review.');
          setErrorDetails({
            ubbReferCodes: apiErr.ubbReferCodes,
            policyExpiryDate: apiErr.policyExpiryDate,
          });
        } else {
          setError(apiErr?.message || 'Failed to fetch vehicle details. Please try again.');
        }

        setProgress(100);
      }
    };

    fetchVehicleDetails();

    return () => {
      cancelled = true;
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [router]);

  if (error) {
    const isUbbRefer = !!errorDetails?.ubbReferCodes;

    return (
      <PageLayout>
        <CenteredLayout maxWidth="max-w-lg">
          <StepIndicator steps={steps} currentStep={1} />
          <div className="space-y-6 text-center">
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${
              isUbbRefer ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              {isUbbRefer ? (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
                {isUbbRefer ? 'Unable to proceed' : 'Something went wrong'}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
            </div>
            {errorDetails?.policyExpiryDate && (
              <div className="bg-muted/50 rounded-xl p-4 max-w-xs mx-auto">
                <p className="text-xs text-muted-foreground">Policy expiry date</p>
                <p className="text-base font-semibold text-foreground mt-0.5">
                  {errorDetails.policyExpiryDate}
                </p>
              </div>
            )}
            {errorDetails?.ubbReferCodes && errorDetails.ubbReferCodes.length > 1 && (
              <div className="space-y-1.5 max-w-sm mx-auto text-left">
                {errorDetails.ubbReferCodes.slice(1).map((code) => (
                  <p key={code} className="text-xs text-muted-foreground">
                    {UBB_REFER_MESSAGES[code] || code}
                  </p>
                ))}
              </div>
            )}
            <Button onClick={() => router.push('/')} className="h-11">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to form
            </Button>
          </div>
        </CenteredLayout>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <CenteredLayout maxWidth="max-w-lg">
        <StepIndicator steps={steps} currentStep={1} />

        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Finding your best rates
            </h1>
            <p className="text-sm text-muted-foreground">
              Fetching vehicle details and comparing policies.
            </p>
          </div>

          <InsuranceLoading
            progress={progress}
            message={loadingMessages[messageIndex]}
          />

          <div className="text-center">
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>Secure processing</span>
              <span className="text-border">|</span>
              <span>Real-time data</span>
              <span className="text-border">|</span>
              <span>Best rates</span>
            </div>
          </div>
        </div>
      </CenteredLayout>
    </PageLayout>
  );
}
