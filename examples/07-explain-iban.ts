import {explainIBAN, validateIBAN} from '../dist/index.js';

const ibans = [
  // A single mistyped 'O' whose checksum passes by coincidence
  'PK36SCBLO000001123456702',
  // Typed entirely with the letter O
  'PK36SCBLOOOOOO1123456702',
  // Nothing to explain
  'PK36SCBL0000001123456702',
];

for (const iban of ibans) {
  console.log('IN :', iban);
  console.log('OUT:', explainIBAN(iban));
  console.log();
}

// The opt-out: accept the letter O with lenient mode
console.log(
  'lenient mode:',
  validateIBAN('PK36SCBLO000001123456702', {allowAlphanumericAccount: true})
);
