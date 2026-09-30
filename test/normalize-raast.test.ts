import {describe, it, expect} from 'vitest';
import {normalizeRaastId} from '../src/raast/normalize.js';
import {
  CANONICAL_RAAST_ID,
  RAAST_EQUIVALENT_FORMS,
  URDU_DIGITS_RAAST_ID,
  ARABIC_INDIC_RAAST_ID,
  ZERO_WIDTH_RAAST_ID,
} from './fixtures/raast.js';

describe('normalizeRaastId', () => {
  it.each(RAAST_EQUIVALENT_FORMS)('normalizes %s', (form) => {
    expect(normalizeRaastId(form)).toBe(CANONICAL_RAAST_ID);
  });

  it('folds Eastern-Arabic-Indic (Urdu) digits', () => {
    expect(normalizeRaastId(URDU_DIGITS_RAAST_ID)).toBe(CANONICAL_RAAST_ID);
  });

  it('folds Arabic-Indic digits', () => {
    expect(normalizeRaastId(ARABIC_INDIC_RAAST_ID)).toBe(CANONICAL_RAAST_ID);
  });

  it('strips invisible characters', () => {
    expect(normalizeRaastId(ZERO_WIDTH_RAAST_ID)).toBe(CANONICAL_RAAST_ID);
  });

  it('returns an empty string for non-string input', () => {
    // @ts-expect-error deliberate bad input
    expect(normalizeRaastId(null)).toBe('');
    // @ts-expect-error deliberate bad input
    expect(normalizeRaastId(undefined)).toBe('');
  });

  it('does not validate structure, only cleans formatting', () => {
    expect(normalizeRaastId('garbage!!')).toBe('GARBAGE!!');
  });
});

// The Raast normalizer shares its cleanup with normalizeIBAN. These cases are
// the ones an enumerated character list used to miss, and they are what the
// shared helper buys: every dash, every format character, and NFKC.
describe('normalizeRaastId, sharing the IBAN cleanup', () => {
  it.each([
    ['en dash', '0300\u20131234567'],
    ['em dash', '0300\u20141234567'],
    ['non-breaking hyphen', '0300\u20111234567'],
    ['figure dash', '0300\u20121234567'],
    ['horizontal bar', '0300\u20151234567'],
    ['minus sign', '0300\u22121234567'],
    ['non-breaking space', '0300\u00A01234567'],
  ])('treats a %s as a separator', (_label, input) => {
    expect(normalizeRaastId(input)).toBe(CANONICAL_RAAST_ID);
  });

  it('folds full-width digits via NFKC', () => {
    const fullWidth =
      '\uFF10\uFF13\uFF10\uFF10\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17';
    expect(normalizeRaastId(fullWidth)).toBe(CANONICAL_RAAST_ID);
  });

  it('folds a full-width plus sign, so the +92 branch still fires', () => {
    expect(normalizeRaastId('\uFF0B92 300 1234567')).toBe(CANONICAL_RAAST_ID);
  });

  it('strips the bidi isolates Android wraps around a pasted number', () => {
    expect(normalizeRaastId('\u2066+92 300 1234567\u2069')).toBe(
      CANONICAL_RAAST_ID
    );
  });

  it('strips the Arabic Letter Mark an Urdu keyboard inserts', () => {
    expect(normalizeRaastId('\u061C03001234567')).toBe(CANONICAL_RAAST_ID);
  });

  it('reduces input that is only invisible characters to empty', () => {
    expect(normalizeRaastId('\u200B\u2066\u061C\uFEFF')).toBe('');
  });

  it('reduces input that is only separators to empty', () => {
    expect(normalizeRaastId(' -\u2013()\u00A0.')).toBe('');
  });
});
