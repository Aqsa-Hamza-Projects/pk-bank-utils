export function normalizeIBAN(iban: string): string {
  if (typeof iban !== 'string') return '';
  return iban.toUpperCase().replace(/[\s-]/g, '');
}
