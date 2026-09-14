import {describe, it, expect} from 'vitest';
import {COUNTRY_CODE, IBAN_LENGTH} from '../src/constants.js';

describe('constants', () => {
  it('defines the Pakistan IBAN shape', () => {
    expect(COUNTRY_CODE).toBe('PK');
    expect(IBAN_LENGTH).toBe(24);
  });
});
