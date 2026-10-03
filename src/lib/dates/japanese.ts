/**
 * Japanese imperial-calendar adapter. ICU's `japanese` calendar is the
 * Gregorian calendar with era-relative year display: month lengths,
 * leap years, and weekday math are structurally identical to gregory,
 * and only the year's *label* segments at imperial accessions (Reiwa 8
 * = 2026 CE). The adapter therefore keeps the year field at its plain
 * Gregorian numeric value — era segmentation is a formatting concern
 * delegated to Intl's era piece (see `era`, which reports the era in
 * force on June 1 of the year, i.e. after the May 1/January 8
 * accessions of the modern eras) — so month arithmetic, grid math, and
 * Date round-trips stay monotonic and hazard-free. Month names come
 * from Intl with the calendar pinned to `japanese`, which renders
 * plain month names in the requested locale.
 */
import type { HazeDateAdapter, MonthNameStyle } from './adapter';

import {
  addMonths as shiftMonth,
  getDaysInMonth as monthLength,
} from '../components/Calendar/date';

import { eraOfDate, localMidnightOf, utcCivilMs } from './adapter';

/** June 1 — the era-sampling date: every modern accession (Meiji
 * September 1868 by proclamation, Taishō July 30 1912, Shōwa December
 * 25 1926, Heisei January 8 1989, Reiwa May 1 2019) precedes it except
 * Taishō's, so `era(1912)` reports Meiji — the era in force for most
 * of that civil year. */
const ERA_SAMPLE_MONTH = 5;
const ERA_SAMPLE_DAY = 1;

export const japaneseAdapter: HazeDateAdapter = {
  identifier: 'japanese',

  fromGregorian(date) {
    // Gregorian structure, Gregorian year number — only the era display
    // differs (see the module comment).
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
    };
  },

  toGregorian(parts) {
    // Strict on the day (the classic `new Date(y, m, 31)` rollover
    // hazard date.ts's header warns about); months normalize with
    // carry via the Gregorian helpers the calendar math shares.
    const shifted = shiftMonth(parts.year, parts.month, 0);
    if (parts.day < 1 || parts.day > monthLength(shifted.year, shifted.month)) {
      throw new RangeError(
        `Not a japanese date: ${parts.year}-${parts.month + 1}-${parts.day}`
      );
    }
    // utcCivilMs sidesteps the constructor's two-digit-year remap for
    // pre-100 CE years.
    return localMidnightOf(
      utcCivilMs(shifted.year, shifted.month, parts.day)
    );
  },

  getDaysInMonth: monthLength,

  addMonths(parts, delta) {
    const shifted = shiftMonth(parts.year, parts.month, delta);
    const lastDay = monthLength(shifted.year, shifted.month);
    return {
      year: shifted.year,
      month: shifted.month,
      day: Math.min(parts.day, lastDay),
    };
  },

  monthNames(locale = 'en', style: MonthNameStyle = 'long') {
    // Calendar pinned (a default-calendar locale like ja-JP would
    // otherwise return Gregorian names for a *default* calendar that is
    // already Gregorian-plus-era — pinning keeps the calendar-extended
    // locale path uniform with the other adapters); UTC pinned so the
    // sampled anchors format identically in every local zone.
    const fmt = new Intl.DateTimeFormat(locale, {
      calendar: 'japanese',
      month: style,
      timeZone: 'UTC',
    });
    return Array.from({ length: 12 }, (_, month) =>
      fmt.format(new Date(Date.UTC(2026, month, 15)))
    );
  },

  era(year, locale = 'en') {
    return eraOfDate(
      new Date(utcCivilMs(year, ERA_SAMPLE_MONTH, ERA_SAMPLE_DAY)),
      'japanese',
      locale
    );
  },
};
