# pk-bank-utils

**Validate, parse, normalize, format and mask Pakistani IBANs** — plus a
hand-curated bank-code directory — for fintech, wallets, payroll,
e-commerce checkout, accounting and banking-dashboard code. Written in
**TypeScript**, ships with type declarations, and has **zero runtime
dependencies**. Works unchanged in TypeScript, in plain JavaScript with
`import` (ESM), and in plain JavaScript with `require` (CommonJS) — no
build step and no TypeScript toolchain required by the consumer. Everything
runs offline; there are no network calls at runtime.

## Badges

[![npm version](https://img.shields.io/npm/v/pk-bank-utils)](https://www.npmjs.com/package/pk-bank-utils)
[![license MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![types included](https://img.shields.io/badge/types-TypeScript-blue.svg)](https://www.npmjs.com/package/pk-bank-utils)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](./package.json)

## Why

Every Pakistani fintech, wallet, payroll or e-commerce checkout ends up
re-implementing the same handful of things: is this IBAN well-formed, what
bank does it belong to, and how do I show it in a UI or a log without
leaking the whole account number. `pk-bank-utils` handles the boring,
easy-to-get-subtly-wrong parts — ISO 7064 MOD-97 checksums, structural
parsing, masking — so you don't have to.

```ts
import {validateIBAN, getBankFromIBAN} from 'pk-bank-utils';

validateIBAN('PK36SCBL0000001123456702');
// { valid: true, country: 'PK', checkDigits: '36', bankCode: 'SCBL', accountNumber: '0000001123456702' }

getBankFromIBAN('PK36SCBL0000001123456702');
// { code: 'SCBL', name: 'Standard Chartered Bank (Pakistan) Limited' }
```

## Install

```bash
npm install pk-bank-utils
```

```bash
pnpm add pk-bank-utils
```

```bash
yarn add pk-bank-utils
```

Requires Node.js >= 18. No peer dependencies, no runtime dependencies.

## Quick start

The package publishes a dual **ESM + CommonJS** build with `.d.ts` / `.d.cts`
type declarations. Use whichever module system your project already uses —
you do **not** need TypeScript, a bundler, or a build step to consume it.

### TypeScript

```ts
import {
  validateIBAN,
  parseIBAN,
  normalizeIBAN,
  formatIBAN,
  maskIBAN,
  maskAccountNumber,
  getBank,
  getBankFromIBAN,
  searchBanks,
  getBanks,
  type IBANValidationResult,
  type Bank,
} from 'pk-bank-utils';
```

### CommonJS

```js
const {validateIBAN, getBankFromIBAN} = require('pk-bank-utils');
```

### ESM (plain JavaScript)

```js
import {validateIBAN, getBankFromIBAN} from 'pk-bank-utils';
```

## API

All exports come from the package root (`pk-bank-utils`).

| Export              | Signature                                |
| ------------------- | ---------------------------------------- |
| `validateIBAN`      | `(iban: string) => IBANValidationResult` |
| `parseIBAN`         | `(iban: string) => IBANValidationResult` |
| `normalizeIBAN`     | `(iban: string) => string`               |
| `formatIBAN`        | `(iban: string) => string`               |
| `maskIBAN`          | `(iban: string) => string`               |
| `maskAccountNumber` | `(accountNumber: string) => string`      |
| `getBank`           | `(code: string) => Bank \| null`         |
| `getBankFromIBAN`   | `(iban: string) => Bank \| null`         |
| `searchBanks`       | `(query: string) => Bank[]`              |
| `getBanks`          | `() => Bank[]`                           |

Plus the exported types `IBANValidationResult` and `Bank`.

### `validateIBAN(iban: string): IBANValidationResult`

Structural validation (length, country prefix, field character classes)
followed by an ISO 7064 MOD-97 checksum. Never throws — malformed input
returns `{ valid: false, reason: '...' }`.

```ts
validateIBAN('PK36SCBL0000001123456702');
// { valid: true, country: 'PK', checkDigits: '36', bankCode: 'SCBL', accountNumber: '0000001123456702' }

validateIBAN('PK36SCBL0000001123456701');
// { valid: false, reason: 'Invalid check digits', country: 'PK', checkDigits: '36', bankCode: 'SCBL', accountNumber: '0000001123456701' }

validateIBAN('not an iban');
// { valid: false, reason: 'IBAN must be 24 characters, got 9' }
```

Accepts lowercase, spaced, and dashed input, Urdu and Arabic-Indic digits,
and text carrying invisible characters from a copy-paste — it normalizes
internally before validating.

Bank-code recognition is **not** part of validity: an IBAN with an unknown
4-letter bank code can still be `valid: true`. Use `getBankFromIBAN` to
look up the name separately.

### `parseIBAN(iban: string): IBANValidationResult`

Alias for `validateIBAN` — the same function, offered under the name
you'll also reach for when the goal is extracting fields rather than
checking validity.

### `normalizeIBAN(iban: string): string`

Uppercases and strips whitespace/dashes. Also maps Arabic-Indic and
Eastern-Arabic-Indic (Urdu) digits to ASCII and removes zero-width
characters, the BOM, bidi marks and non-breaking spaces — the invisible
passengers that ride along when an IBAN is pasted from WhatsApp or a bank
app's share sheet. Does not validate.

```ts
normalizeIBAN('pk36 scbl 0000 0011 2345 6702');
// 'PK36SCBL0000001123456702'
```

### `formatIBAN(iban: string): string`

Groups into 4-character blocks for display. Works on partial input too, so
it's safe to call on every keystroke of an IBAN input field.

```ts
formatIBAN('PK36SCBL0000001123456702');
// 'PK36 SCBL 0000 0011 2345 6702'
```

### `maskIBAN(iban: string): string`

Keeps the country code, check digits, bank code and last 4 account digits
visible; masks the rest. Falls back to a shorter reveal on abnormally short
input rather than throwing.

```ts
maskIBAN('PK36SCBL0000001123456702');
// 'PK36SCBL************6702'
```

### `maskAccountNumber(accountNumber: string): string`

Generic account-number masking — keeps the last 4 characters, masks the
rest. Input of 4 characters or fewer is returned unchanged.

```ts
maskAccountNumber('0000001123456702');
// '************6702'
```

### `getBank(code: string): Bank | null`

Looks up a bank by its 4-letter code (case-insensitive). `null` if the code
isn't in the registry.

```ts
getBank('MEZN');
// { code: 'MEZN', name: 'Meezan Bank' }
```

### `getBankFromIBAN(iban: string): Bank | null`

Extracts the bank code from an IBAN and looks it up. Works even when the
IBAN's checksum is wrong, as long as the bank-code position is
well-formed — `null` only when the IBAN is structurally malformed or the
code isn't in the registry.

### `searchBanks(query: string): Bank[]`

Case-insensitive substring match on bank name. An empty query returns `[]`
(use `getBanks()` for the full list).

```ts
searchBanks('alfalah');
// [{ code: 'ALFH', name: 'Bank Alfalah Limited' }]
```

### `getBanks(): Bank[]`

Returns the full registry (a defensive copy — mutating the result doesn't
affect the package's internal data).

### `IBANValidationResult`

| Field           | Type                  | Notes                                                       |
| --------------- | --------------------- | ----------------------------------------------------------- |
| `valid`         | `boolean`             | `true` only if structure and checksum both pass             |
| `country`       | `'PK' \| undefined`   | Present once the IBAN is structurally well-formed           |
| `checkDigits`   | `string \| undefined` | The 2-digit check portion                                   |
| `bankCode`      | `string \| undefined` | The 4-letter bank code — present even on a checksum failure |
| `accountNumber` | `string \| undefined` | The remaining 16 characters                                 |
| `reason`        | `string \| undefined` | Present only when `valid: false`                            |

### `Bank`

| Field  | Type     | Notes                    |
| ------ | -------- | ------------------------ |
| `code` | `string` | 4-letter bank identifier |
| `name` | `string` | Bank's display name      |

## Bank registry — accuracy disclaimer

The bank-code directory (`getBank`, `getBankFromIBAN`, `searchBanks`,
`getBanks`) is a **hand-curated, best-effort list** compiled from public
bank and IBAN-format documentation — it is not sourced from an automated
feed of the State Bank of Pakistan's official registry. Codes, names, and
which banks are listed may lag real-world changes, renamings, mergers, or
new entrants. Do not rely on it for compliance-sensitive decisions; verify
against your own bank or payment processor. Corrections and additions are
welcome via a pull request against `src/data/banks.json`.

## What this package does **not** do

- **Does not verify that an account actually exists.** `validateIBAN`
  checks structure and checksum only. Real account verification requires an
  authorized bank/payment API integration, which is outside this package's
  scope by design.
- **Does not validate non-Pakistani IBANs.**
- **Does not include SWIFT/BIC parsing, Raast identifiers, or phone-number
  utilities** in this release.

## Examples

Runnable scripts covering every public function live in
[`examples/`](./examples) (not shipped in the npm tarball, but exercised by
the test suite so they never rot):

```bash
npm run examples
```

| File                  | Shows                                                   |
| --------------------- | ------------------------------------------------------- |
| `01-validate-iban.ts` | `validateIBAN` / `parseIBAN` on valid and invalid IBANs |
| `02-parse-iban.ts`    | Destructuring the parsed fields of a valid IBAN         |
| `03-bank-lookup.ts`   | `getBankFromIBAN`, `getBank`, `searchBanks`, `getBanks` |
| `04-masking.ts`       | `formatIBAN`, `maskIBAN`, `maskAccountNumber`           |
| `05-commonjs.cjs`     | the CommonJS build via `require('pk-bank-utils')`       |
| `06-esm.mjs`          | the ESM build via `import` in plain JavaScript          |

## Changelog

All notable changes are recorded in [CHANGELOG.md](./CHANGELOG.md),
following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Contributing

Issues and pull requests are welcome at the
[GitHub repository](https://github.com/Aqsa-Hamza-Projects/pk-bank-utils).
After cloning, enable the Git pre-commit hook once:

```bash
npm install
npm run hooks:install
```

The local gate that must pass:

```bash
npm run typecheck && npm run lint && npm run format:check && npm run build && npm test && npm run examples
```

The most useful contribution is verifying and extending
`src/data/banks.json` against an authoritative source (see the accuracy
disclaimer above).

## License

MIT © Aqsa LogicByte
