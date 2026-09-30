// Shared cleanup for values a user pastes in. IBANs and Raast IDs arrive with
// the same contamination — invisible formatting characters, exotic dashes,
// Urdu digits, full-width forms — and the two paths have to agree on what
// each of those is. Keeping one copy is what stops them drifting apart, which
// is the failure mode an enumerated list produces over time.

// Every Unicode format character (category Cf): zero-width space and joiners,
// LRM/RLM, the Arabic Letter Mark an Urdu keyboard inserts, bidi embeddings
// and the isolates Android wraps around pasted numbers, word joiner, soft
// hyphen and BOM. A user cannot see them, so a value that looks the right
// length arrives longer. Listing them one by one kept missing some.
const INVISIBLE_PATTERN = /\p{Cf}/gu;

// Any dash a copy-paste can produce (hyphen, non-breaking hyphen, en/em dash,
// minus sign) is a separator, like whitespace. NBSP is not Cf, so it is
// removed here as whitespace rather than as an invisible character.
const SEPARATOR_PATTERN = /[\s\p{Pd}\u2212]/gu;

// A phone number carries two separators an IBAN never legitimately does:
// people write 0300-1234567, (0300) 1234567 and 0300.1234567. This must stay
// a superset of SEPARATOR_PATTERN above — if a dash is added there, it is
// covered here too, which is why the two live side by side.
const PHONE_SEPARATOR_PATTERN = /[\s\p{Pd}\u2212.()]/gu;

// Arabic-Indic (U+0660-U+0669) and Eastern-Arabic-Indic (U+06F0-U+06F9)
// digits. An Urdu keyboard emits the latter; both render as the digits the
// user typed, so rejecting them means telling someone their digits are not
// digits. NFKC does not fold these, so they are mapped by hand.
const NON_ASCII_DIGIT_PATTERN = /[\u0660-\u0669\u06F0-\u06F9]/g;

const ASCII_ZERO = 0x30;
const ARABIC_INDIC_ZERO = 0x0660;
const EASTERN_ARABIC_INDIC_ZERO = 0x06f0;

function toAsciiDigit(digit: string): string {
  const code = digit.charCodeAt(0);
  const zero = code <= 0x0669 ? ARABIC_INDIC_ZERO : EASTERN_ARABIC_INDIC_ZERO;
  return String.fromCharCode(ASCII_ZERO + code - zero);
}

/**
 * Compatibility-fold, strip invisible characters, and map non-ASCII digits to
 * ASCII. Separators are left alone: callers strip the set that applies to
 * their own format.
 */
export function normalizePastedText(input: string): string {
  return (
    input
      // NFKC folds full-width letters and digits (U+FF10-U+FF5A) to ASCII.
      .normalize('NFKC')
      .replace(INVISIBLE_PATTERN, '')
      .replace(NON_ASCII_DIGIT_PATTERN, toAsciiDigit)
  );
}

/** Remove whitespace and every kind of dash. */
export function stripSeparators(input: string): string {
  return input.replace(SEPARATOR_PATTERN, '');
}

/** Remove whitespace, every kind of dash, and phone punctuation: . ( ) */
export function stripPhoneSeparators(input: string): string {
  return input.replace(PHONE_SEPARATOR_PATTERN, '');
}
