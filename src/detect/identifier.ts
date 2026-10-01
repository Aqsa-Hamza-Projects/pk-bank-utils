import type {IdentifierDetection} from '../interfaces/index.js';
import {normalizeIBAN} from '../iban/normalize.js';
import {validateIBAN} from '../iban/validate.js';
import {normalizeRaastId} from '../raast/normalize.js';
import {validateRaastId} from '../raast/validate.js';
import {
  normalizePastedText,
  stripPhoneSeparators,
} from '../text/normalize-text.js';

const IBAN_LENGTH = 24;
const COUNTRY_CODE = 'PK';
const ACCOUNT_NUMBER_PATTERN = /^[0-9]{10,16}$/;

function unknown(): IdentifierDetection {
  return {kind: 'unknown', normalized: '', candidates: []};
}

export function detectIdentifier(input: string): IdentifierDetection {
  if (typeof input !== 'string' || input.trim() === '') return unknown();

  // IBAN first: a PK-prefixed 24-character value cannot be anything else.
  const asIban = normalizeIBAN(input);
  if (asIban.length === IBAN_LENGTH && asIban.startsWith(COUNTRY_CODE)) {
    const confidence = validateIBAN(asIban).valid ? 'high' : 'medium';
    return {
      kind: 'iban',
      normalized: asIban,
      candidates: [{kind: 'iban', confidence, normalized: asIban}],
    };
  }

  // Account numbers must not be run through phone-prefix rewriting, or numbers
  // beginning with 0092 or 92 are silently truncated. Use digit normalization only.
  const asDigits = stripPhoneSeparators(normalizePastedText(input));

  const asRaast = normalizeRaastId(input);
  if (validateRaastId(asRaast).valid) {
    // The Raast reading folds a leading 92/+92/0092 into 03: a fold the
    // account-number reading must NOT apply, since a real account number
    // typed as '923456789012' is 12 digits the user typed, not a phone
    // number in disguise. Speculative fold: the cleaned digits did not
    // already start with 03 and carried no explicit international marker
    // (+92 / 0092) — i.e. we GUESSED this was a phone number rather than
    // being told so. A guess earns 'medium', not 'high', on both readings;
    // an explicit international or already-national form keeps the
    // original high/low split.
    const isSpeculativeFold =
      !asDigits.startsWith('03') &&
      !asDigits.startsWith('+92') &&
      !asDigits.startsWith('0092');

    // An 11-digit 03 number is a valid Raast ID, but PK account numbers of
    // the same length exist, so account-number stays on the list. Each
    // candidate keeps its OWN normalized value — asDigits for
    // account-number — so switching candidates never loses digits.
    return {
      kind: 'raast-mobile',
      normalized: asRaast,
      candidates: isSpeculativeFold
        ? [
            {kind: 'raast-mobile', confidence: 'medium', normalized: asRaast},
            {
              kind: 'account-number',
              confidence: 'medium',
              normalized: asDigits,
            },
          ]
        : [
            {kind: 'raast-mobile', confidence: 'high', normalized: asRaast},
            {
              kind: 'account-number',
              confidence: 'low',
              normalized: asDigits,
            },
          ],
    };
  }

  if (ACCOUNT_NUMBER_PATTERN.test(asDigits)) {
    return {
      kind: 'account-number',
      normalized: asDigits,
      candidates: [
        {kind: 'account-number', confidence: 'medium', normalized: asDigits},
      ],
    };
  }

  return unknown();
}
