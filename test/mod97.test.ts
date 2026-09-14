import {describe, it, expect} from 'vitest';
import {passesMod97} from '../src/iban/mod97.js';

describe('passesMod97', () => {
  it('passes for known-valid IBANs', () => {
    expect(passesMod97('PK36SCBL0000001123456702')).toBe(true);
    expect(passesMod97('PK38HABB0000012345678901')).toBe(true);
    expect(passesMod97('PK43MEZN1234567890123456')).toBe(true);
  });

  it('fails when an account digit is altered', () => {
    expect(passesMod97('PK36SCBL0000001123456701')).toBe(false);
  });

  it('fails when the check digits are altered', () => {
    expect(passesMod97('PK00SCBL0000001123456702')).toBe(false);
  });

  it('returns false instead of throwing when the expansion contains non-numeric characters', () => {
    expect(passesMod97('PK36SCBL0000001123456!02')).toBe(false);
  });
});
