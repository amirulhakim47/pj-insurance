'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, CenteredLayout, StepIndicator } from '@/components/ui/layout';
import { InsuranceLoading } from '@/components/ui/loading';
import { loadingMessages } from '@/data/sampleData';

const steps = ['Details', 'Loading', 'Results'];

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = React.useState(0);
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    // Check if form data exists
    const formData = sessionStorage.getItem('insuranceFormData');
    if (!formData) {
      router.push('/');
      return;
    }

    // Progress animation over 1.5 seconds (simulating faster "first byte" response)
    const duration = 1500; // 1.5 seconds
    const interval = 50; // Update every 50ms
    const increment = 100 / (duration / interval);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(progressTimer);
          // Navigate to results page after completion
          setTimeout(() => {
            router.push('/results');
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    // Message rotation
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [router]);

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
              We're comparing policies from top insurance providers to get you the best rates.
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
              <span>✓ Secure Processing</span>
              <span>✓ Real-time Comparison</span>
              <span>✓ Best Rates Guaranteed</span>
            </div>
          </div>
        </div>
      </CenteredLayout>
    </PageLayout>
  );
}
