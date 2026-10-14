'use client';

import {
  formatDriverIdentityInput,
  sanitizePersonNameInput,
  type NamedDriverFields,
} from '@/lib/validations';

const NATIONALITY_OPTIONS = [
  'MALAYSIA', 'SINGAPORE', 'INDONESIA', 'THAILAND', 'PHILIPPINES',
  'INDIA', 'CHINA', 'BANGLADESH', 'PAKISTAN', 'MYANMAR', 'OTHERS',
];

export type AdditionalDriverFormValues = NamedDriverFields & {
  nationality: string;
};

export function AdditionalDriverFormFields({
  driver,
  fieldErrors,
  onFieldChange,
  onFieldBlur,
  nameInputClassName = 'mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm uppercase',
  selectClassName = 'mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm',
}: {
  driver: AdditionalDriverFormValues;
  fieldErrors?: { fullName?: string; idNumber?: string };
  onFieldChange: (field: keyof AdditionalDriverFormValues, value: string) => void;
  onFieldBlur?: (field: 'fullName' | 'idNumber') => void;
  nameInputClassName?: string;
  selectClassName?: string;
}) {
  const idInvalid = Boolean(fieldErrors?.idNumber);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Name as per ID *</label>
        <input
          value={driver.fullName}
          onChange={(e) => onFieldChange('fullName', sanitizePersonNameInput(e.target.value))}
          onBlur={() => onFieldBlur?.('fullName')}
          aria-invalid={Boolean(fieldErrors?.fullName)}
          className={`${nameInputClassName} ${fieldErrors?.fullName ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
          placeholder="FULL NAME"
          maxLength={100}
        />
        {fieldErrors?.fullName && (
          <p className="text-[11px] text-destructive mt-1">{fieldErrors.fullName}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium">Nationality *</label>
          <select
            value={driver.nationality}
            onChange={(e) => onFieldChange('nationality', e.target.value)}
            className={selectClassName}
          >
            {NATIONALITY_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium">ID Type *</label>
          <select
            value={driver.idType}
            onChange={(e) => onFieldChange('idType', e.target.value)}
            className={selectClassName}
          >
            <option value="NRIC">NRIC</option>
            <option value="OLD_IC">Old IC</option>
            <option value="PASS">Passport</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium">ID Number *</label>
        <input
          value={driver.idNumber}
          onChange={(e) =>
            onFieldChange(
              'idNumber',
              formatDriverIdentityInput(driver.idType, e.target.value),
            )
          }
          onBlur={() => onFieldBlur?.('idNumber')}
          aria-invalid={idInvalid}
          className={`mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm ${idInvalid ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
          placeholder={
            driver.idType === 'NRIC'
              ? '123456-12-1234'
              : driver.idType === 'PASS'
                ? 'A12345678'
                : 'ID NUMBER'
          }
          maxLength={driver.idType === 'NRIC' ? 14 : driver.idType === 'PASS' ? 12 : 20}
          inputMode={driver.idType === 'NRIC' ? 'numeric' : 'text'}
        />
        {fieldErrors?.idNumber && (
          <p className="text-[11px] text-destructive mt-1">{fieldErrors.idNumber}</p>
        )}
      </div>
    </div>
  );
}
