# Examples

Runnable proof that `pk-bank-utils` works from a plain build output, in all
three module systems.

Run all of them (builds first): `npm run examples`

| File                  | Demonstrates                                            |
| --------------------- | ------------------------------------------------------- |
| `01-validate-iban.ts` | `validateIBAN` / `parseIBAN` on valid + invalid IBANs   |
| `02-parse-iban.ts`    | Destructuring the parsed fields of a valid IBAN         |
| `03-bank-lookup.ts`   | `getBankFromIBAN`, `getBank`, `searchBanks`, `getBanks` |
| `04-masking.ts`       | `formatIBAN`, `maskIBAN`, `maskAccountNumber`           |
| `05-commonjs.cjs`     | Plain-JS `require()` (CommonJS) consumer proof          |
| `06-esm.mjs`          | Plain-JS `import` (ESM) consumer proof                  |
