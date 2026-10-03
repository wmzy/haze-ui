/**
 * Hebrew (Jewish) civil calendar adapter — the fixed arithmetic
 * rabbinical calendar (Hillel II): 19-year Metonic cycle with leap
 * years 3/6/8/11/14/17/19 inserting Adar I/II, lunar months of 29/30
 * days anchored by the molad (mean lunation of 29d 12h 793 parts) plus
 * the four postponement rules that place Rosh Hashanah, and
 * defective/regular/complete year types that vary only Heshvan and
 * Kislev. Month indices are positional within the civil year (Tishri =
 * 0): common years run 0–11 with Adar at 5; leap years run 0–12 with
 * Adar I at 5 and Adar II at 6. ICU's `hebrew` calendar agrees with
 * this arithmetic — hebrew.test.ts's Intl oracle grid (month names
 * cross-walked to positional indices) is the standing proof.
 *
 * All math runs on integer day numbers (whole days, no DST drift) and
 * results materialize as local-midnight Dates per the date.ts civil
 * semantics.
 */
import type { CivilDateParts, HazeDateAdapter, MonthNameStyle } from './adapter';

import { eraOfDate, localMidnightOf, utcCivilMs } from './adapter';

const DAY_MS = 86400000;

/** Mean lunar month in halakim (parts, 1080/hour): 29 days 12h 793p. */
const LUNAR_MONTH_PARTS = 765433;
/** Molad of Tishri year 1 (BaHaRaD), in parts from the abstract week
 * origin (day 0 = the Saturday of creation; day 2 = Monday). */
const MOLAD_EPOCH_PARTS = 57444;
/** 18 hours in parts — the molad-zaken (stale molad) threshold. */
const MOLAD_ZAKEN = 19440;
/** 9h 204p in parts — the GaTaRaD threshold. */
const GATARAD = 9924;
/** 15h 589p in parts — the BeTUTaKPaT threshold. */
const BETUTAKPAT = 16789;
/** Abstract-day ↔ days-since-epoch-1970 offset: Tishri 1, year 1
 * (Monday, Julian 3761-09-07 BCE, JDN 347998) is abstract day 2 and
 * JS day -2092590. */
const EPOCH_DAY = -2092592;

/** Leap years of the 19-year Metonic cycle (years 3, 6, 8, 11, 14, 17,
 * 19 of the cycle carry the intercalated Adar I/II). */
function isLeapYear(year: number): boolean {
  return ((year * 7 + 1) % 19) < 7;
}

/** Lunar months elapsed before Tishri of `year` since the epoch molad. */
function monthsElapsed(year: number): number {
  return Math.floor((235 * year - 234) / 19);
}

/** Abstract day of Rosh Hashanah (Tishri 1) of `year`: the molad day
 * refined by the four dechiyot. Verified against ICU over 1600–2400
 * CE in hebrew.test.ts — in particular GaTaRaD applies to any common
 * year with a Tuesday molad at/after 9h204p, while BeTUTaKPaT applies
 * only when the *previous* year was leap. */
function tishri1(year: number): number {
  const total = MOLAD_EPOCH_PARTS + LUNAR_MONTH_PARTS * monthsElapsed(year);
  const moladDay = Math.floor(total / 25920);
  const parts = total % 25920;
  // Weekday of the molad day in the 0 = Saturday convention
  // (1 Sunday, 2 Monday, 3 Tuesday, 4 Wednesday, 6 Friday).
  const weekday = ((moladDay % 7) + 7) % 7;
  let rosh = moladDay;
  // 1. Molad zaken: at/after noon belongs to the next day.
  if (parts >= MOLAD_ZAKEN) rosh += 1;
  // 2. Lo ADU rosh: Rosh Hashanah may not fall Sun/Wed/Fri.
  const landed = ((rosh % 7) + 7) % 7;
  if (landed === 1 || landed === 4 || landed === 6) rosh += 1;
  // 3. GaTaRaD: common year, Tuesday molad at/after 9h204p → Thursday.
  if (!isLeapYear(year) && weekday === 3 && parts >= GATARAD && parts < MOLAD_ZAKEN) {
    rosh += 2;
  }
  // 4. BeTUTaKPaT: common year following a leap year, Monday molad
  //    at/after 15h589p → Tuesday.
  if (
    !isLeapYear(year) &&
    isLeapYear(year - 1) &&
    weekday === 2 &&
    parts >= BETUTAKPAT &&
    parts < MOLAD_ZAKEN
  ) {
    rosh += 1;
  }
  return rosh;
}

/** Months in a year: 13 in Metonic leap years (Adar I + Adar II), else
 * 12. */
function monthsInYear(year: number): number {
  return isLeapYear(year) ? 13 : 12;
}

/** Length of a month (0-based, assumed normalized): fixed 29/30
 * pattern except Heshvan/Kislev, whose lengths encode the year type
 * (deficient 353/383, regular 354/384, complete 355/385). */
