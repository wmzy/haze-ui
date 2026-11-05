/**
 * Islamic (Hijri) adapter for the Umm al-Qura tabulation — the calendar
 * Node 20+ and every modern browser ship in full ICU
 * (`islamic-umalqura`). There is no `new HijriDate()`, so both
 * conversion directions route through Intl: forward via
 * `formatToParts` on the UTC civil timeline, backward via a seeded
 * linear search that refines against the forward conversion until the
 * round-trip matches exactly. All arithmetic is whole-day UTC
 * milliseconds (no DST drift); results materialize as local-midnight
 * Dates per the date.ts civil semantics.
 *
 * ICU's Umm al-Qura data covers roughly 1300–1600 AH; outside that span
 * ICU falls back to computed months, which this adapter stays
 * self-consistent with (every conversion still passes through Intl).
 */
import type { CivilDateParts, HazeDateAdapter } from './adapter';

import { addMonths as shiftMonth } from '../utils/date-math';

import {
  DAY_MS,
  defineDayNumberAdapter,
  foldFormatParts,
  normalizeParts,
} from './adapter';

/** Mean synodic month in days — the linear estimate that seeds the
 * inverse-conversion search. */
const SYNODIC_MONTH = 29.530588853;

const partsFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

/** Hijri parts of a UTC-civil instant. `formatToParts` months are
 * 1-based, normalized here to the 0-based date.ts convention. */
function partsFromMs(ms: number): CivilDateParts {
  return foldFormatParts(
    partsFormatter.formatToParts(new Date(ms)),
    { year: 0, month: 0, day: 0 },
    { month: -1 }
  );
}

/** Search anchor: 2026-01-01 = 1447-07-12 AH (verified against Intl,
 * see islamic.test.ts's fixed pairs). Any anchor works — the search
 * converges from wherever it starts — this one sits mid-range of the
 * tabulated data. */
const PROBE_MS = Date.UTC(2026, 0, 1);
const PROBE_PARTS = partsFromMs(PROBE_MS);

/** Month-name sampling anchors: day 15 of every month of the anchor
 * year (day 15 exists in every 29/30-day lunar month), as UTC-civil
 * milliseconds. */
const MONTH_ANCHORS: readonly number[] = Array.from({ length: 12 }, (_, month) =>
  msFromParts({ year: PROBE_PARTS.year, month, day: 15 })
);

/**
 * UTC-civil milliseconds of day 1 in a Hijri month (month assumed
 * normalized to 0–11). Seeds from the synodic-month estimate off the
 * probe anchor, then refines with a correction anchored at day 1 — the
 * candidate's own day-of-month is subtracted out, so a candidate sitting
 * on the last day of the previous month steps forward one day instead of
 * oscillating around the boundary. Converges in at most a couple of
 * iterations across the whole 1300–1600 AH tabulation (16 as a guard);
 * throws `RangeError` if it ever does not.
 */
function monthStartMs(year: number, month: number): number {
  const monthDelta =
    (year - PROBE_PARTS.year) * 12 + (month - PROBE_PARTS.month);
  let ms = PROBE_MS + Math.round(monthDelta * SYNODIC_MONTH) * DAY_MS;
  for (let attempt = 0; attempt < 16; attempt++) {
    const candidate = partsFromMs(ms);
    if (
      candidate.year === year &&
      candidate.month === month &&
      candidate.day === 1
    ) {
      return ms;
    }
    const errorMonths =
      (candidate.year - year) * 12 + (candidate.month - month);
    ms -=
      Math.round((candidate.day - 1) + errorMonths * SYNODIC_MONTH) * DAY_MS;
  }
  throw new RangeError(
    `Not an islamic-umalqura date: ${year}-${month + 1}-1`
  );
}

/**
 * UTC-civil milliseconds of a Hijri date. Out-of-range month indices
 * normalize with carry first (date-math.ts constructor semantics: month
 * 12 → next January), the day offset rides whole days from the month start,
 * and a final forward conversion verifies the landed date — a day that
 * exists in no Hijri month (31, or 30 in a 29-day month) throws
 * `RangeError` instead of silently rolling over.
 */
function msFromParts(rawParts: CivilDateParts): number {
  const { year, month } = normalizeParts(rawParts.year, rawParts.month);
  const ms = monthStartMs(year, month) + (rawParts.day - 1) * DAY_MS;
  const landed = partsFromMs(ms);
  if (landed.year !== year || landed.month !== month || landed.day !== rawParts.day) {
    throw new RangeError(
      `Not an islamic-umalqura date: ${year}-${month + 1}-${rawParts.day}`
    );
  }
  return ms;
}

/** Length of a month (assumed normalized): the whole-day span between
 * this month's day-1 anchor and the next's — Hijri months are whole
 * days, so the UTC-millisecond span is an exact multiple of one day. */
function monthLength(year: number, month: number): number {
  const next = shiftMonth(year, month, 1);
  const start = msFromParts({ year, month, day: 1 });
  const end = msFromParts({ year: next.year, month: next.month, day: 1 });
  return (end - start) / DAY_MS;
}

/** Days-since-epoch of a normalized Hijri date, riding the whole-day
 * UTC milliseconds every msFromParts anchor already is (DAY_MS divides
 * them exactly, so the division round-trips losslessly). */
function toDayNumber(year: number, month: number, day: number): number {
  return msFromParts({ year, month, day }) / DAY_MS;
}

/** Hijri parts of a days-since-epoch number. */
function fromDayNumber(dayNumber: number): CivilDateParts {
  return partsFromMs(dayNumber * DAY_MS);
}

export const islamicUmalquraAdapter: HazeDateAdapter = defineDayNumberAdapter({
  identifier: 'islamic-umalqura',
  label: 'an islamic-umalqura',
  normalizeMonth: normalizeParts,
  monthLength,
  toDayNumber,
  fromDayNumber,
  probeAnchors: MONTH_ANCHORS,
});
