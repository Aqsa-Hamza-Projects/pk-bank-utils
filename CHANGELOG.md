# Changelog

All notable changes to **pk-bank-utils**.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**How to maintain this file:** on each release, add a new
`## [x.y.z] — YYYY-MM-DD` section on top (matching the `package.json` bump),
grouped into _Added_ / _Changed_ / _Fixed_ / _Removed_.

## [Unreleased]

### Added

- `Bank` now carries `type`, `islamic`, `swift`, `status` and an optional
  `successorCode`, so callers can tell a microfinance bank from a commercial
  one and can still resolve an IBAN issued by a bank that has since merged.
- `islamic` is a separate boolean rather than a `type` variant. Licence class
  and Shariah compliance are independent: Meezan, Dubai Islamic, BankIslami,
  MCB Islamic, Al Baraka and Faysal are scheduled _commercial_ banks holding an
  Islamic licence, so `type: 'commercial'` with `islamic: true`. Folding them
  into a single `'islamic'` type would make
  `banks.filter((b) => b.type === 'commercial')` drop six of the largest retail
  networks in Pakistan.
- `BankType` and `BankStatus` are exported. `BankType` is
  `'commercial' | 'microfinance' | 'digital' | 'specialized'`.
- `_meta.sources` in `src/data/banks.json` records each source, its retrieval
  date and what it covers.

### Changed

- The bank registry grew from 22 to 39 entries, rebuilt from the State Bank of
  Pakistan's IBAN Guidelines and its Dams Fund IBAN notification, cross-checked
  against theswiftcodes.com. Adds Bank Al Habib, Samba, MCB Islamic, Citibank,
  Deutsche Bank, ICBC, Bank of China, MUFG, ZTBL, SME Bank, Easypaisa Bank and
  three microfinance banks, plus the merged KASB, NIB and Burj banks.
- Three bank codes were corrected to the identifiers SBP actually publishes:
  `ALBA` to `AIIN` (Al Baraka), `SUMM` to `SUMB` (Summit, now Bank Makramah)
  and `FWBL` to `FWOM` (First Women Bank). SBP's IBAN Guidelines require the
  bank identifier to be the first four letters of the bank's SWIFT BIC; the old
  values were the banks' acronyms and appear in no source, so no real IBAN
  could have contained them.
- Bank names now use their full legal form, for example `Meezan Bank` became
  `Meezan Bank Limited`.

### Removed

- `getBank('ALBA')`, `getBank('SUMM')` and `getBank('FWBL')` now return `null`.
  These codes were never issued by SBP, so `getBankFromIBAN` could never have
  returned them, but a caller who hard-coded one will see the change.

### Note for the release

Adding required fields to `Bank` is source-compatible for code that reads a
`Bank`, but breaking for code that constructs one. Together with the account
strictness in PR-B2 this argues for 0.1.0 rather than 0.0.2.

## [0.0.1] — 2026-09-14

First release.

### Added

- `validateIBAN(iban)` / `parseIBAN(iban)` — structural + ISO 7064 MOD-97
  validation of Pakistani IBANs, returning country, check digits, bank code
  and account number.
- `normalizeIBAN(iban)` — strips whitespace/dashes and uppercases.
- `formatIBAN(iban)` — 4-character grouped display form.
- `maskIBAN(iban)` / `maskAccountNumber(accountNumber)` — masking utilities
  for logs, dashboards and support tooling.
- `getBank(code)`, `getBankFromIBAN(iban)`, `searchBanks(query)`,
  `getBanks()` — a hand-curated Pakistani bank-code directory (best-effort,
  see `README.md` for the accuracy disclaimer).
- Dual ESM + CJS build via tsup, `.d.ts`/`.d.cts` type declarations, zero
  runtime dependencies.
