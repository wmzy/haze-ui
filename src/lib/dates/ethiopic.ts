/**
 * Ethiopic calendar adapter (Amete Mihret era, as used in Ethiopia and
 * Eritrea): twelve 30-day months plus the 13th short month Pagume (5
 * days, 6 in leap years — year ≡ 3 mod 4), the extra day keeping New
 * Year (1 Maskaram) on September 11, drifting to September 12 after a
 * leap year. Structurally the Ge'ez calendar with the Incarnation
 * epoch: 1 Maskaram 1 AME = 8 CE August 29 (Julian), JDN 1724221. All
 * math is integer day-number arithmetic against that epoch (whole
 * days, no DST drift); results materialize as local-midnight Dates per
 * the date.ts civil semantics. ICU's `ethiopic` calendar agrees with
 * this arithmetic — ethiopic.test.ts's Intl oracle grid is the standing
 * proof.
 */
import type { CivilDateParts, HazeDateAdapter, MonthNameStyle } from './adapter';

import { eraOfDate, localMidnightOf, utcCivilMs } from './adapter';

const DAY_MS = 86400000;

/** Julian Day Number of 1970-01-01 — the JDN ↔ days-since-epoch offset
 * every conversion here rides on. */
const UNIX_EPOCH_JDN = 2440588;

/** Days-since-epoch of 1 Maskaram 1 AME (Amete Mihret epoch). */
const EPOCH_DAY = 1724221 - UNIX_EPOCH_JDN;

/** Months in every Ethiopic year: twelve 30-day months + Pagume. */
const MONTHS = 13;
/** Month index of Pagume, the short thirteenth month. */
const PAGUME = MONTHS - 1;

/** Ethiopic leap years (Pagume 6): year ≡ 3 (mod 4). */
function isLeapYear(year: number): boolean {
  return year > 0 && year % 4 === 3;
}

/** Carry an out-of-range month index across years (month 13 → next
 * year's Maskaram), mirroring date.ts's constructor semantics. */
function normalizeMonth(year: number, month: number): {
  year: number;
  month: number;
} {
  return {
    year: year + Math.floor(month / MONTHS),
    month: ((month % MONTHS) + MONTHS) % MONTHS,
  };
}

/** Length of a month (assumed normalized): 30 everywhere except the
 * final short month Pagume. */
function monthLength(year: number, month: number): number {
  return month === PAGUME ? (isLeapYear(year) ? 6 : 5) : 30;
}

/** Days-since-epoch of an Ethiopic date: whole years are 365 days plus
 * one per leap year (floor(y/4) counts the year-3, 7, 11… inserts
 * before year y); the month grid is twelve full 30-day columns wide —
 * Pagume's shortness never affects an offset, only the year wrap. */
function toDayNumber(year: number, month: number, day: number): number {
  return (
    EPOCH_DAY +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * month +
    day -
    1
  );
}

/** Ethiopic parts of a days-since-epoch number: the year is bracketed
 * against its own year-start offsets, then the fixed 30-day grid
 * splits the day-of-year. */
function fromDayNumber(dayNumber: number): CivilDateParts {
  const days = dayNumber - EPOCH_DAY;
  const yearStart = (year: number): number =>
    365 * (year - 1) + Math.floor(year / 4);
  let year = Math.floor((4 * days + 1463) / 1461);
  while (yearStart(year) > days) year -= 1;
  while (yearStart(year + 1) <= days) year += 1;
  const dayOfYear = days - yearStart(year);
  return {
    year,
    month: Math.floor(dayOfYear / 30),
    day: (dayOfYear % 30) + 1,
  };
}

/** Search anchor: 2017 AME — a common year (Pagume 5) spanning
 * 2024-09-12 → 2025-09-10, sitting in the era's dense-use range. */
const PROBE_YEAR = 2017;

export const ethiopicAdapter: HazeDateAdapter = {
  identifier: 'ethiopic',

  fromGregorian(date) {
    // Read the local civil date first (date.ts midnight semantics), then
    // convert on the UTC civil timeline — zone-independent by
    // construction.
    const ms = utcCivilMs(date.getFullYear(), date.getMonth(), date.getDate());
    return fromDayNumber(Math.floor(ms / DAY_MS));
  },

  toGregorian(parts) {
    const normalized = normalizeMonth(parts.year, parts.month);
    if (
      parts.day < 1 ||
      parts.day > monthLength(normalized.year, normalized.month)
    ) {
      throw new RangeError(
        `Not an ethiopic date: ${parts.year}-${parts.month + 1}-${parts.day}`
      );
    }
    // utcCivilMs (inside localMidnightOf's argument) sidesteps the
    // constructor's two-digit-year remap for pre-100 CE years —
    // ethiopic year 1 maps to 8 CE.
    return localMidnightOf(
      toDayNumber(normalized.year, normalized.month, parts.day) * DAY_MS
    );
  },

  getDaysInMonth(year, month) {
    const normalized = normalizeMonth(year, month);
    return monthLength(normalized.year, normalized.month);
  },

  addMonths(parts, delta) {
    // Plain month-index arithmetic (every year holds the same thirteen
    // months), truncating the day to the target month's length — day
    // 30 into Pagume clamps to 5/6.
    const total = parts.year * MONTHS + parts.month + delta;
    const year = Math.floor(total / MONTHS);
    const month = ((total % MONTHS) + MONTHS) % MONTHS;
    return {
      year,
      month,
      day: Math.min(parts.day, monthLength(year, month)),
    };
  },

  monthNames(locale = 'en', style: MonthNameStyle = 'long') {
    // Thirteen names — the contract's full-cycle shape for calendars
    // with a permanent thirteenth month. Sampled from the probe year:
    // day 15 of the 30-day months, day 3 of Pagume.
    const fmt = new Intl.DateTimeFormat(locale, {
      calendar: 'ethiopic',
      month: style,
      timeZone: 'UTC',
    });
    return Array.from({ length: MONTHS }, (_, month) =>
      fmt.format(
        new Date(
          toDayNumber(
            PROBE_YEAR,
            month,
            month === PAGUME ? 3 : 15
          ) * DAY_MS
        )
      )
    );
  },

  era(year, locale = 'en') {
    return eraOfDate(
      new Date(toDayNumber(year, 0, 1) * DAY_MS),
      'ethiopic',
      locale
    );
  },
};
