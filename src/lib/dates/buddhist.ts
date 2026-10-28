/**
 * Buddhist-calendar adapter (Theravāda calendar as used in Thailand
 * etc.). Structurally identical to the Gregorian calendar — same month
 * lengths, same leap years — with the year counted in the Buddhist Era
 * (BE), a constant +543 offset from the Gregorian year (2569 BE =
 * 2026 CE). Month names come from Intl with the calendar pinned to
 * `buddhist`, which renders the locale's ordinary month names; the era
 * piece reports "BE" (sampled on June 15). Because the offset is
 * constant, every operation delegates to the shared Gregorian math in
 * `src/lib/utils/date-math.ts` after translating the year —
 * the +543 instance of `makeGregorianLikeAdapter`.
 */
import type { HazeDateAdapter } from './adapter';

import { makeGregorianLikeAdapter } from './adapter';

/** Buddhist Era ↔ Common Era offset: 1 BE = 544 BCE in astronomical
 * numbering (year 1 BE began in −543). */
const BE_OFFSET = 543;

export const buddhistAdapter: HazeDateAdapter = makeGregorianLikeAdapter(
  'buddhist',
  'buddhist',
  BE_OFFSET,
  { month: 5, day: 15 }
);
