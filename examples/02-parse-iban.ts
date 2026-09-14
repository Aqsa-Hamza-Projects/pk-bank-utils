import {parseIBAN} from '../dist/index.js';

const result = parseIBAN('PK36SCBL0000001123456702');

if (result.valid) {
  console.log(`Country: ${result.country}`);
  console.log(`Check digits: ${result.checkDigits}`);
  console.log(`Bank code: ${result.bankCode}`);
  console.log(`Account number: ${result.accountNumber}`);
} else {
  console.log('Invalid IBAN:', result.reason);
}
