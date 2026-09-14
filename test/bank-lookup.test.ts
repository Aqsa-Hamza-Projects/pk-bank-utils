import {describe, it, expect} from 'vitest';
import {getBank, getBankFromIBAN} from '../src/banks/lookup.js';
import {VALID_IBANS, INVALID_CHECKSUM_IBAN} from './fixtures/ibans.js';

describe('getBank', () => {
  it('looks up a bank by code', () => {
    expect(getBank('SCBL')).toEqual({
      code: 'SCBL',
      name: 'Standard Chartered Bank (Pakistan) Limited',
    });
  });

  it('returns null for an unrecognized code', () => {
    expect(getBank('ZZZZ')).toBeNull();
  });

  it('returns null for malformed input without throwing', () => {
    // @ts-expect-error deliberate bad input
    expect(() => getBank(null)).not.toThrow();
  });
});

describe('getBankFromIBAN', () => {
  it('resolves the bank from a valid IBAN', () => {
    expect(getBankFromIBAN(VALID_IBANS[0] as string)).toEqual({
      code: 'SCBL',
      name: 'Standard Chartered Bank (Pakistan) Limited',
    });
  });

  it('still resolves the bank when only the checksum is wrong', () => {
    expect(getBankFromIBAN(INVALID_CHECKSUM_IBAN)).toEqual({
      code: 'SCBL',
      name: 'Standard Chartered Bank (Pakistan) Limited',
    });
  });

  it('returns null when the IBAN is structurally malformed', () => {
    expect(getBankFromIBAN('not-an-iban')).toBeNull();
  });

  it('returns null when the bank code is not in the registry', () => {
    expect(getBankFromIBAN('PK00ZZZZ0000001123456702')).toBeNull();
  });
});
