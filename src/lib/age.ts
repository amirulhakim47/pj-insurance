/** ISO `YYYY-MM-DD` birth date from a Malaysian NRIC (YYMMDD prefix), or null if not a real date. */
export function birthDateFromNric(nric: string, referenceDate: string): string | null {
  const match = nric.replace(/[\s-]/g, '').match(/^(\d{2})(\d{2})(\d{2})\d{6}$/);
  if (!match) return null;
  const [, yy, mm, dd] = match;

  const referenceYear = parseInt(referenceDate.slice(0, 4), 10);
  const year2000s = 2000 + parseInt(yy, 10);
  const year = year2000s > referenceYear ? year2000s - 100 : year2000s;

  const iso = `${year}-${mm}-${dd}`;
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso) return null;
  return iso;
}

/** Whole years between two ISO dates. */
export function ageOnDate(birthDate: string, onDate: string): number {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [y, m, d] = onDate.split('-').map(Number);
  const hadBirthday = m > bm || (m === bm && d >= bd);
  return y - by - (hadBirthday ? 0 : 1);
}
