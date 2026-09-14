import {maskIBAN, formatIBAN, maskAccountNumber} from '../dist/index.js';

const iban = 'PK36SCBL0000001123456702';

console.log('Formatted:', formatIBAN(iban));
console.log('Masked IBAN:', maskIBAN(iban));
console.log('Masked account number:', maskAccountNumber('0000001123456702'));
