/** Format API date strings (YYYY-MM-DD or YYYY/MM/DD) as DD/MM/YYYY for display. */
export function formatCoverageDate(value: string): string {
  if (!value) return value;
  const normalized = value.trim().replace(/\//g, '-');
  const parts = normalized.split('-');
  if (parts.length !== 3) return value;
  const [y, m, d] = parts;
  if (y.length === 4) {
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return value;
}

export function formatCoveragePeriod(from: string, to: string): string {
  return `${formatCoverageDate(from)} to ${formatCoverageDate(to)}`;
}
