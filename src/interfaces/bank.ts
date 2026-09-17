export type BankType =
  | 'commercial'
  | 'islamic'
  | 'microfinance'
  | 'digital'
  | 'specialized';

export type BankStatus = 'active' | 'merged' | 'defunct';

export interface Bank {
  /** 4-letter IBAN bank code — characters 5-8 of a PK IBAN. */
  code: string;
  /** Bank's display name. */
  name: string;
  /**
   * Licence class, not product range: a commercial bank that runs an Islamic
   * window is still `'commercial'`.
   */
  type: BankType;
  /**
   * 8-character head-office BIC, or `null` for banks outside the SWIFT
   * network — most microfinance banks issue IBANs without being SWIFT members.
   */
  swift: string | null;
  /** Whether the bank still trades under this code. */
  status: BankStatus;
  /** For `status: 'merged'`, the `code` of the surviving bank. */
  successorCode?: string;
}
