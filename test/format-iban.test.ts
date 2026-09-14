import {describe, it, expect} from 'vitest';
import {formatIBAN} from '../src/iban/format.js';

describe('formatIBAN', () => {
  it('groups a valid IBAN into 4-character blocks', () => {
    expect(formatIBAN('PK36SCBL0000001123456702')).toBe(
      'PK36 SCBL 0000 0011 2345 6702'
    );
  });

  it('normalizes before formatting', () => {
    expect(formatIBAN('pk36-scbl-0000-0011-2345-6702')).toBe(
      'PK36 SCBL 0000 0011 2345 6702'
    );
  });

  it('formats a partial/in-progress IBAN without requiring validity', () => {
    expect(formatIBAN('PK36SCBL00')).toBe('PK36 SCBL 00');
  });

  it('returns an empty string for non-string input', () => {
    // @ts-expect-error deliberate bad input
    expect(formatIBAN(null)).toBe('');
  });
});
