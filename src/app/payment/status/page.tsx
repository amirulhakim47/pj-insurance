'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout, CenteredLayout } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Home, RefreshCcw } from 'lucide-react';

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    const status_id = searchParams.get('status_id');
    const msg = searchParams.get('msg');
    const transaction_id = searchParams.get('transaction_id');
    const order_id = searchParams.get('order_id');
    const hash = searchParams.get('hash');

    if (!status_id || !hash) {
      setStatus('failed');
      setMessage('Invalid payment response.');
      return;
    }

    // Verify hash via API
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status_id,
            order_id,
            transaction_id,
            msg,
            hash
          }),
        });

        const data = await response.json();

        if (data.isValid) {
          if (status_id === '1') {
            setStatus('success');
            // Redirect to thank you page after a short delay
            setTimeout(() => {
                router.push('/thank-you');
            }, 1500);
          } else {
            setStatus('failed');
            setMessage(msg ? msg.replace(/_/g, ' ') : 'Payment failed');
          }
        } else {
          setStatus('failed');
          setMessage('Security verification failed. Data may be tampered.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
        setMessage('Error verifying payment status.');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <CenteredLayout maxWidth="max-w-md">
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <h2 className="text-xl font-semibold">Verifying Payment...</h2>
              <p className="text-muted-foreground text-center">Please do not close this window.</p>
          </div>
      </CenteredLayout>
    );
  }

  if (status === 'success') {
    return (
      <CenteredLayout maxWidth="max-w-md">
           <div className="flex flex-col items-center justify-center space-y-4 p-8">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
              <p className="text-center text-muted-foreground">Redirecting you to confirmation page...</p>
          </div>
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout maxWidth="max-w-lg">
      <Card className="border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg font-medium">{message}</p>
          <p className="text-sm text-muted-foreground">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
              className="w-full" 
              onClick={() => router.push('/payment')}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </CenteredLayout>
  );
}

export default function PaymentStatusPage() {
  return (
    <PageLayout>
      <Suspense fallback={
        <CenteredLayout maxWidth="max-w-md">
            <div className="flex flex-col items-center justify-center space-y-4 p-8">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <h2 className="text-xl font-semibold">Loading...</h2>
            </div>
        </CenteredLayout>
      }>
        <PaymentStatusContent />
      </Suspense>
    </PageLayout>
  );
}
