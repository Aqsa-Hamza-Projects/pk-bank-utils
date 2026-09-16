import {describe, it, expect} from 'vitest';
import {collectAccountHints} from '../src/iban/confusables.js';
import {
  VALID_IBANS,
  LETTER_O_ACCOUNT_IBAN,
  ALL_LETTER_O_ACCOUNT_IBAN,
  UNRECOVERABLE_ACCOUNT_IBAN,
  UNMAPPABLE_LETTER_ACCOUNT_IBAN,
  MIXED_TYPO_ACCOUNT_IBAN,
  RECOVERED_IBAN,
} from './fixtures/ibans.js';

describe('collectAccountHints', () => {
  it('reports nothing for an all-numeric account field', () => {
    expect(collectAccountHints(VALID_IBANS[0] as string)).toEqual({hints: []});
  });

  it('points at a single confusable letter and recovers the IBAN', () => {
    expect(collectAccountHints(LETTER_O_ACCOUNT_IBAN)).toEqual({
      hints: [{position: 8, found: 'O', expected: '0'}],
      suggestion: RECOVERED_IBAN,
    });
  });

  it('points at every confusable letter at once', () => {
    const {hints, suggestion} = collectAccountHints(ALL_LETTER_O_ACCOUNT_IBAN);
    expect(hints).toHaveLength(6);
    expect(hints.map((h) => h.position)).toEqual([8, 9, 10, 11, 12, 13]);
    expect(hints.every((h) => h.found === 'O' && h.expected === '0')).toBe(
      true
    );
    expect(suggestion).toBe(RECOVERED_IBAN);
  });

  it('offers no hint at all when a letter has no intended digit', () => {
    expect(collectAccountHints(UNMAPPABLE_LETTER_ACCOUNT_IBAN)).toEqual({
      hints: [],
    });
  });

  it('withholds a suggestion when the substitution does not checksum', () => {
    const {hints, suggestion} = collectAccountHints(UNRECOVERABLE_ACCOUNT_IBAN);
    expect(hints).toEqual([{position: 8, found: 'S', expected: '5'}]);
    expect(suggestion).toBeUndefined();
  });

  it('still points at a mappable letter sitting beside an unmappable one', () => {
    // The 'O' is worth reporting on its own; the 'X' only costs us the
    // suggestion, because we cannot know what was intended there.
    expect(collectAccountHints(MIXED_TYPO_ACCOUNT_IBAN)).toEqual({
      hints: [{position: 8, found: 'O', expected: '0'}],
    });
  });

  it('maps the full confusable set', () => {
    const found = 'OILSBZG';
    const expected = '0115826';
    for (let i = 0; i < found.length; i++) {
      const iban = `PK36SCBL${found.charAt(i)}000001123456702`;
      expect(collectAccountHints(iban).hints[0]).toEqual({
        position: 8,
        found: found.charAt(i),
        expected: expected.charAt(i),
      });
    }
  });
});
