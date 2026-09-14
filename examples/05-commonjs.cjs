const {validateIBAN, getBankFromIBAN} = require('../dist/index.cjs');

console.log(validateIBAN('PK36SCBL0000001123456702'));
console.log(getBankFromIBAN('PK36SCBL0000001123456702'));
