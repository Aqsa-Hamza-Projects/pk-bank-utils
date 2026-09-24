import {describe, it, expect} from 'vitest';
import {getBanks, searchBanks} from '../src/banks/search.js';

describe('getBanks', () => {
  it('returns the full registry', () => {
    const banks = getBanks();
    expect(banks.length).toBeGreaterThan(0);
    expect(banks.some((bank) => bank.code === 'MEZN')).toBe(true);
  });

  it('returns a defensive copy', () => {
    const banks = getBanks();
    const first = banks[0];
    expect(first).toBeDefined();
    if (first) first.name = 'Mutated';
    expect(getBanks()[0]?.name).not.toBe('Mutated');
  });
});

describe('searchBanks', () => {
  it('matches by case-insensitive substring on name', () => {
    expect(searchBanks('meezan')).toMatchObject([
      {code: 'MEZN', name: 'Meezan Bank Limited'},
    ]);
  });

  it('returns an empty array for no matches', () => {
    expect(searchBanks('totally-not-a-bank')).toEqual([]);
  });

  it('returns an empty array for an empty query', () => {
    expect(searchBanks('')).toEqual([]);
  });

  it('returns an empty array for non-string input', () => {
    // @ts-expect-error deliberate bad input
    expect(searchBanks(null)).toEqual([]);
  });
});
