import type {IBANHint} from '../interfaces/index.js';
import {passesMod97} from './mod97.js';

// Characters a human types by mistake for a digit, and the digit they meant.
// Uppercase keys only: normalizeIBAN uppercases before anything else sees the
// string, so a typed lowercase 'l' arrives here as 'L'.
const CONFUSABLES: Readonly<Record<string, string>> = {
  O: '0',
  I: '1',
  L: '1',
  S: '5',
  B: '8',
  Z: '2',
  G: '6',
};

// PK IBAN layout: 'PK' + 2 check digits + 4-letter bank code, then the
// 16-character account field.
const ACCOUNT_OFFSET = 8;

/**
 * Inspects the account field of an already-normalized 24-character PK IBAN and
 * reports the characters that are letters where a digit belongs, plus — when
 * the checksum confirms it — the IBAN the user meant.
 *
 * Pure; never throws. Callers guarantee the input shape.
 */
export function collectAccountHints(normalized: string): {
  hints: IBANHint[];
  suggestion?: string;
} {
  const account = normalized.slice(ACCOUNT_OFFSET);
  const candidate = account.split('');
  const hints: IBANHint[] = [];
  let unresolvable = false;

  for (let i = 0; i < account.length; i++) {
    const found = account.charAt(i);
    if (found >= '0' && found <= '9') continue;

    const expected = CONFUSABLES[found];
    if (expected === undefined) {
      // We can see this is wrong but not what was intended. Claiming a
      // substitution would be a guess, so we say nothing about this character
      // and withhold the whole suggestion.
      unresolvable = true;
      continue;
    }

    hints.push({position: ACCOUNT_OFFSET + i, found, expected});
    candidate[i] = expected;
  }

  if (hints.length === 0 || unresolvable) return {hints};

  // One all-at-once substitution, confirmed by the checksum. Searching subsets
  // would be a combinatorial hunt for a coincidence rather than a correction.
  const suggestion = normalized.slice(0, ACCOUNT_OFFSET) + candidate.join('');
  return passesMod97(suggestion) ? {hints, suggestion} : {hints};
}
