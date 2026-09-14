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
});
