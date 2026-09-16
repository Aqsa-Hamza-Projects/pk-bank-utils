# Changelog

All notable changes to **pk-bank-utils**.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**How to maintain this file:** on each release, add a new
`## [x.y.z] — YYYY-MM-DD` section on top (matching the `package.json` bump),
grouped into _Added_ / _Changed_ / _Fixed_ / _Removed_.

## [Unreleased]

### Fixed

- `normalizeIBAN` now maps Arabic-Indic and Eastern-Arabic-Indic (Urdu)
  digits to ASCII and strips zero-width characters, the BOM, bidi marks and
  non-breaking spaces. IBANs typed on an Urdu keyboard or pasted from
  WhatsApp were previously rejected as malformed. Every function that
  normalizes first — `validateIBAN`, `parseIBAN`, `formatIBAN`, `maskIBAN`,
  `getBankFromIBAN` — accepts this input as a result.

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
