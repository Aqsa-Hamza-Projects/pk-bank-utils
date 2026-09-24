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
// { code: 'SCBL', name: 'Standard Chartered Bank (Pakistan) Limited',
//   type: 'commercial', islamic: false, swift: 'SCBLPKKX', status: 'active' }
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

| Export              | Signature                                                               |
| ------------------- | ----------------------------------------------------------------------- |
| `validateIBAN`      | `(iban: string, options?: ValidateIBANOptions) => IBANValidationResult` |
| `parseIBAN`         | `(iban: string, options?: ValidateIBANOptions) => IBANValidationResult` |
| `explainIBAN`       | `(iban: string) => IBANExplanation`                                     |
| `normalizeIBAN`     | `(iban: string) => string`                                              |
| `formatIBAN`        | `(iban: string) => string`                                              |
| `maskIBAN`          | `(iban: string) => string`                                              |
| `maskAccountNumber` | `(accountNumber: string) => string`                                     |
| `getBank`           | `(code: string) => Bank \| null`                                        |
| `getBankFromIBAN`   | `(iban: string) => Bank \| null`                                        |
| `searchBanks`       | `(query: string) => Bank[]`                                             |
| `getBanks`          | `() => Bank[]`                                                          |

Plus the exported types `IBANValidationResult`, `IBANExplanation`,
`IBANHint`, `ValidateIBANOptions` and `Bank`.

### `validateIBAN(iban: string, options?: ValidateIBANOptions): IBANValidationResult`

Structural validation (length, country prefix, field character classes)
followed by an ISO 7064 MOD-97 checksum. Never throws — malformed input
returns `{ valid: false, reason: '...' }`.

**The 16-character account field must now be digits only.** Every
SBP-licensed bank issues purely numeric account fields, so a letter there is
a typo — and when its MOD-97 checksum happened to pass, the package
previously reported a wrong IBAN as valid. This is a **breaking change** for
the small number of callers that relied on the ISO registry's `16!c` format.
Pass `{allowAlphanumericAccount: true}` as the second argument to restore
that behaviour.

```ts
validateIBAN('PK36SCBL0000001123456702');
// { valid: true, country: 'PK', checkDigits: '36', bankCode: 'SCBL', accountNumber: '0000001123456702' }

validateIBAN('PK36SCBL0000001123456701');
// { valid: false, reason: 'Invalid check digits', country: 'PK', checkDigits: '36', bankCode: 'SCBL', accountNumber: '0000001123456701' }

validateIBAN('not an iban');
// { valid: false, reason: 'IBAN must be 24 characters, got 9' }

// The letter O is a typo
validateIBAN('PK36SCBLO000001123456702');
// {
//   valid: false,
//   reason: 'Account number must be 16 digits',
//   country: 'PK',
//   checkDigits: '36',
//   bankCode: 'SCBL',
//   accountNumber: 'O000001123456702',
//   hints: [{ position: 8, found: 'O', expected: '0' }],
//   suggestion: 'PK36SCBL0000001123456702'
// }

// Restore the old lenient behaviour with the opt-out
validateIBAN('PK36SCBLO000001123456702', {allowAlphanumericAccount: true});
// { valid: true, country: 'PK', checkDigits: '36', bankCode: 'SCBL', accountNumber: 'O000001123456702' }
```

Accepts lowercase, spaced, and dashed input, Urdu and Arabic-Indic digits,
and text carrying invisible characters from a copy-paste — it normalizes
internally before validating.

Bank-code recognition is **not** part of validity: an IBAN with an unknown
4-letter bank code can still be `valid: true`. Use `getBankFromIBAN` to
look up the name separately.

### `parseIBAN(iban: string, options?: ValidateIBANOptions): IBANValidationResult`

Alias for `validateIBAN` — the same function, offered under the name
you'll also reach for when the goal is extracting fields rather than
checking validity.

### `explainIBAN(iban: string): IBANExplanation`

