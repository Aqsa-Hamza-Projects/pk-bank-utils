import type {IBANHint} from './iban-explanation.js';

export interface IBANValidationResult {
  valid: boolean;
  country?: 'PK';
  checkDigits?: string;
  bankCode?: string;
  accountNumber?: string;
  reason?: string;
  /** Positions in the account field holding a letter that is almost certainly
   * a mistyped digit. Present only when there is at least one. */
  hints?: IBANHint[];
  /** The IBAN the user probably meant — present only when substituting every
   * hint produces a checksum-valid IBAN. */
  suggestion?: string;
}
