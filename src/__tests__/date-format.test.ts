import { formatCoverageDate, formatCoveragePeriod } from '@/lib/date-format';

describe('date-format', () => {
  it('formats ISO dates as DD/MM/YYYY', () => {
    expect(formatCoverageDate('2026-08-30')).toBe('30/08/2026');
  });

  it('formats coverage period', () => {
    expect(formatCoveragePeriod('2026-08-30', '2027-08-29')).toBe('30/08/2026 to 29/08/2027');
  });
});
