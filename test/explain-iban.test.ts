import {describe, it, expect} from 'vitest';
import {explainIBAN} from '../src/iban/explain.js';
import {
  VALID_IBANS,
  LETTER_O_ACCOUNT_IBAN,
  ALL_LETTER_O_ACCOUNT_IBAN,
  UNRECOVERABLE_ACCOUNT_IBAN,
  UNMAPPABLE_LETTER_ACCOUNT_IBAN,
  MIXED_TYPO_ACCOUNT_IBAN,
  RECOVERED_IBAN,
  INVALID_CHECKSUM_IBAN,
  TOO_SHORT_IBAN,
  WRONG_COUNTRY_IBAN,
  SPACED_VALID_IBAN,
  URDU_DIGITS_VALID_IBAN,
} from './fixtures/ibans.js';

describe('explainIBAN', () => {
  it('says so when the IBAN is valid', () => {
    expect(explainIBAN(VALID_IBANS[0] as string)).toEqual({
      normalized: RECOVERED_IBAN,
      valid: true,
      hints: [],
      message: 'IBAN is valid.',
    });
  });

  it('normalizes before explaining', () => {
    expect(explainIBAN(SPACED_VALID_IBAN).normalized).toBe(RECOVERED_IBAN);
  });

  it('treats Urdu digits as digits, not as typos', () => {
    const explanation = explainIBAN(URDU_DIGITS_VALID_IBAN);
    expect(explanation.valid).toBe(true);
    expect(explanation.hints).toEqual([]);
  });

  it('explains a single mistyped character and names the intended IBAN', () => {
    const explanation = explainIBAN(LETTER_O_ACCOUNT_IBAN);
    expect(explanation.valid).toBe(false);
    expect(explanation.hints).toEqual([
      {position: 8, found: 'O', expected: '0'},
    ]);
    expect(explanation.suggestion).toBe(RECOVERED_IBAN);
    expect(explanation.message).toBe(
      `Account number contains 1 non-digit character. Did you mean ${RECOVERED_IBAN}?`
    );
  });

  it('pluralizes and explains six mistyped characters', () => {
    const explanation = explainIBAN(ALL_LETTER_O_ACCOUNT_IBAN);
    expect(explanation.hints).toHaveLength(6);
    expect(explanation.message).toBe(
      `Account number contains 6 non-digit characters. Did you mean ${RECOVERED_IBAN}?`
    );
  });

  it('admits when it cannot recover the IBAN', () => {
    const explanation = explainIBAN(UNRECOVERABLE_ACCOUNT_IBAN);
    expect(explanation.suggestion).toBeUndefined();
    expect(explanation.message).toBe(
      'Account number contains 1 non-digit character. Substituting them does not produce a valid IBAN.'
    );
  });

  it('does not claim a substitution it never attempted', () => {
    // 'O' is mappable, 'X' is not. collectAccountHints stops before trying
    // MOD-97 at all, so the message must not say the substitution failed.
    const explanation = explainIBAN(MIXED_TYPO_ACCOUNT_IBAN);
    expect(explanation.hints).toEqual([
      {position: 8, found: 'O', expected: '0'},
    ]);
    expect(explanation.suggestion).toBeUndefined();
    expect(explanation.message).toBe(
      'Account number contains 2 non-digit characters. 1 of them does not match any digit, so no correction can be offered.'
    );
  });

  it('points at an unmappable letter without guessing', () => {
    const explanation = explainIBAN(UNMAPPABLE_LETTER_ACCOUNT_IBAN);
    expect(explanation.hints).toEqual([]);
    expect(explanation.suggestion).toBeUndefined();
    expect(explanation.message).toBe(
      'Account number contains 1 non-digit character.'
    );
  });

  it('passes structural failures through verbatim', () => {
    expect(explainIBAN(TOO_SHORT_IBAN).message).toBe(
      'IBAN must be 24 characters, got 23'
    );
    expect(explainIBAN(WRONG_COUNTRY_IBAN).message).toBe(
      'IBAN must start with PK'
    );
    expect(explainIBAN(INVALID_CHECKSUM_IBAN).message).toBe(
      'Invalid check digits'
    );
  });

  it('never throws on bad input', () => {
    // @ts-expect-error deliberate bad input
    expect(() => explainIBAN(null)).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(explainIBAN(undefined)).toEqual({
      normalized: '',
      valid: false,
      reason: 'IBAN must be a non-empty string',
      hints: [],
      message: 'IBAN must be a non-empty string',
    });
    expect(explainIBAN('').valid).toBe(false);
  });
});
