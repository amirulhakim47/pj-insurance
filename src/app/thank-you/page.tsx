'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, CenteredLayout } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home } from 'lucide-react';
import { InsurancePolicy } from '@/types';

export default function ThankYouPage() {
  const router = useRouter();
  const [policy, setPolicy] = React.useState<InsurancePolicy | null>(null);

  React.useEffect(() => {
    const storedPolicy = sessionStorage.getItem('selectedPolicy');
    if (storedPolicy) {
      setPolicy(JSON.parse(storedPolicy));
      // Optional: Clear session storage here if you want to reset the flow
      // sessionStorage.clear(); 
    }
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
            Your insurance policy has been successfully renewed. A confirmation email has been sent to you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Policy Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {policy && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <span className="font-medium">{policy.provider.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Policy ID</span>
                    <span className="font-medium font-mono text-xs">POL-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Paid</span>
                  <span className="font-bold text-primary">RM{(policy.finalPrice * 1.06 + 10).toFixed(2)}</span>
                </div>
              </div>
            )}
            
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

