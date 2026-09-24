export type BankType =
  'commercial' | 'microfinance' | 'digital' | 'specialized';

export type BankStatus = 'active' | 'merged' | 'defunct';

export interface Bank {
  /** 4-letter IBAN bank code — characters 5-8 of a PK IBAN. */
  code: string;
  /** Bank's display name. */
  name: string;
  /**
   * The class of licence SBP granted. Independent of `islamic`: Meezan is a
   * scheduled commercial bank that happens to hold an Islamic licence, so it
   * is `'commercial'` with `islamic: true`.
   */
  type: BankType;
  /**
   * Whether the bank operates under a full-fledged Islamic banking licence.
   * This is about the licence, not the product range — a conventional bank
   * running an Islamic window is `false`.
   */
  islamic: boolean;
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
