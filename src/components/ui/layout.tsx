'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Footer } from './footer';
import { Button } from './button';
import { Menu, X } from 'lucide-react';

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
    <div className={cn('mx-auto px-5 sm:px-8 lg:px-10', sizeClasses[size], className)}>
      {children}
    </div>
  );
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '#coverage', label: 'Coverage' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#reviews', label: 'Reviews' },
];

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
  headerContent,
}: PageLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className={cn('min-h-screen bg-background flex flex-col', className)}>
      {showHeader && (
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
          <Container size="xl">
            <nav className="flex items-center justify-between h-16">
              {headerContent || (
                <>
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                      <span className="text-primary-foreground font-bold text-sm">H</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground">HALLU</span>
                  </Link>

                  {/* Desktop nav */}
                  <div className="hidden md:flex items-center gap-10">
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="text-[15px] text-muted-foreground hover:text-primary transition-colors duration-200 font-normal tracking-wide"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>

                  {/* Desktop CTA */}
                  <div className="hidden md:flex items-center gap-4">
                    <Button asChild size="sm" variant="outline" className="rounded-full px-6 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                      <Link href="/quote">Get Quote</Link>
                    </Button>
                  </div>

                  {/* Mobile menu toggle */}
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 -mr-2 text-foreground"
                    aria-label="Toggle menu"
                  >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </>
              )}
            </nav>

            {/* Mobile nav panel */}
            {mobileOpen && (
              <div className="md:hidden border-t border-border/40 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-2 px-3">
                  <Button asChild size="sm" className="w-full rounded-full">
                    <Link href="/quote" onClick={() => setMobileOpen(false)}>Get Quote</Link>
                  </Button>
                </div>
              </div>
            )}
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
  maxWidth = 'max-w-md',
}: CenteredLayoutProps) {
  return (
    <div className={cn('min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-12', className)}>
      <div className={cn('w-full space-y-8', maxWidth)}>
        {(title || subtitle) && (
          <div className="text-center space-y-3">
            {title && (
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground text-[15px] leading-relaxed">{subtitle}</p>
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
  eyebrow?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({
  children,
  className,
  title,
  subtitle,
  eyebrow,
  padding = 'lg',
}: SectionProps) {
  const paddingClasses = {
    none: '',
    sm: 'py-10',
    md: 'py-14',
    lg: 'py-20',
    xl: 'py-28',
  };

  return (
    <section className={cn(paddingClasses[padding], className)}>
      <Container size="xl">
        {(title || subtitle) && (
          <div className="text-center mb-14 max-w-2xl mx-auto">
            {eyebrow && (
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
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
    <nav aria-label="Progress" className={cn('mb-10', className)}>
      <ol className="flex items-center justify-center gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <React.Fragment key={step}>
              <li className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                    isActive && 'bg-primary text-primary-foreground shadow-md shadow-primary/20',
                    isCompleted && 'bg-green-600 text-white',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:inline transition-colors duration-300',
                    isActive && 'text-foreground',
                    isCompleted && 'text-green-600',
                    !isActive && !isCompleted && 'text-muted-foreground/70',
                  )}
                >
                  {step}
                </span>
              </li>
              {index < steps.length - 1 && (
                <li aria-hidden="true">
                  <div className={cn('w-8 sm:w-12 h-px transition-colors duration-300', isCompleted ? 'bg-green-500' : 'bg-border/60')} />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
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
  wrap = false,
}: FlexProps) {
  const directionClass = direction === 'col' ? 'flex-col' : 'flex-row';
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  const gapClass = gap > 0 ? `gap-${gap}` : '';
  const wrapClass = wrap ? 'flex-wrap' : '';

  return (
    <div className={cn('flex', directionClass, alignClass, justifyClass, gapClass, wrapClass, className)}>
      {children}
    </div>
  );
}
