// Every Unicode format character (category Cf): zero-width space and joiners,
// LRM/RLM, the Arabic Letter Mark an Urdu keyboard inserts, bidi embeddings
// and the isolates Android wraps around pasted numbers, word joiner, soft
// hyphen and BOM. A user cannot see them, so an IBAN that looks 24 characters
// long arrives as 25. Listing them one by one kept missing some.
const INVISIBLE_PATTERN = /\p{Cf}/gu;

// Any dash a copy-paste can produce (hyphen, non-breaking hyphen, en/em dash,
// minus sign) is a separator, like whitespace.
const SEPARATOR_PATTERN = /[\s\p{Pd}\u2212]/gu;

// Arabic-Indic (U+0660-U+0669) and Eastern-Arabic-Indic (U+06F0-U+06F9)
// digits. An Urdu keyboard emits the latter; both render as the digits the
// user typed, so rejecting them means telling someone their 16 digits are
// not 16 digits. NFKC does not fold these, so they are mapped by hand.
const NON_ASCII_DIGIT_PATTERN = /[\u0660-\u0669\u06F0-\u06F9]/g;

const ASCII_ZERO = 0x30;
const ARABIC_INDIC_ZERO = 0x0660;
const EASTERN_ARABIC_INDIC_ZERO = 0x06f0;

function toAsciiDigit(digit: string): string {
  const code = digit.charCodeAt(0);
  const zero = code <= 0x0669 ? ARABIC_INDIC_ZERO : EASTERN_ARABIC_INDIC_ZERO;
  return String.fromCharCode(ASCII_ZERO + code - zero);
}

export function normalizeIBAN(iban: string): string {
  if (typeof iban !== 'string') return '';
  return (
    iban
      // NFKC folds full-width letters and digits (U+FF10-U+FF5A) to ASCII.
      .normalize('NFKC')
      .replace(INVISIBLE_PATTERN, '')
      .replace(NON_ASCII_DIGIT_PATTERN, toAsciiDigit)
      .toUpperCase()
      .replace(SEPARATOR_PATTERN, '')
  );
}
