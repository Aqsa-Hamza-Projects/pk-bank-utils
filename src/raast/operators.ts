// Prefix-to-operator allocations for Pakistani mobile numbers.
//
// IMPORTANT: this is ALLOCATION data, not live carrier data. Mobile number
// portability launched in Pakistan in 2007 (the MNP Regulations themselves
// are dated 2005), so a 0300 number may be carried by Zong today. Never use
// this to route a payment or score a transaction.
//
// Sourcing: PTA publishes no current public per-prefix allocation table. The
// only PTA document found carrying prefix-level content is the National
// Numbering Plan 2008 public consultation draft, which allocates at the
// two-digit Network Access Code level only (NAC 30 Mobilink, 31 Paktel GSM,
// 32 Warid, 33 Ufone, 34 Telenor, 35 SCO, 36 Instaphone):
//   https://www.pta.gov.pk/assets/media/num_plan_230108.pdf
// PTA's newer "SOP on Allocation of Numbering Resource to CMOS/LL/LDI
// Operators" (2025-04-29) was checked and is purely procedural — eligibility,
// online applications, a 30-day assignment window — with no per-operator or
// per-prefix table, so it does not supersede the 2008 draft here.
// The confidence marker on each row records how well it is attested.
//
// Ranges absent from this table are UNKNOWN, not unallocated. That 2008
// document assigns blocks every current source calls unallocated, and
// whether PTA reclaimed them is undocumented. validateRaastId therefore
// treats an absent prefix as valid-with-unknown-operator, never as invalid.

export interface OperatorRange {
  /** Inclusive 3-digit prefix lower bound: 300 means 0300. */
  from: number;
  /** Inclusive 3-digit prefix upper bound: 309 means 0309. */
  to: number;
  operator: string;
  confidence: 'primary' | 'secondary' | 'low';
}

export const OPERATOR_RANGES: readonly OperatorRange[] = [
  // Jazz's own number-selection tool lists all ten of each block as
  // selectable prefixes: https://jazz.com.pk/choose-your-number
  // (Selectable options rather than a prose statement, but it is the operator
  // itself, which is the strongest evidence available for any row here.)
  {from: 300, to: 309, operator: 'Jazz', confidence: 'primary'},
  // Ex-Warid, absorbed by Jazz after the 2016 merger. Jazz's own tool lists
  // the full 0320-0329, and PTA 2008 NAC 32 assigns the whole block to
  // Warid. There is no 0321-0327 partial split in any source.
  {from: 320, to: 329, operator: 'Jazz', confidence: 'primary'},
  // PTA 2008 assigns NAC 31 to Paktel GSM, Zong's predecessor licence.
  {from: 310, to: 319, operator: 'Zong', confidence: 'secondary'},
  // Supplemental Zong block opened after 031x filled. No source could be
  // confirmed for this specific range.
  {from: 370, to: 371, operator: 'Zong', confidence: 'low'},
  // PTA 2008 NAC 33, whole block.
  {from: 330, to: 339, operator: 'Ufone', confidence: 'secondary'},
  // PTA 2008 NAC 34, whole block, unsplit. NOTE: Telenor Pakistan ceased to
  // exist as a legal entity on 1 July 2026, amalgamated into PTML (Ufone).
  // The label is kept because this field records the ALLOCATION, and the
  // current consumer brand is unresolved — a proposed 'e&' rebrand was
  // halted by the government in July 2026.
  {from: 340, to: 349, operator: 'Telenor', confidence: 'secondary'},
  // Special Communications Organization, serving Azad Jammu & Kashmir and
  // Gilgit-Baltistan. Lowest-confidence row: aggregators agree on 0355
  // specifically, but PTA 2008 assigns the whole of 0350-0359 to SCO. Under
  // the valid-but-flagged rule, being wrong here costs an unknown operator,
  // never a rejected number.
  {from: 355, to: 355, operator: 'SCOM', confidence: 'low'},
];

// Exactly 11 ASCII digits starting '03' — anything else (letters, wrong
// length, non-string) is rejected before the range scan even runs.
const STRICT_MOBILE_PATTERN = /^03[0-9]{9}$/;

export function getAllocatedOperator(normalizedId: string): string | null {
  if (typeof normalizedId !== 'string') return null;
  if (!STRICT_MOBILE_PATTERN.test(normalizedId)) return null;

  const prefix = Number(normalizedId.slice(1, 4));

  for (const range of OPERATOR_RANGES) {
    if (prefix >= range.from && prefix <= range.to) return range.operator;
  }
  return null;
}
