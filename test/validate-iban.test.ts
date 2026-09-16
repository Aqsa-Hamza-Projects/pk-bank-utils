import {describe, it, expect} from 'vitest';
import {validateIBAN, parseIBAN} from '../src/iban/validate.js';
import {
  VALID_IBANS,
  INVALID_CHECKSUM_IBAN,
  TOO_SHORT_IBAN,
  TOO_LONG_IBAN,
  WRONG_COUNTRY_IBAN,
  NON_ALPHANUMERIC_IBAN,
  LOWERCASE_VALID_IBAN,
  SPACED_VALID_IBAN,
  DASHED_VALID_IBAN,
  MALFORMED_CHECK_DIGITS_IBAN,
  MALFORMED_BANK_CODE_IBAN,
  URDU_DIGITS_VALID_IBAN,
  ZERO_WIDTH_VALID_IBAN,
  MIXED_UNICODE_VALID_IBAN,
  LETTER_O_ACCOUNT_IBAN,
  ALL_LETTER_O_ACCOUNT_IBAN,
  UNMAPPABLE_LETTER_ACCOUNT_IBAN,
  RECOVERED_IBAN,
} from './fixtures/ibans.js';

describe('validateIBAN', () => {
  it('accepts a well-formed IBAN with correct check digits', () => {
    expect(validateIBAN(VALID_IBANS[0] as string)).toEqual({
      valid: true,
      country: 'PK',
      checkDigits: '36',
      bankCode: 'SCBL',
      accountNumber: '0000001123456702',
    });
  });

  it('accepts every fixture across different bank codes', () => {
    for (const iban of VALID_IBANS) {
      expect(validateIBAN(iban).valid).toBe(true);
    }
  });

  it('accepts lowercase input', () => {
    expect(validateIBAN(LOWERCASE_VALID_IBAN).valid).toBe(true);
  });

  it('accepts spaced input', () => {
    expect(validateIBAN(SPACED_VALID_IBAN).valid).toBe(true);
  });

  it('accepts dashed input', () => {
    expect(validateIBAN(DASHED_VALID_IBAN).valid).toBe(true);
  });

  it('rejects an invalid checksum but still exposes structural fields', () => {
    expect(validateIBAN(INVALID_CHECKSUM_IBAN)).toEqual({
      valid: false,
      reason: 'Invalid check digits',
      country: 'PK',
      checkDigits: '36',
      bankCode: 'SCBL',
      accountNumber: '0000001123456701',
    });
  });

  it('rejects a too-short IBAN', () => {
    const result = validateIBAN(TOO_SHORT_IBAN);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/24 characters/);
    expect(result.bankCode).toBeUndefined();
  });

  it('rejects a too-long IBAN', () => {
    const result = validateIBAN(TOO_LONG_IBAN);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/24 characters/);
  });

  it('rejects a non-PK country prefix', () => {
    const result = validateIBAN(WRONG_COUNTRY_IBAN);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/must start with PK/);
  });

  it('rejects malformed check digits (non-numeric)', () => {
    const result = validateIBAN(MALFORMED_CHECK_DIGITS_IBAN);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/2 numeric characters/);
  });

  it('rejects malformed bank code (non-alphabetic)', () => {
    const result = validateIBAN(MALFORMED_BANK_CODE_IBAN);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/4 letters/);
  });

  it('rejects non-alphanumeric characters in the account number', () => {
    const result = validateIBAN(NON_ALPHANUMERIC_IBAN);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/16 alphanumeric characters/);
  });

  it('rejects an empty string', () => {
    expect(validateIBAN('')).toEqual({
      valid: false,
      reason: 'IBAN must be a non-empty string',
    });
  });

  it('never throws on non-string input', () => {
    // @ts-expect-error deliberate bad input
    expect(() => validateIBAN(null)).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(() => validateIBAN(undefined)).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(() => validateIBAN(12345)).not.toThrow();
  });

  it('accepts an IBAN typed with Urdu digits', () => {
    expect(validateIBAN(URDU_DIGITS_VALID_IBAN)).toEqual({
      valid: true,
      country: 'PK',
      checkDigits: '36',
      bankCode: 'SCBL',
      accountNumber: '0000001123456702',
    });
  });

  it('accepts an IBAN pasted with a zero-width space', () => {
    expect(validateIBAN(ZERO_WIDTH_VALID_IBAN)).toEqual({
      valid: true,
      country: 'PK',
      checkDigits: '36',
      bankCode: 'SCBL',
      accountNumber: '0000001123456702',
    });
  });

  it('accepts Urdu digits and invisible characters together', () => {
    expect(validateIBAN(MIXED_UNICODE_VALID_IBAN).valid).toBe(true);
  });

  it('rejects a letter in the account field even when the checksum passes', () => {
    const result = validateIBAN(LETTER_O_ACCOUNT_IBAN);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Account number must be 16 digits');
    expect(result.bankCode).toBe('SCBL');
    expect(result.accountNumber).toBe('O000001123456702');
  });

  it('accepts a letter in the account field when leniency is opted into', () => {
    const result = validateIBAN(LETTER_O_ACCOUNT_IBAN, {
      allowAlphanumericAccount: true,
    });
    expect(result.valid).toBe(true);
    expect(result.accountNumber).toBe('O000001123456702');
  });

  it('keeps the old reason for genuinely non-alphanumeric input', () => {
    expect(validateIBAN(NON_ALPHANUMERIC_IBAN).reason).toBe(
      'Account number must be 16 alphanumeric characters'
    );
    expect(
      validateIBAN(NON_ALPHANUMERIC_IBAN, {allowAlphanumericAccount: true})
        .reason
    ).toBe('Account number must be 16 alphanumeric characters');
  });

  it('suggests the intended IBAN when one letter is wrong', () => {
    const result = validateIBAN(LETTER_O_ACCOUNT_IBAN);
    expect(result.hints).toEqual([{position: 8, found: 'O', expected: '0'}]);
    expect(result.suggestion).toBe(RECOVERED_IBAN);
  });

  it('suggests the intended IBAN when six letters are wrong', () => {
    const result = validateIBAN(ALL_LETTER_O_ACCOUNT_IBAN);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Account number must be 16 digits');
    expect(result.hints).toHaveLength(6);
    expect(result.suggestion).toBe(RECOVERED_IBAN);
  });

  it('offers no hints or suggestion for an unmappable letter', () => {
    const result = validateIBAN(UNMAPPABLE_LETTER_ACCOUNT_IBAN);
    expect(result.valid).toBe(false);
    expect(result.hints).toBeUndefined();
    expect(result.suggestion).toBeUndefined();
  });

  it('adds no hints to a valid result', () => {
    const result = validateIBAN(RECOVERED_IBAN);
    expect(result.valid).toBe(true);
    expect(result.hints).toBeUndefined();
    expect(result.suggestion).toBeUndefined();
  });
});

describe('parseIBAN', () => {
  it('is an alias for validateIBAN', () => {
    expect(parseIBAN(VALID_IBANS[0] as string)).toEqual(
      validateIBAN(VALID_IBANS[0] as string)
    );
    expect(parseIBAN(INVALID_CHECKSUM_IBAN)).toEqual(
      validateIBAN(INVALID_CHECKSUM_IBAN)
    );
  });

  it('forwards the options argument', () => {
    expect(parseIBAN(LETTER_O_ACCOUNT_IBAN).valid).toBe(false);
    expect(
      parseIBAN(LETTER_O_ACCOUNT_IBAN, {allowAlphanumericAccount: true}).valid
    ).toBe(true);
  });
});
