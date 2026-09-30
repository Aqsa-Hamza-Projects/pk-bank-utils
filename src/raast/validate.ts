import type {RaastValidationResult} from '../interfaces/index.js';
import {normalizeRaastId} from './normalize.js';
import {getAllocatedOperator} from './operators.js';

const RAAST_ID_LENGTH = 11;
const MOBILE_PREFIX = '03';
const DIGITS_ONLY_PATTERN = /^[0-9]+$/;

export function validateRaastId(input: string): RaastValidationResult {
  const normalized = normalizeRaastId(input);
  // Checked after normalizing, like validateIBAN: input made only of
  // separators or invisible format characters is empty too, and `trim()`
  // would not have caught it — a zero-width space is not whitespace.
  if (normalized === '') {
    return {valid: false, reason: 'Raast ID must be a non-empty string'};
  }

  if (!DIGITS_ONLY_PATTERN.test(normalized)) {
    return {valid: false, reason: 'Raast ID must contain only digits'};
  }

  if (normalized.length !== RAAST_ID_LENGTH) {
    return {
      valid: false,
      reason: `Raast ID must be ${RAAST_ID_LENGTH} digits, got ${normalized.length}`,
    };
  }

  if (!normalized.startsWith(MOBILE_PREFIX)) {
    return {
      valid: false,
      reason: `Raast ID must be a mobile number starting with ${MOBILE_PREFIX}`,
    };
  }

  const allocatedOperator = getAllocatedOperator(normalized);

  return {
    valid: true,
    normalized,
    allocatedOperator,
    knownPrefix: allocatedOperator !== null,
  };
}
