import { Suspense } from 'react';
import InsuranceForm from '@/components/InsuranceForm';

export default function QuotePage() {
  return (
    <Suspense>
      <InsuranceForm />
    </Suspense>
  );
}

