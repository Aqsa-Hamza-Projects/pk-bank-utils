import {describe, it, expect} from 'vitest';
import banksJson from '../src/data/banks.json' with {type: 'json'};

interface BanksFile {
  _meta: {source: string; lastVerified: string; disclaimer: string};
  banks: {code: string; name: string}[];
}

describe('banks.json', () => {
  const data = banksJson as BanksFile;

  it('has the expected top-level shape', () => {
    expect(data._meta).toBeDefined();
    expect(Array.isArray(data.banks)).toBe(true);
  });

  it('carries provenance metadata', () => {
    expect(typeof data._meta.source).toBe('string');
    expect(data._meta.source.length).toBeGreaterThan(0);
    expect(typeof data._meta.lastVerified).toBe('string');
    expect(typeof data._meta.disclaimer).toBe('string');
    expect(data._meta.disclaimer.length).toBeGreaterThan(0);
  });

  it('is non-empty', () => {
    expect(data.banks.length).toBeGreaterThan(0);
  });

  it('has unique, well-formed 4-letter bank codes', () => {
    const codes = data.banks.map((bank) => bank.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z]{4}$/);
    }
  });

  it('has a non-empty name for every bank', () => {
    for (const bank of data.banks) {
      expect(typeof bank.name).toBe('string');
      expect(bank.name.trim().length).toBeGreaterThan(0);
    }
  });
});
