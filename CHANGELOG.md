# Changelog

All notable changes to **pk-bank-utils**.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**How to maintain this file:** on each release, add a new
`## [x.y.z] — YYYY-MM-DD` section on top (matching the `package.json` bump),
grouped into _Added_ / _Changed_ / _Fixed_ / _Removed_.

## [Unreleased]

## [0.0.3] — 2026-09-24

### Added

- `explainIBAN(iban)` — reports which characters in the account field are
  letters that were almost certainly meant to be digits, at which position,
  and, when substituting all of them yields a checksum-valid IBAN, the IBAN
  the user meant. `IBANValidationResult` gains the same `hints` and
  `suggestion` fields.

### Changed

- **Breaking.** `validateIBAN` and `parseIBAN` now require the 16-character
  account field to be digits only. Every SBP-licensed bank issues purely
  numeric account fields, so a letter there is a typo — and when its MOD-97
  checksum happened to pass, the package previously reported a wrong IBAN as
  valid. Pass `{allowAlphanumericAccount: true}` as the second argument to
  restore the ISO-registry-faithful `16!c` behaviour.

## [0.0.2] — 2026-09-24

### Fixed

- `normalizeIBAN` now maps Arabic-Indic and Eastern-Arabic-Indic (Urdu)
  digits and full-width characters to ASCII, strips every invisible Unicode
  format character (zero-width spaces and joiners, the BOM, bidi marks and
  isolates, the Arabic Letter Mark, soft hyphens) and treats any dash —
  en dash, non-breaking hyphen, minus sign — as a separator. IBANs typed on
  an Urdu keyboard or pasted from WhatsApp were previously rejected as
  malformed. Every function that normalizes first — `validateIBAN`,
  `parseIBAN`, `formatIBAN`, `maskIBAN`, `getBankFromIBAN` — accepts this
  input as a result.
- `validateIBAN` reports input made only of invisible characters or
  separators as empty (`IBAN must be a non-empty string`) rather than as
  `IBAN must be 24 characters, got 0`.

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
