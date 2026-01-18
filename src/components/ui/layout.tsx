'use client';

import * as React from 'react';
import { cn, getHref } from '@/lib/utils';
import Link from 'next/link';
import { Footer } from './footer';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}>
      {children}
    </div>
  );
}

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  headerContent?: React.ReactNode;
}

export function PageLayout({ 
  children, 
  className, 
  showHeader = true, 
  headerContent 
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background flex flex-col', className)}>
      {showHeader && (
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <Container>
            <div className="flex items-center justify-between h-16">
              {headerContent || (
                <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">H</span>
                  </div>
                  <h1 className="text-xl font-bold text-foreground">
                    HALLU
                  </h1>
                </Link>
              )}
            </div>
          </Container>
        </header>
      )}
      
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <Footer />
    </div>
  );
}

interface CenteredLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  maxWidth?: string;
}

export function CenteredLayout({ 
  children, 
  className, 
  title, 
  subtitle,
  maxWidth = 'max-w-md'
}: CenteredLayoutProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center p-4', className)}>
      <div className={cn('w-full space-y-6', maxWidth)}>
        {(title || subtitle) && (
          <div className="text-center space-y-2">
            {title && (
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export function Grid({ children, className, cols, gap = 4 }: GridProps) {
  const gridCols = cols || { default: 1, md: 2, lg: 3 };
  
  const getGridClasses = () => {
    const classes = [`gap-${gap}`];
    
    if (gridCols.default) classes.push(`grid-cols-${gridCols.default}`);
    if (gridCols.sm) classes.push(`sm:grid-cols-${gridCols.sm}`);
    if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md}`);
    if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg}`);
    if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={cn('grid', getGridClasses(), className)}>
      {children}
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({ 
  children, 
  className, 
  title, 
  subtitle, 
  padding = 'lg' 
}: SectionProps) {
  const paddingClasses = {
    none: '',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24',
  };

  return (
    <section className={cn(paddingClasses[padding], className)}>
      <Container>
        {(title || subtitle) && (
          <div className="text-center mb-12 space-y-4">
            {title && (
              <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center space-x-4 mb-8', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center space-y-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all',
                  isActive && 'border-primary bg-primary text-primary-foreground',
                  isCompleted && 'border-green-500 bg-green-500 text-white',
                  !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium text-center max-w-16',
                  isActive && 'text-primary',
                  isCompleted && 'text-green-600',
                  !isActive && !isCompleted && 'text-muted-foreground'
                )}
              >
                {step}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-0.5 transition-all',
                  isCompleted && 'bg-green-500',
                  !isCompleted && 'bg-muted-foreground/30'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number;
  wrap?: boolean;
}

export function Flex({ 
  children, 
  className, 
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 0,
  wrap = false
}: FlexProps) {
  const directionClass = direction === 'col' ? 'flex-col' : 'flex-row';
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  const gapClass = gap > 0 ? `gap-${gap}` : '';
  const wrapClass = wrap ? 'flex-wrap' : '';

  return (
    <div className={cn(
      'flex',
      directionClass,
      alignClass,
      justifyClass,
      gapClass,
      wrapClass,
      className
    )}>
      {children}
    </div>
  );
}