Reports which characters in the account field are letters that were almost
certainly meant to be digits, and, when substituting all of them yields a
checksum-valid IBAN, the IBAN the user meant. Never throws.

```ts
explainIBAN('PK36SCBLOOOOOO1123456702');
// {
//   normalized: 'PK36SCBLOOOOOO1123456702',
//   valid: false,
//   reason: 'Account number must be 16 digits',
//   hints: [
//     { position: 8, found: 'O', expected: '0' },
//     { position: 9, found: 'O', expected: '0' },
//     { position: 10, found: 'O', expected: '0' },
//     { position: 11, found: 'O', expected: '0' },
//     { position: 12, found: 'O', expected: '0' },
//     { position: 13, found: 'O', expected: '0' }
//   ],
//   suggestion: 'PK36SCBL0000001123456702',
//   message: 'Account number contains 6 non-digit characters. Did you mean PK36SCBL0000001123456702?'
// }
```

### `normalizeIBAN(iban: string): string`

Uppercases and strips whitespace and any dash (hyphen, en dash,
non-breaking hyphen, minus). Also maps Arabic-Indic and Eastern-Arabic-Indic
(Urdu) digits and full-width characters to ASCII, and removes every
invisible Unicode format character — zero-width spaces and joiners, the BOM,
bidi marks and isolates, the Arabic Letter Mark, soft hyphens — the invisible
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
// { code: 'MEZN', name: 'Meezan Bank Limited', type: 'commercial',
//   islamic: true, swift: 'MEZNPKKA', status: 'active' }
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
// [{ code: 'ALFH', name: 'Bank Alfalah Limited', type: 'commercial',
//    islamic: false, swift: 'ALFHPKKA', status: 'active' }]
```

### `getBanks(): Bank[]`

Returns the full registry (a defensive copy — mutating the result doesn't
affect the package's internal data).

### `IBANValidationResult`

| Field           | Type                      | Notes                                                       |
| --------------- | ------------------------- | ----------------------------------------------------------- |
| `valid`         | `boolean`                 | `true` only if structure and checksum both pass             |
| `country`       | `'PK' \| undefined`       | Present once the IBAN is structurally well-formed           |
| `checkDigits`   | `string \| undefined`     | The 2-digit check portion                                   |
| `bankCode`      | `string \| undefined`     | The 4-letter bank code — present even on a checksum failure |
| `accountNumber` | `string \| undefined`     | The remaining 16 characters                                 |
| `reason`        | `string \| undefined`     | Present only when `valid: false`                            |
| `hints`         | `IBANHint[] \| undefined` | Account-field positions holding a likely mistyped digit     |
| `suggestion`    | `string \| undefined`     | The intended IBAN, when substituting every hint checksums   |

### `IBANExplanation`

| Field        | Type                  | Notes                                                                  |
| ------------ | --------------------- | ---------------------------------------------------------------------- |
| `normalized` | `string`              | The uppercased, space/dash-stripped form                               |
| `valid`      | `boolean`             | `true` if the IBAN passed structure and checksum                       |
| `reason`     | `string \| undefined` | Present only when `valid: false`                                       |
| `hints`      | `IBANHint[]`          | Always an array; empty when there is nothing to point at               |
| `suggestion` | `string \| undefined` | Present only when substituting every hint yields a checksum-valid IBAN |
| `message`    | `string`              | A ready-to-log sentence                                                |

### `IBANHint`

| Field      | Type     | Notes                                                                      |
| ---------- | -------- | -------------------------------------------------------------------------- |
| `position` | `number` | 0-based index into the 24-character IBAN; the first account character is 8 |
| `found`    | `string` | The character actually present at that position                            |
| `expected` | `string` | The digit it was almost certainly meant to be                              |

### `Bank`

| Field           | Type                  | Notes                                                       |
| --------------- | --------------------- | ----------------------------------------------------------- |
| `code`          | `string`              | 4-letter IBAN bank identifier (characters 5-8 of a PK IBAN) |
| `name`          | `string`              | Bank's display name                                         |
| `type`          | `BankType`            | Licence class — see below                                   |
| `islamic`       | `boolean`             | Holds a full-fledged Islamic banking licence                |
| `swift`         | `string \| null`      | 8-character head-office BIC; `null` for banks outside SWIFT |
| `status`        | `BankStatus`          | `'active'`, `'merged'` or `'defunct'`                       |
| `successorCode` | `string \| undefined` | For `status: 'merged'`, the `code` of the surviving bank    |

`BankType` is `'commercial' | 'microfinance' | 'digital' | 'specialized'` and
`BankStatus` is `'active' | 'merged' | 'defunct'`. Both are exported.

**`type` and `islamic` are independent axes, deliberately.** Meezan, Dubai
Islamic, BankIslami, MCB Islamic, Al Baraka and Faysal are all scheduled
_commercial_ banks that hold an Islamic licence, so they are
`type: 'commercial'` with `islamic: true`. Folding the two together would mean
`banks.filter((b) => b.type === 'commercial')` silently dropped six of the
largest retail networks in the country.

```ts
// every commercial bank, Islamic or not
getBanks().filter((bank) => bank.type === 'commercial');

