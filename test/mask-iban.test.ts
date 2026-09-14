import {describe, it, expect} from 'vitest';
import {maskIBAN} from '../src/iban/mask.js';

describe('maskIBAN', () => {
  it('masks the middle of a valid IBAN, keeping prefix and last 4', () => {
    expect(maskIBAN('PK36SCBL0000001123456702')).toBe(
      'PK36SCBL************6702'
    );
  });

  it('normalizes before masking', () => {
    expect(maskIBAN('pk36 scbl 0000 0011 2345 6702')).toBe(
      'PK36SCBL************6702'
    );
  });

  it('falls back to a shorter reveal when input is too short for both ends', () => {
    expect(maskIBAN('PK36SCBL')).toBe('PK36****');
  });

  it('handles very short input without throwing', () => {
    expect(maskIBAN('PK')).toBe('PK');
    expect(maskIBAN('')).toBe('');
  });

  it('returns an empty string for non-string input', () => {
    // @ts-expect-error deliberate bad input
    expect(maskIBAN(null)).toBe('');
  });
});
