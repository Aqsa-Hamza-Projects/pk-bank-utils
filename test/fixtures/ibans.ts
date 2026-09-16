// Valid, hand-computed (ISO 7064 MOD-97) example IBANs across 3 different
// bank codes — not real customer data.
export const VALID_IBANS: readonly string[] = [
  'PK36SCBL0000001123456702',
  'PK38HABB0000012345678901',
  'PK43MEZN1234567890123456',
];

export const INVALID_CHECKSUM_IBAN = 'PK36SCBL0000001123456701';
export const TOO_SHORT_IBAN = 'PK36SCBL000000112345670';
export const TOO_LONG_IBAN = 'PK36SCBL00000011234567020';
export const WRONG_COUNTRY_IBAN = 'GB36SCBL0000001123456702';
export const NON_ALPHANUMERIC_IBAN = 'PK36SCBL000000112345670!';
export const LOWERCASE_VALID_IBAN = 'pk36scbl0000001123456702';
export const SPACED_VALID_IBAN = 'PK36 SCBL 0000 0011 2345 6702';
export const DASHED_VALID_IBAN = 'PK36-SCBL-0000-0011-2345-6702';
export const MALFORMED_CHECK_DIGITS_IBAN = 'PKABSCBL0000001123456702';
export const MALFORMED_BANK_CODE_IBAN = 'PK3612340000001123456702';

// Unicode variants of VALID_IBANS[0] — every one of these must normalize to
// 'PK36SCBL0000001123456702'. Real-world sources: Urdu keyboards emit
// Eastern-Arabic-Indic digits; WhatsApp and bank-app share sheets inject
// zero-width and bidi formatting characters into copied text.
//
// Written as escape sequences on purpose. A literal zero-width space or NBSP
// is invisible in a diff and silently mangled by editors — the exact class of
// bug these fixtures exist to catch.
export const URDU_DIGITS_VALID_IBAN =
  'PK36SCBL\u06F0\u06F0\u06F0\u06F0\u06F0\u06F0\u06F1\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F0\u06F2';
export const ARABIC_INDIC_VALID_IBAN =
  'PK36SCBL\u0660\u0660\u0660\u0660\u0660\u0660\u0661\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0660\u0662';
export const ZERO_WIDTH_VALID_IBAN = 'PK36\u200BSCBL0000001123456702';
export const NBSP_VALID_IBAN = 'PK36SCBL\u00A00000001123456702';
export const BIDI_MARK_VALID_IBAN = '\u202APK36SCBL0000001123456702\u202C';
export const MIXED_UNICODE_VALID_IBAN =
  'PK36\u200BSCBL\u00A0\u06F0\u06F0\u06F0\u06F0\u06F0\u06F0\u06F1\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F0\u06F2';
export const BOM_VALID_IBAN = '\uFEFFPK36SCBL0000001123456702';

// Account fields carrying letters. Every SBP-licensed bank issues a purely
// numeric 16-digit account field, so a letter here is always a typo. The
// first one is the dangerous case: its MOD-97 checksum passes by coincidence,
// so before PR-B2 the package reported a wrong IBAN as valid.
export const LETTER_O_ACCOUNT_IBAN = 'PK36SCBLO000001123456702';
export const ALL_LETTER_O_ACCOUNT_IBAN = 'PK36SCBLOOOOOO1123456702';

// 'S' maps to '5', but the substitution fails MOD-97 — we may point at the
// character without claiming to know the whole IBAN.
export const UNRECOVERABLE_ACCOUNT_IBAN = 'PK36SCBLS000001123456702';

// 'X' is not visually confusable with any digit, so no substitution can be
// claimed and no suggestion may be offered.
export const UNMAPPABLE_LETTER_ACCOUNT_IBAN = 'PK36SCBLX000001123456702';

// Both letter-O fixtures are one substitution away from this, which is
// VALID_IBANS[0].
export const RECOVERED_IBAN = 'PK36SCBL0000001123456702';

// A mappable 'O' next to an unmappable 'X'. No substitution can be attempted
// at all here, so the explanation must not claim one was tried and failed.
export const MIXED_TYPO_ACCOUNT_IBAN = 'PK36SCBLOX00001123456702';
