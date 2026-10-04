/**
 * Persian (Solar Hijri / Jalaali) adapter — the arithmetic calendar in
 * official use in Iran and Afghanistan. Twelve solar months (six 31-day,
 * five 30-day, Esfand 29 or 30) kept equinox-locked by the public-domain
 * Borkowski algorithm that jalaali-js / moment-jalaali popularized: a
 * breaks table that restarts the 33-year leap pattern at observed
 * corrections, tracking the astronomical calendar across 1178–1633 AP
 * (Gregorian 1799–2255). Node and browsers compute `persian` in full ICU
 * with the same arithmetic, so this implementation and Intl agree over
 * the whole supported range — persian.test.ts's Intl oracle grid is the
 * standing proof.
 *
 * Like the other algorithmic adapters (hebrew, ethiopic), all math runs
 * on integer Julian Day Numbers (whole days, no DST drift) and results
 * materialize as local-midnight Dates per the date.ts civil semantics.
 */
import type { CivilDateParts, HazeDateAdapter, MonthNameStyle } from './adapter';

import { addMonths as shiftMonth } from '../components/Calendar/date';

import { eraOfDate, localMidnightOf, utcCivilMs } from './adapter';

const DAY_MS = 86400000;

/** Julian Day Number of 1970-01-01 — the JDN ↔ days-since-epoch offset
 * every conversion here rides on. */
const UNIX_EPOCH_JDN = 2440588;

/** Break years of the Borkowski table (verbatim from jalaali-js): at
 * each break the 33-year leap pattern restarts to re-sync with the
 * observed equinox. Bounds the algorithm's domain to years −61..3177 AP
 * (Gregorian 561–3799). */
const BREAKS: readonly number[] = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060,
  2097, 2192, 2262, 2324, 2394, 2456, 3178,
];

/** Truncating division/remainder — the exact semantics the jalaali
 * arithmetic was derived against. */
const div = (a: number, b: number): number => Math.trunc(a / b);
const mod = (a: number, b: number): number => a - Math.trunc(a / b) * b;

/** Gregorian year paired with `march`, the Gregorian day of March on
 * which Nowruz of Persian year `jy` falls, plus the year's leap marker
 * (years elapsed since the last leap year; 0 means `jy` itself is
 * leap). Throws `RangeError` outside the breaks table's domain. */
function jalCal(jy: number): { gy: number; march: number; leap: number } {
  const first = BREAKS[0] ?? -61;
  const last = BREAKS[BREAKS.length - 1] ?? 3178;
  if (jy < first || jy >= last) {
    throw new RangeError(`Not a persian year: ${jy}`);
  }
  const gy = jy + 621;
  let leapJ = -14;
  let jp = first;
  let jump = 0;
  for (const candidate of BREAKS) {
    if (candidate === first) continue;
    jump = candidate - jp;
    if (jy < candidate) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = candidate;
  }
  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { gy, march, leap };
}

/** JDN of a Gregorian date (1-based month, proleptic). */
function gregorianToJdn(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

/** Gregorian date (1-based month) of a JDN. */
function jdnToGregorian(jdn: number): {
  year: number;
  month: number;
  day: number;
} {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const day = div(mod(i, 153), 5) + 1;
  const month = mod(div(i, 153), 12) + 1;
  const year = div(j, 1461) - 100100 + div(8 - month, 6);
  return { year, month, day };
}

/** JDN of a Persian date. `month` is 1-based (the jalaali arithmetic's
 * own convention); the first six months contribute 31 days, the next
 * five 30, and Esfand's variable tail is anchored on the *next* year's
 * Nowruz — never on a stored leap flag. */
function jalaliToJdn(jy: number, jm: number, jd: number): number {
  const { gy, march } = jalCal(jy);
  return gregorianToJdn(gy, 3, march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

/** Persian parts of a JDN; month returned 0-based per the adapter
 * contract. */
function jdnToJalali(jdn: number): CivilDateParts {
  const gy = jdnToGregorian(jdn).year;
  let jy = gy - 621;
  const { march, leap } = jalCal(jy);
  const jdn1f = gregorianToJdn(gy, 3, march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      return { year: jy, month: div(k, 31), day: mod(k, 31) + 1 };
    }
    k -= 186;
  } else {
    // Before this year's Nowruz: the date belongs to the previous
    // Persian year, whose length gains a day when that year was leap
    // (leap === 1 means exactly one year has passed since the last
    // leap year, i.e. the year being departed into was the leap one).
    jy -= 1;
    k += 179;
    if (leap === 1) k += 1;
  }
  return { year: jy, month: 6 + div(k, 30), day: mod(k, 30) + 1 };
}

/** Length of a Persian month; `month` assumed normalized to 0–11. */
function monthLength(jy: number, month: number): number {
  if (month < 6) return 31;
  if (month < 11) return 30;
  return jalaliToJdn(jy + 1, 1, 1) - jalaliToJdn(jy, 12, 1);
}

/** Search anchor: 1404 AP = the common year spanning 2025-03-21 →
 * 2026-03-20, sitting mid-range of the table (verified against Intl —
 * Nowruz 1404 = 2025-03-21 is one of persian.test.ts's fixed pairs). */
const PROBE_YEAR = 1404;

export const persianAdapter: HazeDateAdapter = {
  identifier: 'persian',

  fromGregorian(date) {
    // Read the local civil date first (date.ts midnight semantics), then
    // convert on the UTC civil timeline — zone-independent by
    // construction.
    const ms = utcCivilMs(date.getFullYear(), date.getMonth(), date.getDate());
    return jdnToJalali(Math.floor(ms / DAY_MS) + UNIX_EPOCH_JDN);
  },

  toGregorian(parts) {
    const shifted = shiftMonth(parts.year, parts.month, 0);
    if (
      parts.day < 1 ||
      parts.day > monthLength(shifted.year, shifted.month)
    ) {
      throw new RangeError(
        `Not a persian date: ${parts.year}-${parts.month + 1}-${parts.day}`
      );
    }
    const g = jdnToGregorian(
      jalaliToJdn(shifted.year, shifted.month + 1, parts.day)
    );
    return localMidnightOf(utcCivilMs(g.year, g.month - 1, g.day));
  },

  getDaysInMonth(year, month) {
    const shifted = shiftMonth(year, month, 0);
    return monthLength(shifted.year, shifted.month);
  },

  addMonths(parts, delta) {
    const shifted = shiftMonth(parts.year, parts.month, delta);
    return {
      year: shifted.year,
      month: shifted.month,
      day: Math.min(parts.day, monthLength(shifted.year, shifted.month)),
    };
  },

  monthNames(locale = 'en', style: MonthNameStyle = 'long') {
    // Sample day 15 of every month of the probe year (day 15 exists in
    // every 29/30-day month), converted back to Gregorian instants and
    // formatted in the target locale.
    const fmt = new Intl.DateTimeFormat(locale, {
      calendar: 'persian',
      month: style,
      timeZone: 'UTC',
    });
    return Array.from({ length: 12 }, (_, month) =>
      fmt.format(
        new Date(
          (jalaliToJdn(PROBE_YEAR, month + 1, 15) - UNIX_EPOCH_JDN) * DAY_MS
        )
      )
    );
  },

  era(year, locale = 'en') {
    const anchorMs =
      (jalaliToJdn(year, 1, 1) - UNIX_EPOCH_JDN) * DAY_MS;
    return eraOfDate(new Date(anchorMs), 'persian', locale);
  },
};
