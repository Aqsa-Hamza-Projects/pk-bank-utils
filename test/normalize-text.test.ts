import {describe, it, expect} from 'vitest';
import {
  normalizePastedText,
  stripSeparators,
  stripPhoneSeparators,
} from '../src/text/normalize-text.js';

describe('normalizePastedText', () => {
  it('drops every Unicode format character, not an enumerated list', () => {
    // Each of these is category Cf. The first four are the ones an
    // enumerated list missed: bidi isolates (Android wraps pasted numbers in
    // them), the Arabic Letter Mark (Urdu keyboards insert it), the word
    // joiner, and the soft hyphen.
    const contaminated =
      'a\u2066b\u2069c\u061Cd\u2060e\u00ADf\u200Bg\uFEFFh\u200Ei\u202Aj';
    expect(normalizePastedText(contaminated)).toBe('abcdefghij');
  });

  it('folds full-width digits and letters via NFKC', () => {
    expect(normalizePastedText('\uFF30\uFF2B\uFF13\uFF16')).toBe('PK36');
    expect(normalizePastedText('\uFF10\uFF13\uFF10\uFF10')).toBe('0300');
  });

  it('maps Eastern-Arabic-Indic (Urdu) digits to ASCII', () => {
    expect(normalizePastedText('\u06F0\u06F3\u06F0\u06F0')).toBe('0300');
  });

  it('maps Arabic-Indic digits to ASCII', () => {
    expect(normalizePastedText('\u0660\u0663\u0660\u0660')).toBe('0300');
  });

  it('leaves separators alone for the caller to strip', () => {
    expect(normalizePastedText('03 00-12')).toBe('03 00-12');
  });

  it('leaves ordinary text untouched', () => {
    expect(normalizePastedText('PK36SCBL')).toBe('PK36SCBL');
  });
});

describe('stripSeparators', () => {
  it('removes every kind of dash, not just the ASCII hyphen', () => {
    // hyphen-minus, non-breaking hyphen, figure dash, en dash, em dash,
    // horizontal bar, and the mathematical minus sign.
    expect(
      stripSeparators('1-2\u20113\u20124\u20135\u20146\u20157\u22128')
    ).toBe('12345678');
  });

  it('removes whitespace including NBSP, which is not a format character', () => {
    expect(stripSeparators('1 2\u00A03\t4\n5')).toBe('12345');
  });

  it('leaves phone punctuation in place', () => {
    expect(stripSeparators('(03).00')).toBe('(03).00');
  });
});

describe('stripPhoneSeparators', () => {
  it('removes dashes and whitespace like stripSeparators', () => {
    expect(stripPhoneSeparators('0300\u20131234 567')).toBe('03001234567');
  });

  it('also removes dots and parentheses', () => {
    expect(stripPhoneSeparators('(0300) 1234.567')).toBe('03001234567');
  });

  it('is a superset of stripSeparators', () => {
    const input = '1 2\u00A03\t4-5\u20136\u22127';
    expect(stripPhoneSeparators(input)).toBe(stripSeparators(input));
  });
});
