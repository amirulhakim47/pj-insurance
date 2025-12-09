'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InsurancePolicy } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Car, Zap, Hourglass } from 'lucide-react';

interface PolicyCardProps {
  policy: InsurancePolicy;
  isSelected?: boolean;
  onSelect?: (policy: InsurancePolicy) => void;
  className?: string;
}

export function PolicyCard({ policy, isSelected, onSelect, className }: PolicyCardProps) {
  const handleClick = () => {
    if (!policy.loading) {
      onSelect?.(policy);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (policy.loading) {
    return (
      <Card className={cn('h-full flex items-center justify-center bg-blue-50/50 border-2 border-dashed border-blue-200', className)}>
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-3">
           <Hourglass className="w-8 h-8 text-blue-400 animate-pulse" />
           <div className="space-y-1">
             <h3 className="font-semibold text-foreground">Waiting for insurer</h3>
             <p className="text-xs text-muted-foreground">Price will be displayed once ready...</p>
           </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'flex flex-col h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
        'border-2 hover:border-primary/50',
        isSelected && 'border-primary ring-2 ring-primary/20 shadow-lg bg-orange-500/10 hover:bg-orange-500/20',
        policy.isRecommended && 'ring-1 ring-orange-200',
        className
      )}
      onClick={handleClick}
    >
      {policy.isRecommended && (
        <div className="absolute -top-2 left-4 z-10">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
            <Zap className="w-3 h-3 mr-1" />
            Recommended
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Takaful Plan
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Shariah-compliant coverage
            </p>
          </div>
          
          {policy.discountPercentage && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              -{policy.discountPercentage}% OFF
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4">
        {/* Policy Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {policy.description}
        </p>

        {/* Coverage Period */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Coverage Period:</span>
          <span className="font-medium">
            {formatDate(policy.startDate)} - {formatDate(policy.expiryDate)}
          </span>
        </div>

        {/* Key Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Key Features:</h4>
          <div className="grid grid-cols-1 gap-1">
            {policy.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
            {policy.features.length > 3 && (
              <p className="text-xs text-muted-foreground ml-6">
                +{policy.features.length - 3} more features
              </p>
            )}
          </div>
        </div>

        {/* Coverage Icons */}
        <div className="flex items-center space-x-4 pt-2">
          {policy.coverage.comprehensive && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Comprehensive</span>
            </div>
          )}
          {policy.coverage.theft && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Car className="w-4 h-4 text-blue-600" />
              <span>Theft</span>
            </div>
          )}
        </div>

        {/* Pricing - Pushed to bottom with mt-auto */}
        <div className="border-t pt-4 space-y-2 mt-auto">
          {policy.discountPercentage && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Original Price:</span>
              <span className="text-sm line-through text-muted-foreground">
                {formatPrice(policy.originalPrice)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-foreground">Final Price:</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(policy.finalPrice)}
            </span>
          </div>
        </div>

        {/* Select Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={cn(
            'w-full mt-2 h-14 text-lg font-bold shadow-lg transition-all duration-200',
            isSelected
              ? 'bg-primary hover:bg-primary/90 text-white border-primary shadow-primary/25'
              : 'bg-primary hover:bg-primary/90 text-white border-primary shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]'
          )}
          variant="default"
        >
          {isSelected ? (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Policy Selected</span>
            </div>
          ) : (
            'Select This Policy'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
