import {describe, it, expect} from 'vitest';
import {maskAccountNumber} from '../src/masking/mask-account-number.js';

describe('maskAccountNumber', () => {
  it('masks all but the last 4 characters', () => {
    expect(maskAccountNumber('123456789012')).toBe('********9012');
  });

  it('returns short input (4 characters or fewer) unchanged', () => {
    expect(maskAccountNumber('1234')).toBe('1234');
    expect(maskAccountNumber('12')).toBe('12');
    expect(maskAccountNumber('')).toBe('');
  });

  it('returns an empty string for non-string input', () => {
    // @ts-expect-error deliberate bad input
    expect(maskAccountNumber(null)).toBe('');
    // @ts-expect-error deliberate bad input
    expect(maskAccountNumber(undefined)).toBe('');
  });
});
