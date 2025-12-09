'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Shield, Lock, CheckCircle, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function DataProtectionCard({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const securityFeatures = [
    {
      icon: Lock,
      title: '256-bit SSL Encryption',
      description:
        '256-bit SSL Encryption is the highest level of security used by banks and financial institutions. It means all data you submit (personal details, IC numbers, vehicle information) is scrambled into an unreadable format during transmission. Even if intercepted, your information remains completely secure and private.',
      color: 'text-blue-600',
    },
    {
      icon: Shield,
      title: 'PDPA Compliance',
      description:
        'We strictly comply with Malaysia\'s Personal Data Protection Act (PDPA). Your personal information is only used for insurance quotation purposes and never shared with third parties without your consent.',
      color: 'text-blue-600',
    },
    {
      icon: CheckCircle,
      title: 'Secure Data Storage',
      description:
        'Your data is stored in secure, encrypted databases with multiple layers of protection. We use industry-leading security practices to ensure your information stays safe 24/7.',
      color: 'text-green-600',
    },
    {
      icon: Lock,
      title: 'Licensed & Registered Company',
      description:
        'We are a licensed and registered insurance intermediary operating under the regulations of Bank Negara Malaysia. Your trust and data security are our top priorities.',
      color: 'text-blue-600',
    },
  ];

  return (
    <Card className={cn('border border-border shadow-sm', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Your Data is Protected
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-colors"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            <span>Learn More</span>
            <ChevronUp
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isExpanded ? 'rotate-0' : 'rotate-180'
              )}
            />
          </button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          {/* Summary List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start space-x-2 text-sm"
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 mt-0.5 flex-shrink-0',
                      feature.color
                    )}
                  />
                  <span className="font-medium text-foreground">
                    {feature.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detailed Explanations */}
          <div className="space-y-4 pt-4 border-t border-border">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        feature.color
                      )}
                    />
                    <h4 className="font-semibold text-foreground">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-sm text-muted-foreground">
            <Link
              href="/pdpa-policy"
              className="text-primary hover:underline font-medium"
            >
              Read our full PDPA policy →
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

