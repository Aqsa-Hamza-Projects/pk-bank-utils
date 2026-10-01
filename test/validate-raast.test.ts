import {describe, it, expect} from 'vitest';
import {validateRaastId} from '../src/raast/validate.js';
import {
  CANONICAL_RAAST_ID,
  RAAST_EQUIVALENT_FORMS,
  URDU_DIGITS_RAAST_ID,
  TOO_SHORT_RAAST_ID,
  TOO_LONG_RAAST_ID,
  LANDLINE_RAAST_ID,
  NON_DIGIT_RAAST_ID,
  UNKNOWN_PREFIX_RAAST_ID,
} from './fixtures/raast.js';

describe('validateRaastId', () => {
  it.each(RAAST_EQUIVALENT_FORMS)('accepts %s', (form) => {
    const result = validateRaastId(form);
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe(CANONICAL_RAAST_ID);
  });

  it('accepts Urdu digits and reports the allocated operator', () => {
    const result = validateRaastId(URDU_DIGITS_RAAST_ID);
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe(CANONICAL_RAAST_ID);
    expect(result.allocatedOperator).toBe('Jazz');
    expect(result.knownPrefix).toBe(true);
  });

  it('accepts a valid mobile whose prefix is outside our table', () => {
    const result = validateRaastId(UNKNOWN_PREFIX_RAAST_ID);
    expect(result.valid).toBe(true);
    expect(result.allocatedOperator).toBeNull();
    expect(result.knownPrefix).toBe(false);
  });

  it('rejects empty and non-string input', () => {
    expect(validateRaastId('')).toEqual({
      valid: false,
      reason: 'Raast ID must be a non-empty string',
    });
    // @ts-expect-error deliberate bad input
    expect(validateRaastId(null).valid).toBe(false);
  });

  it('rejects non-digit characters', () => {
    const result = validateRaastId(NON_DIGIT_RAAST_ID);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Raast ID must contain only digits');
  });

  it('reports the actual length when it is wrong', () => {
    expect(validateRaastId(TOO_SHORT_RAAST_ID).reason).toBe(
      'Raast ID must be 11 digits, got 10'
    );
    expect(validateRaastId(TOO_LONG_RAAST_ID).reason).toBe(
      'Raast ID must be 11 digits, got 12'
    );
  });

  it('rejects a landline with a mobile-specific reason', () => {
    const result = validateRaastId(LANDLINE_RAAST_ID);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(
      'Raast ID must be a mobile number starting with 03'
    );
  });

  it('never throws', () => {
    // @ts-expect-error deliberate bad input
    expect(() => validateRaastId(123)).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(() => validateRaastId({})).not.toThrow();
  });
});

// Changing the normalizer manufactures new degenerate inputs: a value made
// only of invisible characters or only of separators normalizes to empty, and
// must be reported as empty rather than as a digit or length problem. The
// empty check therefore runs after normalizing, as validateIBAN's does.
describe('validateRaastId on degenerate input', () => {
  it.each([
    ['only invisible format characters', '\u200B\u2066\u061C\uFEFF'],
    ['only separators', ' -\u2013()\u00A0.'],
    ['an empty string', ''],
  ])('reports %s as empty, not as a length or digit problem', (_l, input) => {
    expect(validateRaastId(input)).toEqual({
      valid: false,
      reason: 'Raast ID must be a non-empty string',
    });
  });

  it('accepts full-width digits, which NFKC folds', () => {
    const fullWidth =
      '\uFF10\uFF13\uFF10\uFF10\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17';
    const result = validateRaastId(fullWidth);
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe(CANONICAL_RAAST_ID);
    expect(result.allocatedOperator).toBe('Jazz');
  });

  it('accepts a number written with an en dash', () => {
    expect(validateRaastId('0300\u20131234567').normalized).toBe(
      CANONICAL_RAAST_ID
    );
  });
});
