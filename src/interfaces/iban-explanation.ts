export interface IBANHint {
  /** 0-based index into the *normalized* 24-character IBAN, so the first
   * account character is 8. Usable directly for caret placement. */
  position: number;
  /** The character actually present at that position. */
  found: string;
  /** The digit it was almost certainly meant to be. */
  expected: string;
}

export interface IBANExplanation {
  normalized: string;
  valid: boolean;
  reason?: string;
  /** Always an array — empty when there is nothing to point at. */
  hints: IBANHint[];
  /** Present only when substituting every hint yields a checksum-valid IBAN. */
  suggestion?: string;
  /** A ready-to-log sentence. Not a localization surface; callers that need
   * their own wording use `hints` and `suggestion`. */
  message: string;
}
