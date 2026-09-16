import type {IBANExplanation} from '../interfaces/index.js';
import {normalizeIBAN} from './normalize.js';
import {validateIBAN} from './validate.js';
import {collectAccountHints} from './confusables.js';

function countNonDigits(account: string): number {
  let count = 0;
  for (let i = 0; i < account.length; i++) {
    const ch = account.charAt(i);
    if (ch < '0' || ch > '9') count++;
  }
  return count;
}

/**
 * Explains why an IBAN is wrong in terms a user can act on: which characters
 * in the account field are letters where digits belong, and — when the
 * checksum confirms it — the IBAN they meant to type.
 *
 * Never throws.
 */
export function explainIBAN(iban: string): IBANExplanation {
  const normalized = normalizeIBAN(iban);

  // Strict on purpose. Lenient mode calls 'PK36SCBLO000001123456702' valid —
  // its checksum passes by coincidence — which is the very input this function
  // exists to explain. The strict result still carries the structural fields,
  // so nothing is lost.
  const result = validateIBAN(iban);

  if (result.valid) {
    return {normalized, valid: true, hints: [], message: 'IBAN is valid.'};
  }

  const fallback: IBANExplanation = {
    normalized,
    valid: false,
    ...(result.reason !== undefined && {reason: result.reason}),
    hints: [],
    message: result.reason ?? 'IBAN is not valid.',
  };

  // Only a structurally sound IBAN has an account field worth inspecting.
  if (result.accountNumber === undefined) return fallback;

  const nonDigits = countNonDigits(result.accountNumber);
  if (nonDigits === 0) return fallback;

  const {hints, suggestion} = collectAccountHints(normalized);
  const noun = nonDigits === 1 ? 'character' : 'characters';
  let message = `Account number contains ${nonDigits} non-digit ${noun}.`;
  if (suggestion !== undefined) {
    message += ` Did you mean ${suggestion}?`;
  } else if (hints.length > 0) {
    message += ' Substituting them does not produce a valid IBAN.';
  }

  return {
    normalized,
    valid: false,
    ...(result.reason !== undefined && {reason: result.reason}),
    hints,
    ...(suggestion !== undefined && {suggestion}),
    message,
  };
}
