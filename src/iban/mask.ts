import {normalizeIBAN} from './normalize.js';

const VISIBLE_PREFIX_LENGTH = 8; // country (2) + check digits (2) + bank code (4)
const VISIBLE_SUFFIX_LENGTH = 4;

export function maskIBAN(iban: string): string {
  const normalized = normalizeIBAN(iban);
  const totalVisible = VISIBLE_PREFIX_LENGTH + VISIBLE_SUFFIX_LENGTH;

  if (normalized.length < totalVisible) {
    // Too short to safely reveal both ends — mask everything after the
    // first 4 characters (or all of it, if shorter than that) instead.
    const prefixLength = Math.min(4, normalized.length);
    const maskedLength = normalized.length - prefixLength;
    return normalized.slice(0, prefixLength) + '*'.repeat(maskedLength);
  }

  const prefix = normalized.slice(0, VISIBLE_PREFIX_LENGTH);
  const suffix = normalized.slice(-VISIBLE_SUFFIX_LENGTH);
  const maskedLength = normalized.length - totalVisible;
  return prefix + '*'.repeat(maskedLength) + suffix;
}
