'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, required, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className={cn('text-sm font-medium', required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function TextField({ label, error, required, className, ...props }: TextFieldProps) {
  return (
    <FormField label={label} error={error} required={required} className={className}>
      <Input
        {...props}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive/20',
          className
        )}
        aria-invalid={!!error}
      />
    </FormField>
  );
}

interface RadioOption {
  value: string;
  label: string | React.ReactNode;
  description?: string;
}

interface RadioFieldProps {
  label: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function RadioField({
  label,
  name,
  options,
  value,
  onValueChange,
  error,
  required,
  className,
}: RadioFieldProps) {
  return (
    <FormField label={label} error={error} required={required} className={className}>
      <RadioGroup
        name={name}
        value={value}
        onValueChange={onValueChange}
        className="grid grid-cols-1 gap-3"
      >
        {options.map((option) => (
          <div 
            key={option.value} 
            className={cn(
              "flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
              value === option.value ? "border-primary bg-primary/5" : "border-transparent"
            )}
            onClick={() => onValueChange?.(option.value)}
          >
            <RadioGroupItem
              value={option.value}
              id={`${name}-${option.value}`}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none w-full">
              <Label
                htmlFor={`${name}-${option.value}`}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    </FormField>
  );
}

// Specialized input for NRIC with formatting
interface NRICFieldProps extends Omit<TextFieldProps, 'onChange'> {
  onChange?: (value: string) => void;
}

export function NRICField({ onChange, ...props }: NRICFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XXXXXX-XX-XXXX
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 6)}-${digits.slice(6)}`;
    }
    if (digits.length > 8) {
      formatted = `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`;
    }
    
    onChange?.(formatted);
  };

  return (
    <TextField
      {...props}
      onChange={handleChange}
      placeholder="123456-12-1234"
      maxLength={14}
    />
  );
}

// Specialized input for plate numbers
interface PlateNumberFieldProps extends Omit<TextFieldProps, 'onChange'> {
  onChange?: (value: string) => void;
}

export function PlateNumberField({ onChange, ...props }: PlateNumberFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
    onChange?.(value);
  };

  return (
    <TextField
      {...props}
      onChange={handleChange}
      placeholder="ABC1234"
      maxLength={10}
      style={{ textTransform: 'uppercase' }}
    />
  );
}
