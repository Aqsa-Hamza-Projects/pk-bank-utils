import type {IBANValidationResult} from '../interfaces/index.js';
import {COUNTRY_CODE, IBAN_LENGTH} from '../constants.js';
import {normalizeIBAN} from './normalize.js';
import {passesMod97} from './mod97.js';

const CHECK_DIGITS_PATTERN = /^[0-9]{2}$/;
const BANK_CODE_PATTERN = /^[A-Z]{4}$/;
const ACCOUNT_NUMBER_PATTERN = /^[A-Z0-9]{16}$/;

export function validateIBAN(iban: string): IBANValidationResult {
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
  if (!ACCOUNT_NUMBER_PATTERN.test(accountNumber)) {
    return {
      valid: false,
      reason: 'Account number must be 16 alphanumeric characters',
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

export function parseIBAN(iban: string): IBANValidationResult {
  return validateIBAN(iban);
}
