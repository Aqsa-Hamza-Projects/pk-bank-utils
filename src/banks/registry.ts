import banksJson from '../data/banks.json' with {type: 'json'};
import type {Bank} from '../interfaces/index.js';

interface BanksFile {
  banks: Bank[];
}

let codeIndex: Map<string, Bank> | null = null;

function getBanksList(): Bank[] {
  return (banksJson as BanksFile).banks;
}

function getCodeIndex(): Map<string, Bank> {
  if (codeIndex) return codeIndex;
  codeIndex = new Map(
    getBanksList().map((bank) => [bank.code.toUpperCase(), bank])
  );
  return codeIndex;
}

export function getAllBanks(): Bank[] {
  return getBanksList().map((bank) => ({...bank}));
}

export function findBankByCode(code: string): Bank | null {
  if (typeof code !== 'string' || code.trim() === '') return null;
  const hit = getCodeIndex().get(code.toUpperCase());
  return hit ? {...hit} : null;
}
