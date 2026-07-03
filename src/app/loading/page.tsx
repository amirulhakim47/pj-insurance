'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, CenteredLayout, StepIndicator } from '@/components/ui/layout';
import { InsuranceLoading } from '@/components/ui/loading';
import { loadingMessages } from '@/data/sampleData';
import { getVehicleDetails } from '@/lib/allianz-api';
import type { InsuranceFormData } from '@/types';
import type { IdentityType, ApiErrorResponse } from '@/types/allianz';
import { UBB_REFER_MESSAGES } from '@/types/allianz';

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

        // Parse claims experience from ismSrespCode E012
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

        // Block if claims >= 2
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
    return (
      <PageLayout>
        <CenteredLayout maxWidth="max-w-lg">
          <StepIndicator steps={steps} currentStep={1} />
          <div className="space-y-6 text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              errorDetails?.ubbReferCodes ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              <span className="text-2xl">{errorDetails?.ubbReferCodes ? '\u26A0' : '!'}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {errorDetails?.ubbReferCodes ? 'Unable to Proceed' : 'Something Went Wrong'}
            </h1>
            <p className="text-muted-foreground">{error}</p>
            {errorDetails?.policyExpiryDate && (
              <div className="bg-muted/50 rounded-lg p-4 max-w-sm mx-auto">
                <p className="text-sm text-muted-foreground">
                  Policy expiry date
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {errorDetails.policyExpiryDate}
                </p>
              </div>
            )}
            {errorDetails?.ubbReferCodes && errorDetails.ubbReferCodes.length > 1 && (
              <div className="space-y-2 max-w-sm mx-auto text-left">
                {errorDetails.ubbReferCodes.slice(1).map((code) => (
                  <p key={code} className="text-sm text-muted-foreground">
                    {UBB_REFER_MESSAGES[code] || code}
                  </p>
                ))}
              </div>
            )}
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Form
            </button>
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
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Finding Your Best Deals
            </h1>
            <p className="text-lg text-muted-foreground">
              We&apos;re fetching your vehicle details and comparing policies to get you the best rates.
            </p>
          </div>

          <InsuranceLoading
            progress={progress}
            message={loadingMessages[messageIndex]}
          />

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This may take a few moments...
            </p>
            <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
              <span>Secure Processing</span>
              <span>Real-time Data</span>
              <span>Best Rates</span>
            </div>
          </div>
        </div>
      </CenteredLayout>
    </PageLayout>
  );
}
