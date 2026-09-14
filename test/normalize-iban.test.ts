import {describe, it, expect} from 'vitest';
import {normalizeIBAN} from '../src/iban/normalize.js';

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
});
