// The canonical normalized form every equivalent input must reduce to.
// Not real customer data — 0300 is a Jazz allocation, digits are sequential.
export const CANONICAL_RAAST_ID = '03001234567';

// Every one of these is the same number as a Pakistani user might paste it:
// from a contact card, a WhatsApp message, an international SIM, or an
// Urdu-language keyboard.
export const RAAST_EQUIVALENT_FORMS: readonly string[] = [
  '03001234567',
  '0300-1234567',
  '0300 1234567',
  '(0300) 1234567',
  '+92 300 1234567',
  '+923001234567',
  '0092 300 1234567',
  '00923001234567',
  '92 300 1234567',
  '3001234567',
];

// Unicode variants of CANONICAL_RAAST_ID. Written as escape sequences on
// purpose: a literal zero-width space or NBSP is invisible in a diff and
// silently mangled by editors — the exact class of bug these fixtures catch.
export const URDU_DIGITS_RAAST_ID =
  '\u06F0\u06F3\u06F0\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7';
export const ARABIC_INDIC_RAAST_ID =
  '\u0660\u0663\u0660\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667';
export const ZERO_WIDTH_RAAST_ID = '0300\u200B1234\u00A0567';

// Structurally wrong inputs, for the validator's failure paths.
export const TOO_SHORT_RAAST_ID = '0300123456';
export const TOO_LONG_RAAST_ID = '030012345678';
export const LANDLINE_RAAST_ID = '04212345678';
export const NON_DIGIT_RAAST_ID = '0300abcdefg';

// A structurally valid mobile whose prefix is not in our operator table.
export const UNKNOWN_PREFIX_RAAST_ID = '03601234567';
