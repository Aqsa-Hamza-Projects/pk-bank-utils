import type {Bank} from '../interfaces/index.js';
import {validateIBAN} from '../iban/validate.js';
import {findBankByCode} from './registry.js';

export function getBank(code: string): Bank | null {
  return findBankByCode(code);
}

export function getBankFromIBAN(iban: string): Bank | null {
  const result = validateIBAN(iban);
  if (!result.bankCode) return null;
  return findBankByCode(result.bankCode);
}
