import {describe, it, expect} from 'vitest';
import {getAllocatedOperator, OPERATOR_RANGES} from '../src/raast/operators.js';

describe('getAllocatedOperator', () => {
  it.each([
    ['03001234567', 'Jazz'],
    ['03091234567', 'Jazz'],
    ['03201234567', 'Jazz'],
    ['03291234567', 'Jazz'],
    ['03101234567', 'Zong'],
    ['03191234567', 'Zong'],
    ['03701234567', 'Zong'],
    ['03711234567', 'Zong'],
    ['03301234567', 'Ufone'],
    ['03391234567', 'Ufone'],
    ['03401234567', 'Telenor'],
    ['03491234567', 'Telenor'],
    ['03551234567', 'SCOM'],
  ])('maps %s to %s', (id, operator) => {
    expect(getAllocatedOperator(id)).toBe(operator);
  });

  it('returns null for a prefix that is not in our table', () => {
    expect(getAllocatedOperator('03601234567')).toBeNull();
    expect(getAllocatedOperator('03501234567')).toBeNull();
  });

  it('returns null for input that is not a normalized mobile number', () => {
    expect(getAllocatedOperator('')).toBeNull();
    expect(getAllocatedOperator('0300')).toBeNull();
    // @ts-expect-error deliberate bad input
    expect(getAllocatedOperator(null)).toBeNull();
  });

  it('returns null instead of a false match for non-digit characters', () => {
    expect(getAllocatedOperator('0300abcdefg')).toBeNull();
  });
});

describe('OPERATOR_RANGES', () => {
  it('never labels a range as unallocated', () => {
    for (const range of OPERATOR_RANGES) {
      expect(range.operator).toBeTruthy();
      expect(range.operator.toLowerCase()).not.toContain('unalloc');
    }
  });

  it('has no overlapping ranges', () => {
    const seen = new Set<number>();
    for (const range of OPERATOR_RANGES) {
      for (let p = range.from; p <= range.to; p++) {
        expect(seen.has(p)).toBe(false);
        seen.add(p);
      }
    }
  });

  it('carries a confidence marker on every range', () => {
    for (const range of OPERATOR_RANGES) {
      expect(['primary', 'secondary', 'low']).toContain(range.confidence);
    }
  });
});
