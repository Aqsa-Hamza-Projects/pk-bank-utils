import {describe, it, expect} from 'vitest';
import {normalizeIBAN} from '../src/iban/normalize.js';

import {
  URDU_DIGITS_VALID_IBAN,
  ARABIC_INDIC_VALID_IBAN,
  ZERO_WIDTH_VALID_IBAN,
  NBSP_VALID_IBAN,
  BIDI_MARK_VALID_IBAN,
  MIXED_UNICODE_VALID_IBAN,
} from './fixtures/ibans.js';

describe('normalizeIBAN', () => {
  it('uppercases and strips spaces', () => {
    expect(normalizeIBAN('pk36 scbl 0000 0011 2345 6702')).toBe(
      'PK36SCBL0000001123456702'
    );
  });

  it('strips dashes', () => {
    expect(normalizeIBAN('PK36-SCBL-0000-0011-2345-6702')).toBe(
      'PK36SCBL0000001123456702'
    );
  });

  it('is a no-op on an already-normalized IBAN', () => {
    expect(normalizeIBAN('PK36SCBL0000001123456702')).toBe(
      'PK36SCBL0000001123456702'
    );
  });

  it('returns an empty string for non-string input', () => {
    // @ts-expect-error deliberate bad input
    expect(normalizeIBAN(null)).toBe('');
    // @ts-expect-error deliberate bad input
    expect(normalizeIBAN(undefined)).toBe('');
  });

  it('does not validate structure, only cleans formatting', () => {
    expect(normalizeIBAN('garbage input!!')).toBe('GARBAGEINPUT!!');
  });

  const EXPECTED = 'PK36SCBL0000001123456702';

  it('maps Eastern-Arabic-Indic (Urdu) digits to ASCII', () => {
    expect(normalizeIBAN(URDU_DIGITS_VALID_IBAN)).toBe(EXPECTED);
  });

  it('maps Arabic-Indic digits to ASCII', () => {
    expect(normalizeIBAN(ARABIC_INDIC_VALID_IBAN)).toBe(EXPECTED);
  });

  it('strips zero-width characters', () => {
    expect(normalizeIBAN(ZERO_WIDTH_VALID_IBAN)).toBe(EXPECTED);
  });

  it('strips a non-breaking space', () => {
    expect(normalizeIBAN(NBSP_VALID_IBAN)).toBe(EXPECTED);
  });

  it('strips bidi formatting marks', () => {
    expect(normalizeIBAN(BIDI_MARK_VALID_IBAN)).toBe(EXPECTED);
  });

  it('handles Urdu digits and invisible characters together', () => {
    expect(normalizeIBAN(MIXED_UNICODE_VALID_IBAN)).toBe(EXPECTED);
  });

  it('leaves non-digit non-Latin characters alone', () => {
    // Urdu letters are neither digits nor invisible — they survive, so the
    // caller still sees garbage in, garbage out rather than silent damage.
    expect(normalizeIBAN('\u0627\u0628')).toBe('\u0627\u0628');
  });
});
