import type {Bank} from '../interfaces/index.js';
import {getAllBanks} from './registry.js';

export function getBanks(): Bank[] {
  return getAllBanks();
}

export function searchBanks(query: string): Bank[] {
  if (typeof query !== 'string' || query.trim() === '') return [];
  const needle = query.trim().toLowerCase();
  return getAllBanks().filter((bank) =>
    bank.name.toLowerCase().includes(needle)
  );
}
