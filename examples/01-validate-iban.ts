import {validateIBAN, parseIBAN} from '../dist/index.js';

const ibans = [
  'PK36SCBL0000001123456702',
  'pk36 scbl 0000 0011 2345 6702',
  // Urdu keyboard digits plus a zero-width space and NBSP from a paste.
  // Written as escape sequences because the characters are invisible.
  'PK36\u200BSCBL\u00A0\u06F0\u06F0\u06F0\u06F0\u06F0\u06F0\u06F1\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F0\u06F2',
  'PK36SCBL0000001123456701',
  'not-an-iban',
];

for (const iban of ibans) {
  console.log('IN :', iban);
  console.log('OUT:', validateIBAN(iban));
  console.log();
}

console.log('parseIBAN alias:', parseIBAN('PK36SCBL0000001123456702'));
