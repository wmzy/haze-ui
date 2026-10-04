import { persianAdapter } from './persian';

/**
 * Authoritative Gregorian ↔ Solar Hijri pairs — verified against Node
 * full-ICU `Intl.DateTimeFormat('en-u-ca-persian').formatToParts` (UTC
 * civil timeline) and against the astronomical Iranian calendar: the
 * Borkowski arithmetic behind the adapter matched ICU on every single
 * day of 1900–2100 during development. 2025-03-21 being 1404-01-01 (a
 * Nowruz) and 2024-02-29 landing mid-Esfand 1402 are extra structural
 * anchors.
 */
const FIXED_PAIRS: readonly {
  gregorian: { year: number; month: number; day: number };
  persian: { year: number; month: number; day: number };
}[] = [
  { gregorian: { year: 2020, month: 0, day: 1 }, persian: { year: 1398, month: 9, day: 11 } },
  { gregorian: { year: 2024, month: 1, day: 29 }, persian: { year: 1402, month: 11, day: 10 } },
  { gregorian: { year: 2025, month: 2, day: 21 }, persian: { year: 1404, month: 0, day: 1 } },
  { gregorian: { year: 2026, month: 0, day: 1 }, persian: { year: 1404, month: 9, day: 11 } },
  { gregorian: { year: 2030, month: 5, day: 15 }, persian: { year: 1409, month: 2, day: 25 } },
];

const DAY_MS = 86400000;

