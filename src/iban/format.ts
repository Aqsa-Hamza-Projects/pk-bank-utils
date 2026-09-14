import {normalizeIBAN} from './normalize.js';

export function formatIBAN(iban: string): string {
  const normalized = normalizeIBAN(iban);
  return normalized.replace(/(.{4})/g, '$1 ').trim();
}
