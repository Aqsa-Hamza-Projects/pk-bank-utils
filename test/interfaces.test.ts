import {describe, it, expect} from 'vitest';
import {COUNTRY_CODE, IBAN_LENGTH} from '../src/constants.js';
import type {Bank, BankType, BankStatus} from '../src/interfaces/index.js';
import type {
  BankType as PublicBankType,
  BankStatus as PublicBankStatus,
} from '../src/index.js';

describe('constants', () => {
  it('defines the Pakistan IBAN shape', () => {
    expect(COUNTRY_CODE).toBe('PK');
    expect(IBAN_LENGTH).toBe(24);
  });
});

describe('package entry', () => {
  it('exports BankType and BankStatus', () => {
    // Compile-time check: tsc fails if the entry stops exporting them.
    const type: PublicBankType = 'microfinance';
    const status: PublicBankStatus = 'active';
    expect([type, status]).toEqual(['microfinance', 'active']);
  });
});

describe('Bank', () => {
  it('describes a merged bank that points at its successor', () => {
    // KASB Bank -> BankIslami, 2015. The old code stays resolvable because
    // IBANs issued before the merger are still in customer records.
    const merged: Bank = {
      code: 'PLCO',
      name: 'KASB Bank Limited',
      type: 'commercial',
      islamic: false,
      swift: 'PLCOPKKA',
      status: 'merged',
      successorCode: 'BKIP',
    };

    expect(merged.successorCode).toBe('BKIP');
  });

  it('lets a bank outside the SWIFT network carry a null BIC', () => {
    const noSwift: Bank = {
      code: 'UMBL',
      name: 'U Microfinance Bank Limited',
      type: 'microfinance',
      islamic: false,
      swift: null,
      status: 'active',
    };

    expect(noSwift.swift).toBeNull();
  });

  it('names every licence class and lifecycle status', () => {
    const types: BankType[] = [
      'commercial',
      'microfinance',
      'digital',
      'specialized',
    ];
    const statuses: BankStatus[] = ['active', 'merged', 'defunct'];

    expect(types).toHaveLength(4);
    expect(statuses).toHaveLength(3);
  });
});