describe('persianAdapter', () => {
  it('matches the fixed authoritative pairs (Gregorian → Persian)', () => {
    for (const pair of FIXED_PAIRS) {
      expect(
        persianAdapter.fromGregorian(
          new Date(pair.gregorian.year, pair.gregorian.month, pair.gregorian.day)
        )
      ).toEqual(pair.persian);
    }
  });

  it('matches the fixed authoritative pairs (Persian → Gregorian)', () => {
    for (const pair of FIXED_PAIRS) {
      const date = persianAdapter.toGregorian(pair.persian);
      expect(date.getFullYear()).toBe(pair.gregorian.year);
      expect(date.getMonth()).toBe(pair.gregorian.month);
      expect(date.getDate()).toBe(pair.gregorian.day);
    }
  });

  it('agrees with Intl on a 47-day grid across 2020–2024 (oracle)', () => {
    // The Intl cross-validation grid: every 47th day from 2020-01-01
    // for five years — 39 samples stepping over Nowruz, Esfand tails
    // and both year lengths. ICU's persian calendar and the Borkowski
    // arithmetic are the same computation, so any divergence here is a
    // bug in the port.
    const fmt = new Intl.DateTimeFormat('en-u-ca-persian', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    for (let t = Date.UTC(2020, 0, 1); t <= Date.UTC(2024, 11, 31); t += 47 * DAY_MS) {
      const expected: Record<string, number> = {};
      for (const part of fmt.formatToParts(new Date(t))) {
        if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
          expected[part.type] = Number(part.value);
        }
      }
      const utc = new Date(t);
      expect(
        persianAdapter.fromGregorian(
          new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate())
        )
      ).toEqual({
        year: expected.year,
        month: expected.month! - 1,
        day: expected.day,
      });
    }
  });

  it('round-trips every day of 2020–2030', () => {
    // Dense sweep across Nowruz boundaries, Esfand tails, the 1399 and
    // 1403 leap years — every conversion must land back on the exact
    // local civil date it started from.
    for (let t = Date.UTC(2020, 0, 1); t <= Date.UTC(2030, 11, 31); t += DAY_MS) {
      const utc = new Date(t);
      const local = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
      const back = persianAdapter.toGregorian(persianAdapter.fromGregorian(local));
      expect(back.getFullYear()).toBe(local.getFullYear());
      expect(back.getMonth()).toBe(local.getMonth());
      expect(back.getDate()).toBe(local.getDate());
    }
  });

  it('materializes parts as local midnight', () => {
    const date = persianAdapter.toGregorian({ year: 1404, month: 0, day: 1 });
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getFullYear()).toBe(2025);
  });

  it('reads the local civil date, not the UTC instant', () => {
    // 2026-01-01 local is 1404-10-11 in every zone: parts follow the
    // wall clock because the conversion reads local fields first.
    expect(persianAdapter.fromGregorian(new Date(2026, 0, 1, 23, 59))).toEqual({
      year: 1404,
      month: 9,
      day: 11,
    });
  });

  it('reports the 31/30/29–30 shape and 365/366-day years', () => {
    // Leap years of the 33-year pattern in this window (the same set
    // the astronomical Iranian calendar observes): 1399, 1403, 1408.
    const leaps: number[] = [];
    for (let year = 1390; year <= 1410; year += 1) {
      const esfand = persianAdapter.getDaysInMonth(year, 11);
      expect(esfand === 29 || esfand === 30).toBe(true);
      if (esfand === 30) leaps.push(year);
      for (let month = 0; month < 6; month += 1) {
        expect(persianAdapter.getDaysInMonth(year, month)).toBe(31);
      }
      for (let month = 6; month < 11; month += 1) {
        expect(persianAdapter.getDaysInMonth(year, month)).toBe(30);
      }
    }
    expect(leaps).toEqual([1391, 1395, 1399, 1403, 1408]);
    expect(persianAdapter.getDaysInMonth(1403, 11)).toBe(30);
    expect(persianAdapter.getDaysInMonth(1404, 11)).toBe(29);
  });

  it('keeps month starts contiguous', () => {
    // Day 1 of month m+1 must be exactly `daysInMonth(m)` days after
    // day 1 of month m — Nowruz arithmetic cannot be off by a day.
    for (let year = 1402; year <= 1406; year += 1) {
      for (let month = 0; month < 11; month += 1) {
        const next = persianAdapter.addMonths({ year, month, day: 1 }, 1);
        const startMs = persianAdapter.toGregorian({ year, month, day: 1 }).getTime();
        const endMs = persianAdapter.toGregorian(next).getTime();
        expect((endMs - startMs) / DAY_MS).toBe(
          persianAdapter.getDaysInMonth(year, month)
        );
      }
    }
  });

  it('normalizes out-of-range months with carry', () => {
    expect(persianAdapter.toGregorian({ year: 1404, month: 12, day: 1 })).toEqual(
      persianAdapter.toGregorian({ year: 1405, month: 0, day: 1 })
    );
    expect(persianAdapter.getDaysInMonth(1404, -1)).toBe(
      persianAdapter.getDaysInMonth(1403, 11)
    );
  });

  it('rejects days that exist in no Persian month', () => {
    // Esfand 30 of a common year, day 31 of a 30-day month, day 0.
    expect(() =>
      persianAdapter.toGregorian({ year: 1404, month: 11, day: 30 })
    ).toThrow(RangeError);
    expect(() =>
      persianAdapter.toGregorian({ year: 1404, month: 6, day: 31 })
    ).toThrow(RangeError);
    expect(() =>
      persianAdapter.toGregorian({ year: 1404, month: 0, day: 0 })
    ).toThrow(RangeError);
  });

  it('throws for years outside the breaks-table domain', () => {
    expect(() => persianAdapter.toGregorian({ year: 3400, month: 0, day: 1 })).toThrow(
      RangeError
    );
  });

  it('shifts months with year carry and truncates the day', () => {
    // Esfand 1404 has 29 days, so 1404-11-30 + 1 lands on Farvardin
    // (31 days) with the day intact.
    expect(persianAdapter.addMonths({ year: 1404, month: 11, day: 30 }, 1)).toEqual({
      year: 1405,
      month: 0,
      day: 30,
    });
    // Day 31 into a 30-day month two months away.
    expect(persianAdapter.addMonths({ year: 1404, month: 5, day: 31 }, 2)).toEqual({
      year: 1404,
      month: 7,
      day: 30,
    });
    // Backwards: Shahrivar (30) into Mordad (31) keeps the day.
    expect(persianAdapter.addMonths({ year: 1404, month: 5, day: 30 }, -1)).toEqual({
      year: 1404,
      month: 4,
      day: 30,
    });
    expect(persianAdapter.addMonths({ year: 1404, month: 5, day: 12 }, 0)).toEqual({
      year: 1404,
      month: 5,
      day: 12,
    });
  });

  it('lists month names per locale and style', () => {
    const en = persianAdapter.monthNames();
    expect(en).toHaveLength(12);
    expect(en[0]).toBe('Farvardin');
    expect(en[6]).toBe('Mehr');
    expect(en[11]).toBe('Esfand');
    expect(persianAdapter.monthNames('en', 'short')[11]).toBe('Esfand');
    expect(persianAdapter.monthNames('fa')[0]).toBe('فروردین');
  });

  it('labels every year AP', () => {
    expect(persianAdapter.era?.(1404)).toBe('AP');
    expect(persianAdapter.era?.(1398)).toBe('AP');
    expect(persianAdapter.era?.(1404, 'de')).toBe('AP');
  });

  it('identifies itself as persian', () => {
    expect(persianAdapter.identifier).toBe('persian');
  });
});
