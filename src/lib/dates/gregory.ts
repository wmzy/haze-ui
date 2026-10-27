/**
 * Gregorian adapter — a thin shim over the calendar math Calendar already
 * uses (`src/lib/components/Calendar/date.ts`, imported here, never
 * duplicated). `fromGregorian`/`toGregorian` are identity mappings
 * between local-civil Dates and their parts; month-length and view-shift
 * semantics are date.ts's own, so a Calendar wired to this adapter
 * behaves exactly like today's hard-wired Gregorian code paths. The
 * offset-zero instance of `makeGregorianLikeAdapter`.
 */
import type { CivilDateParts, HazeDateAdapter } from './adapter';

import { getDaysInMonth as monthLength } from '../components/Calendar/date';

import { assertCivilDate, makeGregorianLikeAdapter } from './adapter';

const base = makeGregorianLikeAdapter('gregory', 'gregory');

export const gregoryAdapter: HazeDateAdapter = {
  ...base,

  toGregorian(parts: CivilDateParts) {
    // Historical route kept byte-identical: parts go straight to the
    // Date constructor (the factory's utcCivilMs route differs only
    // for years 0–99, which gregory has always let remap to 19xx);
    // months normalize with carry, matching date.ts's own helpers.
    assertCivilDate(parts, parts, monthLength, 'a gregorian');
    return new Date(parts.year, parts.month, parts.day);
  },

  monthNames(locale, style) {
    // Intl's own default locale when the caller passes none —
    // gregory's historical fallback (the other built-ins pin 'en').
    return base.monthNames(locale ?? 'default', style);
  },
};
