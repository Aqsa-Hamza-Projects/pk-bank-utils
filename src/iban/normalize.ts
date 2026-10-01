import {normalizePastedText, stripSeparators} from '../text/normalize-text.js';

export function normalizeIBAN(iban: string): string {
  if (typeof iban !== 'string') return '';
  // Order matters and matches the shared helper's contract: compatibility
  // fold, drop invisibles, map non-ASCII digits, then upper-case before
  // separators come out.
  return stripSeparators(normalizePastedText(iban).toUpperCase());
}