// only the full-fledged Islamic banks
getBanks().filter((bank) => bank.islamic);
```

`islamic` is about the **licence, not the product range**: a conventional bank
running an Islamic window is `false`. Faysal Bank is `true` because it
surrendered its conventional licence in January 2023.

`swift` is `null` rather than absent for the banks that issue PK IBANs without
holding a BIC. SWIFT membership serves cross-border correspondent banking, so a
domestic-only microfinance bank has no need of one.

Merged banks stay in the registry so that IBANs issued before the merger still
resolve, and name the bank that took them over:

```ts
getBankFromIBAN('PK24PLCO0000001123456702');
// { code: 'PLCO', name: 'KASB Bank Limited', type: 'commercial',
//   islamic: false, swift: 'PLCOPKKA', status: 'merged',
//   successorCode: 'BKIP' }
```

## Bank registry — accuracy disclaimer

The bank-code directory (`getBank`, `getBankFromIBAN`, `searchBanks`,
`getBanks`) is compiled from the State Bank of
Pakistan's own documents: the [IBAN Guidelines (PSD Circular Letter No. 02 of 2012)](https://archive.sbp.org.pk/psd/2012/IBAN-Guidelines-CL02-2012.pdf),
which establish that the IBAN bank identifier is the first four letters of the
bank's SWIFT BIC, and the [Dams Fund IBAN
notification](https://archive.sbp.org.pk/notifications/FD/DamFund/Detail-1.pdf),
which publishes live IBANs for 36 institutions — including the microfinance
banks that no SWIFT directory lists. Both were cross-checked against
[theswiftcodes.com/pakistan](https://www.theswiftcodes.com/pakistan/). The
registry's size and its verification date are whatever `src/data/banks.json`
says: see `_meta.lastVerified` and the per-source `_meta.sources`.

It is still a point-in-time snapshot rather than an automated feed, and it is
**deliberately incomplete**: a bank is listed only when its code was found in a
source, so several licensed microfinance and digital banks are absent rather
than guessed. Codes, names and coverage may lag renames, mergers and new
entrants. Do not rely on it for compliance-sensitive decisions; verify against
your own bank or payment processor. Corrections and additions are welcome via a
pull request against `src/data/banks.json` — please cite a source.

## What this package does **not** do

- **Does not verify that an account actually exists.** `validateIBAN`
  checks structure and checksum only. Real account verification requires an
  authorized bank/payment API integration, which is outside this package's
  scope by design.
- **A `suggestion` is not a search over arbitrary edits.** It is a
  checksum-confirmed correction of visually confusable characters only
  (O↔0, I/L↔1, S↔5, B↔8, Z↔2, G↔6). It does not claim the account exists.
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
