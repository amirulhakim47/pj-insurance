'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout, CenteredLayout } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Home, RefreshCcw } from 'lucide-react';
import { verifySenangPayHash } from '@/lib/senangpay';
import { verifyStripeCheckoutSession } from '@/lib/stripe-checkout';
import { submitAllianzAfterPayment } from '@/lib/payment-after-success';

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<'loading' | 'submitting' | 'success' | 'failed'>('loading');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    const provider = searchParams.get('provider');
    const sessionId = searchParams.get('session_id');

    const runAfterVerified = async (paymentOrderId: string, transactionId: string, paymentMode: string) => {
      setStatus('submitting');
      try {
        await submitAllianzAfterPayment(paymentOrderId, transactionId, paymentMode);
      } catch (submissionErr) {
        console.error('Allianz submission error (non-blocking):', submissionErr);
      }
      setStatus('success');
      setTimeout(() => router.push('/thank-you'), 1500);
    };

    const verifyAndSubmit = async () => {
      try {
        if (provider === 'stripe') {
          if (!sessionId) {
            setStatus('failed');
            setMessage('Invalid Stripe return — missing session.');
            return;
          }

          const verification = await verifyStripeCheckoutSession(sessionId);
          if (!verification.valid) {
            setStatus('failed');
            setMessage(verification.message || 'Stripe payment verification failed.');
            return;
          }
          if (verification.policyAccessToken) {
            sessionStorage.setItem('policyAccessToken', verification.policyAccessToken);
          }

          const orderId = verification.order_id || '';
          const transactionId = verification.transaction_id || sessionId;

          const quotationRaw = sessionStorage.getItem('allianz_quotation');
          const formDataRaw = sessionStorage.getItem('insuranceFormData');
          if (!formDataRaw || !quotationRaw) {
            setStatus('success');
            setTimeout(() => router.push('/thank-you'), 1500);
            return;
          }

          await runAfterVerified(orderId, transactionId, 'STRIPE_UAT');
          return;
        }

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

        const verification = await verifySenangPayHash(
          status_id,
          order_id || '',
          transaction_id || '',
          msg || '',
          hash,
        );
        if (!verification.valid) {
          setStatus('failed');
          setMessage('Security verification failed. Data may be tampered.');
          return;
        }
        if (verification.policyAccessToken) {
          sessionStorage.setItem('policyAccessToken', verification.policyAccessToken);
        }
        if (status_id !== '1') {
          setStatus('failed');
          setMessage(msg ? msg.replace(/_/g, ' ') : 'Payment failed');
          return;
        }

        const quotationRaw = sessionStorage.getItem('allianz_quotation');
        const formDataRaw = sessionStorage.getItem('insuranceFormData');
        if (!formDataRaw || !quotationRaw) {
          setStatus('success');
          setTimeout(() => router.push('/thank-you'), 1500);
          return;
        }

        await runAfterVerified(order_id || '', transaction_id || '', 'ONLCCN');
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
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-red-100/50">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="font-serif text-xl text-red-600">Payment failed</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-sm font-medium">{message}</p>
          <p className="text-xs text-muted-foreground">Please try again or use a different payment method.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full h-11" onClick={() => router.push('/payment')}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button variant="outline" className="w-full h-11" onClick={() => router.push('/')}>
            <Home className="w-4 h-4 mr-2" />
            Return home
          </Button>
        </CardFooter>
      </Card>
    </CenteredLayout>
  );
}

export default function PaymentStatusPage() {
  return (
    <PageLayout>
      <Suspense
        fallback={
          <CenteredLayout maxWidth="max-w-md">
            <div className="flex flex-col items-center justify-center space-y-4 p-8">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <h2 className="text-lg font-semibold">Loading...</h2>
            </div>
          </CenteredLayout>
        }
      >
        <PaymentStatusContent />
      </Suspense>
    </PageLayout>
  );
}
