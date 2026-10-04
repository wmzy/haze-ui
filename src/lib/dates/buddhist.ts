/**
 * Buddhist-calendar adapter (Theravāda calendar as used in Thailand
 * etc.). Structurally identical to the Gregorian calendar — same month
 * lengths, same leap years — with the year counted in the Buddhist Era
 * (BE), a constant +543 offset from the Gregorian year (2569 BE =
 * 2026 CE). Month names come from Intl with the calendar pinned to
 * `buddhist`, which renders the locale's ordinary month names; the era
 * piece reports "BE". Because the offset is constant, every operation
 * delegates to the shared Gregorian math in
 * `src/lib/components/Calendar/date.ts` after translating the year,
 * exactly like gregory.ts's shim.
 */
import type { HazeDateAdapter, MonthNameStyle } from './adapter';

import {
  addMonths as shiftMonth,
  getDaysInMonth as monthLength,
} from '../components/Calendar/date';

import { eraOfDate, localMidnightOf, utcCivilMs } from './adapter';

/** Buddhist Era ↔ Common Era offset: 1 BE = 544 BCE in astronomical
 * numbering (year 1 BE began in −543). */
const BE_OFFSET = 543;

export const buddhistAdapter: HazeDateAdapter = {
  identifier: 'buddhist',

  fromGregorian(date) {
    return {
      year: date.getFullYear() + BE_OFFSET,
      month: date.getMonth(),
      day: date.getDate(),
    };
  },

  toGregorian(parts) {
    const gregorianYear = parts.year - BE_OFFSET;
    // Strict on the day (the classic `new Date(y, m, 31)` rollover
    // hazard); months normalize with carry via the Gregorian helpers
    // the calendar math shares.
    const shifted = shiftMonth(gregorianYear, parts.month, 0);
    if (parts.day < 1 || parts.day > monthLength(shifted.year, shifted.month)) {
      throw new RangeError(
        `Not a buddhist date: ${parts.year}-${parts.month + 1}-${parts.day}`
      );
    }
    // utcCivilMs sidesteps the constructor's two-digit-year remap for
    // pre-100 CE years (buddhist year 608 = 65 CE).
    return localMidnightOf(
      utcCivilMs(shifted.year, shifted.month, parts.day)
    );
  },

  getDaysInMonth(year, month) {
    return monthLength(year - BE_OFFSET, month);
  },

  addMonths(parts, delta) {
    // The era offset is constant, so plain month-index arithmetic on
    // the Buddhist year carries identically to the Gregorian one.
    const shifted = shiftMonth(parts.year, parts.month, delta);
    const lastDay = monthLength(shifted.year - BE_OFFSET, shifted.month);
    return {
      year: shifted.year,
      month: shifted.month,
      day: Math.min(parts.day, lastDay),
    };
  },

  monthNames(locale = 'en', style: MonthNameStyle = 'long') {
    // Calendar pinned so default-calendar locales still resolve the
    // Buddhist calendar; UTC pinned so the sampled anchors format
    // identically in every local zone.
    const fmt = new Intl.DateTimeFormat(locale, {
      calendar: 'buddhist',
      month: style,
      timeZone: 'UTC',
    });
    return Array.from({ length: 12 }, (_, month) =>
      fmt.format(new Date(Date.UTC(2026, month, 15)))
    );
  },

  era(year, locale = 'en') {
    return eraOfDate(
      new Date(utcCivilMs(year - BE_OFFSET, 5, 15)),
      'buddhist',
      locale
    );
  },
};
