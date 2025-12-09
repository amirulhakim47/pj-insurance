'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Check } from 'lucide-react';

interface PDPAConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  className?: string;
}

export function PDPAConsent({
  checked,
  onChange,
  error,
  className,
}: PDPAConsentProps) {
  const consentText =
    'I consent to the processing of my personal data under the Personal Data Protection Act 2010 (PDPA), and agree to be contacted via WhatsApp, SMS, Email, or Phone for insurance quotation, renewal reminders, policy updates, and related services.';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
        <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            id="pdpa-consent"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className={cn(
              'peer h-5 w-5 shrink-0 rounded border-2 bg-background',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-destructive' : 'border-foreground/30',
              'appearance-none cursor-pointer',
              'checked:bg-primary checked:border-primary',
              'hover:border-primary/50 transition-all duration-200 shadow-sm'
            )}
            aria-invalid={!!error}
            aria-describedby={error ? 'pdpa-consent-error' : undefined}
          />
          {checked && (
            <Check className="absolute h-3.5 w-3.5 text-primary-foreground pointer-events-none" />
          )}
        </div>
        <label
          htmlFor="pdpa-consent"
          className={cn(
            'text-sm leading-relaxed cursor-pointer select-none flex-1',
            error && 'text-destructive'
          )}
        >
          <span className="font-medium">
            {consentText}{' '}
            <Link
              href="/pdpa-policy"
              className="text-primary hover:underline font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              Read our PDPA policy *
            </Link>
          </span>
        </label>
      </div>
      {error && (
        <p
          id="pdpa-consent-error"
          className="text-sm text-destructive font-medium pl-8"
        >
          {error}
        </p>
      )}
    </div>
  );
}

