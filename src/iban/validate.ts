import type {IBANValidationResult} from '../interfaces/index.js';
import {COUNTRY_CODE, IBAN_LENGTH} from '../constants.js';
import {normalizeIBAN} from './normalize.js';
import {passesMod97} from './mod97.js';
import {collectAccountHints} from './confusables.js';

const CHECK_DIGITS_PATTERN = /^[0-9]{2}$/;
const BANK_CODE_PATTERN = /^[A-Z]{4}$/;

// SBP-licensed banks all issue purely numeric 16-digit account fields, so a
// letter here is a typo rather than an exotic account. The ISO registry's
// official format for PK is 16!c, so the lenient pattern stays available
// behind an opt-in for callers who need registry-faithful behaviour.
const ACCOUNT_NUMBER_PATTERN = /^[0-9]{16}$/;
const LENIENT_ACCOUNT_NUMBER_PATTERN = /^[A-Z0-9]{16}$/;

export interface ValidateIBANOptions {
  /**
   * Accept `[A-Z0-9]{16}` in the account field, matching the ISO registry's
   * `16!c` rather than what Pakistani banks actually issue. Defaults to
   * `false`.
   */
  allowAlphanumericAccount?: boolean;
}

export function validateIBAN(
  iban: string,
  options?: ValidateIBANOptions
): IBANValidationResult {
  const normalized = normalizeIBAN(iban);
  // Checked after normalizing: input made only of separators or invisible
  // characters is empty too, not "0 characters long".
  if (normalized === '') {
    return {valid: false, reason: 'IBAN must be a non-empty string'};
  }

  if (normalized.length !== IBAN_LENGTH) {
    return {
      valid: false,
      reason: `IBAN must be ${IBAN_LENGTH} characters, got ${normalized.length}`,
    };
  }

  if (!normalized.startsWith(COUNTRY_CODE)) {
    return {valid: false, reason: `IBAN must start with ${COUNTRY_CODE}`};
  }

  const checkDigits = normalized.slice(2, 4);
  const bankCode = normalized.slice(4, 8);
  const accountNumber = normalized.slice(8);

  if (!CHECK_DIGITS_PATTERN.test(checkDigits)) {
    return {valid: false, reason: 'Check digits must be 2 numeric characters'};
  }
  if (!BANK_CODE_PATTERN.test(bankCode)) {
    return {valid: false, reason: 'Bank code must be 4 letters'};
  }
  const accountPattern =
    options?.allowAlphanumericAccount === true
      ? LENIENT_ACCOUNT_NUMBER_PATTERN
      : ACCOUNT_NUMBER_PATTERN;

  if (!accountPattern.test(accountNumber)) {
    // Not even alphanumeric ('!', '#'): the original message is still the
    // accurate one, and callers that special-cased it keep working.
    if (!LENIENT_ACCOUNT_NUMBER_PATTERN.test(accountNumber)) {
      return {
        valid: false,
        reason: 'Account number must be 16 alphanumeric characters',
      };
    }

    // A letter where a digit belongs. Point at it, and name the IBAN the user
    // meant when substituting the confusable characters checksums.
    //
    // Doing this here rather than only in explainIBAN costs one extra MOD-97
    // on a path that has already failed, and it means the caller who checks
    // `valid` gets the correction without knowing a second function exists —
    // which is the whole point, since that caller is the one about to show a
    // user "invalid IBAN" and nothing else.
    const {hints, suggestion} = collectAccountHints(normalized);
    return {
      valid: false,
      reason: 'Account number must be 16 digits',
      country: 'PK',
      checkDigits,
      bankCode,
      accountNumber,
      ...(hints.length > 0 && {hints}),
      ...(suggestion !== undefined && {suggestion}),
    };
  }

  // Structure is sound from here on — these fields are well-formed even if
  // the checksum below turns out to be wrong, which is why they're included
  // in both the success and the "Invalid check digits" failure result.
  if (!passesMod97(normalized)) {
    return {
      valid: false,
      reason: 'Invalid check digits',
      country: 'PK',
      checkDigits,
      bankCode,
      accountNumber,
    };
  }

  return {valid: true, country: 'PK', checkDigits, bankCode, accountNumber};
}

export function parseIBAN(
  iban: string,
  options?: ValidateIBANOptions
): IBANValidationResult {
  return validateIBAN(iban, options);
}
