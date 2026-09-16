// Characters that carry no visible width but survive copy-paste from
// WhatsApp, bank apps and RTL-aware editors: zero-width space and joiners
// (U+200B-U+200F), BOM (U+FEFF), bidi overrides (U+202A-U+202E) and the
// non-breaking space (U+00A0). A user cannot see them, so an IBAN that looks
// 24 characters long arrives as 25.
const INVISIBLE_PATTERN = /[\u200B-\u200F\uFEFF\u202A-\u202E\u00A0]/g;

// Arabic-Indic (U+0660-U+0669) and Eastern-Arabic-Indic (U+06F0-U+06F9)
// digits. An Urdu keyboard emits the latter; both render as the digits the
// user typed, so rejecting them means telling someone their 16 digits are
// not 16 digits.
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
  return iban
    .replace(INVISIBLE_PATTERN, '')
    .replace(NON_ASCII_DIGIT_PATTERN, toAsciiDigit)
    .toUpperCase()
    .replace(/[\s-]/g, '');
}
