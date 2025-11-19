'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Loader2, Search, Shield, FileText } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 
      className={cn('animate-spin text-primary', sizeClasses[size], className)} 
    />
  );
}

interface AnimatedProgressProps {
  value: number;
  duration?: number;
  className?: string;
  showPercentage?: boolean;
}

export function AnimatedProgress({ 
  value, 
  duration = 5000, 
  className, 
  showPercentage = true 
}: AnimatedProgressProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const targetValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easeOutCubic;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, displayValue]);

  return (
    <div className={cn('space-y-2', className)}>
      <Progress value={displayValue} className="h-3" />
      {showPercentage && (
        <div className="text-center">
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(displayValue)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface LoadingStepsProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

export function LoadingSteps({ currentStep, steps, className }: LoadingStepsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <div
            key={index}
            className={cn(
              'flex items-center space-x-3 transition-all duration-300',
              isActive && 'text-primary',
              isCompleted && 'text-muted-foreground',
              !isActive && !isCompleted && 'text-muted-foreground/50'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                isActive && 'border-primary bg-primary/10',
                isCompleted && 'border-green-500 bg-green-500/10',
                !isActive && !isCompleted && 'border-muted-foreground/30'
              )}
            >
              {isCompleted ? (
                <div className="w-2 h-2 rounded-full bg-green-500" />
              ) : isActive ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              )}
            </div>
            <span className={cn('text-sm font-medium', isActive && 'animate-pulse')}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface InsuranceLoadingProps {
  progress: number;
  message: string;
  className?: string;
}

export function InsuranceLoading({ progress, message, className }: InsuranceLoadingProps) {
  const icons = [Search, Shield, FileText];
  const [currentIconIndex, setCurrentIconIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [icons.length]);

  const CurrentIcon = icons[currentIconIndex];

  return (
    <div className={cn('text-center space-y-6', className)}>
      {/* Animated Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CurrentIcon className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin border-t-primary" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <AnimatedProgress value={progress} showPercentage={false} />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>

      {/* Floating Dots Animation */}
      <div className="flex justify-center space-x-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

export function PolicyCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}
