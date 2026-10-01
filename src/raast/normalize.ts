import {
  normalizePastedText,
  stripPhoneSeparators,
} from '../text/normalize-text.js';

export function normalizeRaastId(input: string): string {
  if (typeof input !== 'string') return '';

  // Same cleanup the IBAN path uses — NFKC, every format character, every
  // dash — plus the dots and parentheses people write phone numbers with.
  // The leading '+' survives it, which the branches below rely on.
  const cleaned = stripPhoneSeparators(
    normalizePastedText(input).toUpperCase()
  );

  // Reduce international forms to the national 03XXXXXXXXX shape. Order
  // matters: 0092 must be tested before 92, and both before a bare 3.
  if (cleaned.startsWith('+92')) return '0' + cleaned.slice(3);
  if (cleaned.startsWith('0092')) return '0' + cleaned.slice(4);
  if (cleaned.startsWith('92') && cleaned.length === 12) {
    return '0' + cleaned.slice(2);
  }
  if (cleaned.startsWith('3') && cleaned.length === 10) return '0' + cleaned;

  return cleaned;
}
