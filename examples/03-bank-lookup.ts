import {
  getBankFromIBAN,
  getBank,
  searchBanks,
  getBanks,
} from '../dist/index.js';

console.log('From IBAN:', getBankFromIBAN('PK36SCBL0000001123456702'));
console.log('By code:', getBank('MEZN'));
console.log('Search "alfalah":', searchBanks('alfalah'));
console.log('Total banks in registry:', getBanks().length);
