import {explainIBAN, validateIBAN} from '../dist/index.js';

// A single mistyped 'O' whose checksum passes by coincidence
console.log('Single mistyped O:');
console.log(explainIBAN('PK36SCBLO000001123456702'));
console.log();

// Typed entirely with the letter O
console.log('Entirely Os:');
console.log(explainIBAN('PK36SCBLOOOOOO1123456702'));
console.log();

// Nothing to explain
console.log('Valid IBAN:');
console.log(explainIBAN('PK36SCBL0000001123456702'));
console.log();

// The opt-out: accept the letter O with lenient mode
console.log('Lenient mode opt-out:');
console.log(
  validateIBAN('PK36SCBLO000001123456702', {allowAlphanumericAccount: true})
);
