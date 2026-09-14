export interface IBANValidationResult {
  valid: boolean;
  country?: 'PK';
  checkDigits?: string;
  bankCode?: string;
  accountNumber?: string;
  reason?: string;
}
