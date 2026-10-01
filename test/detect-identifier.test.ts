import {describe, it, expect} from 'vitest';
import {detectIdentifier} from '../src/detect/identifier.js';
import {VALID_IBANS, INVALID_CHECKSUM_IBAN} from './fixtures/ibans.js';
import {CANONICAL_RAAST_ID, RAAST_EQUIVALENT_FORMS} from './fixtures/raast.js';

describe('detectIdentifier', () => {
  it('detects a valid IBAN with high confidence and no rivals', () => {
    const result = detectIdentifier(VALID_IBANS[0] as string);
    expect(result.kind).toBe('iban');
    expect(result.normalized).toBe(VALID_IBANS[0] as string);
    expect(result.candidates).toEqual([
      {kind: 'iban', confidence: 'high', normalized: result.normalized},
    ]);
  });

  it('still calls a checksum-failing PK IBAN an IBAN, at lower confidence', () => {
    const result = detectIdentifier(INVALID_CHECKSUM_IBAN);
    expect(result.kind).toBe('iban');
    expect(result.candidates).toEqual([
      {kind: 'iban', confidence: 'medium', normalized: result.normalized},
    ]);
  });

  it.each(RAAST_EQUIVALENT_FORMS)('detects %s as a Raast mobile', (form) => {
    const result = detectIdentifier(form);
    expect(result.kind).toBe('raast-mobile');
    expect(result.normalized).toBe(CANONICAL_RAAST_ID);
  });

  it('surfaces account-number as a lower-ranked candidate for a mobile', () => {
    const result = detectIdentifier(CANONICAL_RAAST_ID);
    expect(result.candidates).toEqual([
      {
        kind: 'raast-mobile',
        confidence: 'high',
        normalized: CANONICAL_RAAST_ID,
      },
      {
        kind: 'account-number',
        confidence: 'low',
        normalized: CANONICAL_RAAST_ID,
      },
    ]);
  });

  it('detects a plain digit run as an account number', () => {
    const result = detectIdentifier('0000001123456702');
    expect(result.kind).toBe('account-number');
    expect(result.candidates).toEqual([
      {
        kind: 'account-number',
        confidence: 'medium',
        normalized: '0000001123456702',
      },
    ]);
  });

  it('does not lose the digits when a bare 92 number is read as a mobile', () => {
    const result = detectIdentifier('923001234567');
    expect(result.kind).toBe('raast-mobile');
    const account = result.candidates.find((c) => c.kind === 'account-number');
    expect(account?.normalized).toBe('923001234567');
  });

  it('marks a speculative bare-92 fold as medium confidence, not high', () => {
    const result = detectIdentifier('923456789012');
    expect(result.kind).toBe('raast-mobile');
    expect(result.candidates).toEqual([
      {kind: 'raast-mobile', confidence: 'medium', normalized: '03456789012'},
      {
        kind: 'account-number',
        confidence: 'medium',
        normalized: '923456789012',
      },
    ]);
  });

  it('keeps high confidence for an explicit +92 international form', () => {
    const result = detectIdentifier('+92 300 1234567');
    expect(result.kind).toBe('raast-mobile');
    expect(result.candidates).toEqual([
      {
        kind: 'raast-mobile',
        confidence: 'high',
        normalized: CANONICAL_RAAST_ID,
      },
      {
        kind: 'account-number',
        confidence: 'low',
        normalized: '+923001234567',
      },
    ]);
  });

  it('treats a 9-digit run as unknown (below the account-number range)', () => {
    const result = detectIdentifier('123456789');
    expect(result.kind).toBe('unknown');
  });

  it('treats a 16-digit run as an account number (top of the range)', () => {
    const result = detectIdentifier('1234567890123456');
    expect(result.kind).toBe('account-number');
  });

  it('treats a 17-digit run as unknown (above the account-number range)', () => {
    const result = detectIdentifier('12345678901234567');
    expect(result.kind).toBe('unknown');
  });

  it('returns unknown with no candidates for unrecognisable input', () => {
    const result = detectIdentifier('hello world');
    expect(result.kind).toBe('unknown');
    expect(result.candidates).toEqual([]);
  });

  it('returns unknown for empty and non-string input', () => {
    expect(detectIdentifier('').kind).toBe('unknown');
    // @ts-expect-error deliberate bad input
    expect(detectIdentifier(null).kind).toBe('unknown');
    // @ts-expect-error deliberate bad input
    expect(detectIdentifier(null).normalized).toBe('');
  });

  it('never throws', () => {
    // @ts-expect-error deliberate bad input
    expect(() => detectIdentifier(123)).not.toThrow();
  });

  it('does not mangle an account number that looks like a dialling prefix', () => {
    for (const raw of [
      '0092001123456702',
      '0092123456789012',
      '920011234567',
    ]) {
      const result = detectIdentifier(raw);
      expect(result.kind).toBe('account-number');
      expect(result.normalized).toBe(raw);
    }
  });

  it('still normalizes separators and Urdu digits for account numbers', () => {
    expect(detectIdentifier('0000-0011 2345 6702').normalized).toBe(
      '0000001123456702'
    );
  });
});
