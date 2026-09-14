import {validateIBAN, parseIBAN} from '../dist/index.js';

const ibans = [
  'PK36SCBL0000001123456702',
  'pk36 scbl 0000 0011 2345 6702',
  'PK36SCBL0000001123456701',
  'not-an-iban',
];

for (const iban of ibans) {
  console.log('IN :', iban);
  console.log('OUT:', validateIBAN(iban));
  console.log();
}

console.log('parseIBAN alias:', parseIBAN('PK36SCBL0000001123456702'));
