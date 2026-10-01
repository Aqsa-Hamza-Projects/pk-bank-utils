import {normalizeRaastId} from './normalize.js';
import {validateRaastId} from './validate.js';
import {maskAccountNumber} from '../masking/mask-account-number.js';
import {
  normalizePastedText,
  stripPhoneSeparators,
} from '../text/normalize-text.js';

const VISIBLE_PREFIX_LENGTH = 4; // the operator prefix, e.g. 0300
const VISIBLE_SUFFIX_LENGTH = 2;

export function maskRaastId(input: string): string {
  if (typeof input !== 'string') return '';

  const normalized = normalizeRaastId(input);

  // Anything that is not a well-formed Raast ID is masked conservatively
  // rather than passed through: revealing a prefix we cannot interpret is
  // how maskIBAN came to return '+9230012*4567' for a mobile number. Use a
  // digits-only cleanup here rather than the phone-normalized value: the
  // phone normalizer folds a leading 0092/92 into 03, which would make a
  // 16-digit account number look 13 digits long in its masked form.
  if (!validateRaastId(input).valid) {
    return maskAccountNumber(stripPhoneSeparators(normalizePastedText(input)));
  }

  const prefix = normalized.slice(0, VISIBLE_PREFIX_LENGTH);
  const suffix = normalized.slice(-VISIBLE_SUFFIX_LENGTH);
  const hidden =
    normalized.length - VISIBLE_PREFIX_LENGTH - VISIBLE_SUFFIX_LENGTH;
  return prefix + '*'.repeat(hidden) + suffix;
}
