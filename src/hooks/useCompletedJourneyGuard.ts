'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getCompletedJourney } from '@/lib/insurance-session';

const THANK_YOU_PATH = '/thank-you';

/**
 * Sends the user to the thank-you page if this session's journey was already paid.
 * Also handles browser Back restoring the page from the back-forward cache, where effects do not re-run.
 */
export function useCompletedJourneyGuard(): boolean {
  const router = useRouter();
  const [locked, setLocked] = React.useState(false);

  React.useEffect(() => {
    const redirectIfCompleted = () => {
      if (getCompletedJourney() === null) return;
      setLocked(true);
      router.replace(THANK_YOU_PATH);
    };

    redirectIfCompleted();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) redirectIfCompleted();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [router]);

  return locked;
}
