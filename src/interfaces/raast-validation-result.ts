export interface RaastValidationResult {
  valid: boolean;
  normalized?: string;
  /**
   * The operator the number's prefix block was ALLOCATED to, or null when
   * the prefix is not in our table. Pakistan has had mobile number
   * portability since 2007, so this is not necessarily the carrier serving
   * the number today. Never use it to route a payment.
   */
  allocatedOperator?: string | null;
  /** Whether the prefix matched a known allocation range. */
  knownPrefix?: boolean;
  reason?: string;
}
