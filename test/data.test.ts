import {describe, it, expect} from 'vitest';
import banksJson from '../src/data/banks.json' with {type: 'json'};
import {getBankFromIBAN} from '../src/banks/lookup.js';

interface BanksFile {
  _meta: {
    source: string;
    lastVerified: string;
    disclaimer: string;
    sources: {name: string; url: string; retrieved: string; covers: string}[];
  };
  banks: {
    code: string;
    name: string;
    type: string;
    swift: string | null;
    status: string;
    successorCode?: string;
  }[];
}

const BANK_TYPES = [
  'commercial',
  'islamic',
  'microfinance',
  'digital',
  'specialized',
];
const BANK_STATUSES = ['active', 'merged', 'defunct'];

/**
 * Codes whose IBAN identifier is not its BIC prefix. Empty today: every entry
 * that has a `swift` satisfies the SBP rule. Kept so that a future divergence
 * has to be declared here, with its evidence, rather than silently weakening
 * the assertion below.
 */
const CODE_BIC_DIVERGENCE = new Set<string>([]);

function mod97(digits: string): number {
  let rem = 0;
  for (const ch of digits) rem = (rem * 10 + Number(ch)) % 97;
  return rem;
}

/** Builds a checksum-valid PK IBAN for a bank code, as the reproduction did. */
function buildIBAN(code: string, account = '0000001123456702'): string {
  const rearranged = [...(code + account + 'PK00')]
    .map((c) => (/[0-9]/.test(c) ? c : String(c.charCodeAt(0) - 55)))
    .join('');
  const check = String(98 - mod97(rearranged)).padStart(2, '0');
  return `PK${check}${code}${account}`;
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

  it('cites each source with a URL and a retrieval date', () => {
    expect(data._meta.sources.length).toBeGreaterThan(0);
    for (const source of data._meta.sources) {
      expect(source.name.length).toBeGreaterThan(0);
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.covers.length).toBeGreaterThan(0);
    }
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

describe('banks.json structure', () => {
  const data = banksJson as BanksFile;

  it('gives every bank a valid type and status', () => {
    for (const bank of data.banks) {
      expect(BANK_TYPES, bank.code).toContain(bank.type);
      expect(BANK_STATUSES, bank.code).toContain(bank.status);
    }
  });

  it('gives every bank a null or well-formed 8-character BIC', () => {
    for (const bank of data.banks) {
      if (bank.swift === null) continue;
      expect(bank.swift, bank.code).toMatch(/^[A-Z]{4}PK[A-Z0-9]{2}$/);
    }
  });

  it('matches each code to its BIC prefix (SBP IBAN Guidelines rule)', () => {
    for (const bank of data.banks) {
      if (bank.swift === null) continue;
      if (CODE_BIC_DIVERGENCE.has(bank.code)) continue;
      expect(bank.swift.slice(0, 4), bank.code).toBe(bank.code);
    }
  });

  it('has no duplicate BIC', () => {
    const swifts = data.banks
      .map((bank) => bank.swift)
      .filter((swift): swift is string => swift !== null);
    expect(new Set(swifts).size).toBe(swifts.length);
  });

  it('points every merged bank at a successor that exists', () => {
    const codes = new Set(data.banks.map((bank) => bank.code));
    for (const bank of data.banks) {
      if (bank.successorCode === undefined) continue;
      expect(bank.status, bank.code).toBe('merged');
      expect(codes.has(bank.successorCode), bank.code).toBe(true);
    }
  });

  it('is sorted by code', () => {
    const codes = data.banks.map((bank) => bank.code);
    expect(codes).toEqual([...codes].sort());
  });

  it('covers the licence classes that issue PK IBANs', () => {
    const types = new Set(data.banks.map((bank) => bank.type));
    expect(types).toContain('commercial');
    expect(types).toContain('islamic');
    expect(types).toContain('microfinance');
    expect(types).toContain('digital');
    expect(types).toContain('specialized');
    expect(data.banks.length).toBeGreaterThanOrEqual(39);
  });
});

describe('bank codes reported unresolved in FINDINGS PR-B3', () => {
  // Only the codes that a cited source confirms. SILK, ESPA, NRSP, APNA, KHUS
  // and FINC stay out of the registry until one does — see the PR body.
  it.each(['BAHL', 'TMFB', 'ZTBL', 'UMBL'])('resolves %s', (code) => {
    const bank = getBankFromIBAN(buildIBAN(code));
    expect(bank).not.toBeNull();
    expect(bank?.code).toBe(code);
  });
});

describe('merged banks still resolve old IBANs', () => {
  it.each([
    ['PLCO', 'BKIP'], // KASB Bank -> BankIslami, 2015
    ['NIBP', 'MUCB'], // NIB Bank -> MCB, 2017
    ['SAUD', 'UNIL'], // Silkbank -> United Bank, 2025
  ])('resolves %s and names its successor', (code, successor) => {
    const bank = getBankFromIBAN(buildIBAN(code));
    expect(bank).not.toBeNull();
    expect(bank?.status).toBe('merged');
    expect(bank?.successorCode).toBe(successor);
  });

  it('resolves Summit Bank under its renamed identity', () => {
    // Summit Bank -> Bank Makramah, 2023. A rename, not a merger, so the
    // bank is still active under the same code.
    const bank = getBankFromIBAN(buildIBAN('SUMB'));
    expect(bank?.name).toBe('Bank Makramah Limited');
    expect(bank?.status).toBe('active');
  });
});