function monthLength(year: number, month: number): number {
  if (month === 1 || month === 2) {
    const yearLength = tishri1(year + 1) - tishri1(year);
    if (month === 1) {
      // Heshvan: 30 only in complete years.
      return yearLength === 355 || yearLength === 385 ? 30 : 29;
    }
    // Kislev: 29 only in defective years.
    return yearLength === 353 || yearLength === 383 ? 29 : 30;
  }
  if (month === 0) return 30; // Tishri
  if (month === 3) return 29; // Tevet
  if (month === 4) return 30; // Shevat
  if (month === 5) {
    // Adar I (30) in leap years; Adar (29) in common years.
    return isLeapYear(year) ? 30 : 29;
  }
  // From index 6 the tail alternates 29/30 ending on Elul 29: leap
  // years start the tail at Adar II (29), common years at Nisan (30).
  if (isLeapYear(year)) {
    return month % 2 === 0 ? 29 : 30;
  }
  return month % 2 === 0 ? 30 : 29;
}

/** Carry an out-of-range month index across variable-length years
 * (month 13 of a leap year → Tishri of the next; month 12 of a common
 * year → Tishri of the next). */
function normalizeMonth(year: number, month: number): CivilDateParts {
  let y = year;
  let m = month;
  while (m < 0) {
    y -= 1;
    m += monthsInYear(y);
  }
  while (m >= monthsInYear(y)) {
    m -= monthsInYear(y);
    y += 1;
  }
  return { year: y, month: m, day: 1 };
}

/** Days-since-epoch of a normalized Hebrew date. */
function toDayNumber(year: number, month: number, day: number): number {
  let offset = 0;
  for (let m = 0; m < month; m += 1) {
    offset += monthLength(year, m);
  }
  return tishri1(year) + EPOCH_DAY + offset + day - 1;
}

/** Hebrew parts of a days-since-epoch number. */
function fromDayNumber(dayNumber: number): CivilDateParts {
  const absolute = dayNumber - EPOCH_DAY;
  // Year estimate within ±1 of the truth (mean year ≈ 365.2468d), then
  // bracketed exactly against the two adjacent Rosh Hashanahs.
  let year = Math.floor((absolute - 2) / 365.2468) + 1;
  while (tishri1(year) > absolute) year -= 1;
  while (tishri1(year + 1) <= absolute) year += 1;
  let remainder = absolute - tishri1(year);
  let month = 0;
  while (remainder >= monthLength(year, month)) {
    remainder -= monthLength(year, month);
    month += 1;
  }
  return { year, month, day: remainder + 1 };
}

/** Search anchor: 5785 AM — a common year (2024-10-03 → 2025-09-22),
 * giving `monthNames` its twelve-month common-year shape. */
const PROBE_YEAR = 5785;

export const hebrewAdapter: HazeDateAdapter = {
  identifier: 'hebrew',

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
        `Not a hebrew date: ${parts.year}-${parts.month + 1}-${parts.day}`
      );
    }
    return localMidnightOf(
      toDayNumber(normalized.year, normalized.month, parts.day) * DAY_MS
    );
  },

  getDaysInMonth(year, month) {
    const normalized = normalizeMonth(year, month);
    return monthLength(normalized.year, normalized.month);
  },

  addMonths(parts, delta) {
    // Hebrew years hold 12 or 13 months, so month arithmetic walks year
    // boundaries by each year's actual month count instead of the fixed
    // 12-month carry the Gregorian helpers use.
    const normalized = normalizeMonth(parts.year, parts.month);
    let year = normalized.year;
    let month = normalized.month;
    let remaining = delta;
    while (remaining > 0) {
      const monthsLeft = monthsInYear(year) - month;
      if (remaining < monthsLeft) {
        month += remaining;
        remaining = 0;
      } else {
        remaining -= monthsLeft;
        year += 1;
        month = 0;
      }
    }
    while (remaining < 0) {
      if (-remaining <= month) {
        month += remaining;
        remaining = 0;
      } else {
        remaining += month + 1;
        year -= 1;
        month = monthsInYear(year) - 1;
      }
    }
    return {
      year,
      month,
      day: Math.min(parts.day, monthLength(year, month)),
    };
  },

  monthNames(locale = 'en', style: MonthNameStyle = 'long') {
    // Twelve names in the common-year shape (Tishri…Elul, single Adar at
    // index 5), sampled from the probe year via Intl. Leap years
    // intercalate Adar I/II at indices 5/6 — consumers rendering a leap
    // year differentiate them through Intl the same way ("Adar I" /
    // "Adar II" in en).
    const fmt = new Intl.DateTimeFormat(locale, {
      calendar: 'hebrew',
      month: style,
      timeZone: 'UTC',
    });
    return Array.from({ length: 12 }, (_, month) =>
      fmt.format(new Date(toDayNumber(PROBE_YEAR, month, 15) * DAY_MS))
    );
  },

  era(year, locale = 'en') {
    return eraOfDate(
      new Date(toDayNumber(year, 0, 1) * DAY_MS),
      'hebrew',
      locale
    );
  },
};
