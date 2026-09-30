import {describe, it, expect} from 'vitest';
import {maskRaastId} from '../src/raast/mask.js';
import {
  RAAST_EQUIVALENT_FORMS,
  URDU_DIGITS_RAAST_ID,
  TOO_SHORT_RAAST_ID,
} from './fixtures/raast.js';

describe('maskRaastId', () => {
  it.each(RAAST_EQUIVALENT_FORMS)('masks %s consistently', (form) => {
    expect(maskRaastId(form)).toBe('0300*****67');
  });

  it('masks Urdu-digit input after normalizing it', () => {
    expect(maskRaastId(URDU_DIGITS_RAAST_ID)).toBe('0300*****67');
  });

  it('never reveals more than 6 of the 11 digits', () => {
    const revealed = maskRaastId('03001234567').replace(/\*/g, '');
    expect(revealed.length).toBeLessThanOrEqual(6);
  });

  it('does not leak input that is not a valid Raast ID', () => {
    expect(maskRaastId(TOO_SHORT_RAAST_ID)).toBe('******3456');
  });

  it('preserves the length of a 16-digit account number instead of folding it as a phone number', () => {
    const masked = maskRaastId('0092001123456702');
    expect(masked).toHaveLength(16);
    expect(masked).toBe('************6702');
  });

  it('returns an empty string for non-string input', () => {
    // @ts-expect-error deliberate bad input
    expect(maskRaastId(null)).toBe('');
  });

  it('never throws', () => {
    // @ts-expect-error deliberate bad input
    expect(() => maskRaastId(123)).not.toThrow();
  });
});
