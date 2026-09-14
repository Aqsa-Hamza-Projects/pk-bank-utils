import {describe, it, expect} from 'vitest';
import {getAllBanks, findBankByCode} from '../src/banks/registry.js';

describe('bank registry', () => {
  it('finds a bank by exact code', () => {
    expect(findBankByCode('MEZN')).toEqual({
      code: 'MEZN',
      name: 'Meezan Bank',
    });
  });

  it('is case-insensitive', () => {
    expect(findBankByCode('mezn')).toEqual({
      code: 'MEZN',
      name: 'Meezan Bank',
    });
  });

  it('returns null for an unknown code', () => {
    expect(findBankByCode('ZZZZ')).toBeNull();
  });

  it('returns null for malformed input without throwing', () => {
    // @ts-expect-error deliberate bad input
    expect(findBankByCode(null)).toBeNull();
    expect(findBankByCode('')).toBeNull();
  });

  it('getAllBanks returns a defensive copy', () => {
    const banks = getAllBanks();
    const first = banks[0];
    expect(first).toBeDefined();
    if (first) first.name = 'Mutated';
    expect(getAllBanks()[0]?.name).not.toBe('Mutated');
  });

  it('getAllBanks is non-empty', () => {
    expect(getAllBanks().length).toBeGreaterThan(0);
  });
});
