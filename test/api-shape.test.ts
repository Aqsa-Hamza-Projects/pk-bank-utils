import {describe, it, expect} from 'vitest';
import * as api from '../src/index.js';

describe('public API shape', () => {
  it('exports exactly the documented surface', () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        'explainIBAN',
        'formatIBAN',
        'getBank',
        'getBankFromIBAN',
        'getBanks',
        'maskAccountNumber',
        'maskIBAN',
        'normalizeIBAN',
        'parseIBAN',
        'searchBanks',
        'validateIBAN',
      ].sort()
    );
  });

  it('never throws on malformed input', () => {
    // @ts-expect-error deliberate bad input
    expect(() => api.validateIBAN()).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(() => api.validateIBAN(null)).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(() => api.validateIBAN(123)).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(api.validateIBAN()).toEqual({
      valid: false,
      reason: 'IBAN must be a non-empty string',
    });
    // @ts-expect-error deliberate bad input
    expect(() => api.parseIBAN(undefined)).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(() => api.explainIBAN(null)).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(() => api.explainIBAN(123)).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(api.normalizeIBAN(null)).toBe('');
    // @ts-expect-error deliberate bad input
    expect(api.formatIBAN(null)).toBe('');
    // @ts-expect-error deliberate bad input
    expect(api.maskIBAN(null)).toBe('');
    // @ts-expect-error deliberate bad input
    expect(api.maskAccountNumber(null)).toBe('');
    // @ts-expect-error deliberate bad input
    expect(api.getBank()).toBeNull();
    // @ts-expect-error deliberate bad input
    expect(api.getBankFromIBAN()).toBeNull();
    // @ts-expect-error deliberate bad input
    expect(api.searchBanks()).toEqual([]);
    expect(api.getBanks()).toBeInstanceOf(Array);
  });
});
