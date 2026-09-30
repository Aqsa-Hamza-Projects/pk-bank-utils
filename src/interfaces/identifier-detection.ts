export type IdentifierKind =
  'iban' | 'raast-mobile' | 'account-number' | 'unknown';

export interface IdentifierCandidate {
  kind: IdentifierKind;
  confidence: 'high' | 'medium' | 'low';
  /**
   * The input cleaned the way THIS kind would clean it. A number can be
   * read as more than one kind, and each reading normalizes differently —
   * a Raast reading folds a leading 92 into 03, an account-number reading
   * must keep the digits exactly as typed. Carrying one value per candidate
   * means choosing a different candidate never loses the user's digits.
   */
  normalized: string;
}

export interface IdentifierDetection {
  /** The most likely kind. Read `candidates` when the input is ambiguous. */
  kind: IdentifierKind;
  /** Equal to `candidates[0].normalized`. */
  normalized: string;
  /**
   * Every kind the input could be, most likely first. An 11-digit 03 number
   * is both a valid Raast ID and a plausible account number, so a caller
   * that must be certain should ask the user rather than trust `kind`.
   */
  candidates: IdentifierCandidate[];
}
