import { ageOnDate, birthDateFromNric } from '@/lib/age';

describe('birthDateFromNric', () => {
  it('reads YYMMDD from the first 6 digits', () => {
    expect(birthDateFromNric('950826-14-5678', '2026-10-14')).toBe('1995-08-26');
    expect(birthDateFromNric('950826145678', '2026-10-14')).toBe('1995-08-26');
  });

  it('uses the 2000s when that year is not in the future', () => {
    expect(birthDateFromNric('080115-10-1234', '2026-10-14')).toBe('2008-01-15');
  });

  it('falls back to the 1900s when the 2000s year would be in the future', () => {
    expect(birthDateFromNric('300101-10-1234', '2026-10-14')).toBe('1930-01-01');
  });

  it('returns null for invalid input', () => {
    expect(birthDateFromNric('A1234567', '2026-10-14')).toBeNull();
    expect(birthDateFromNric('951326-14-5678', '2026-10-14')).toBeNull();
  });
});

describe('ageOnDate', () => {
  it('counts full years up to the given date', () => {
    expect(ageOnDate('1995-08-26', '2026-10-14')).toBe(31);
    expect(ageOnDate('1995-10-14', '2026-10-14')).toBe(31);
    expect(ageOnDate('1995-10-15', '2026-10-14')).toBe(30);
  });
});
