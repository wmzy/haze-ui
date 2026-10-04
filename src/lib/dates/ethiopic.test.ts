import { ethiopicAdapter } from './ethiopic';

/**
 * Authoritative Gregorian ↔ Ethiopic pairs — verified against Node
 * full-ICU `Intl.DateTimeFormat('en-u-ca-ethiopic').formatToParts` (UTC
 * civil timeline). The New Year anchors pin the September 11 rule and
 * its post-leap drift (2015 being a leap year with Pagume 6 puts
 * 1 Maskaram 2016 on 2023-09-12); 2023-09-11 is Pagume 6 of 2015.
 * Development sweep: the arithmetic matched ICU on every day of
 * 1900–2100.
 */
const FIXED_PAIRS: readonly {
  gregorian: { year: number; month: number; day: number };
  ethiopic: { year: number; month: number; day: number };
}[] = [
  { gregorian: { year: 2020, month: 0, day: 1 }, ethiopic: { year: 2012, month: 3, day: 22 } },
  { gregorian: { year: 2023, month: 8, day: 11 }, ethiopic: { year: 2015, month: 12, day: 6 } },
  { gregorian: { year: 2023, month: 8, day: 12 }, ethiopic: { year: 2016, month: 0, day: 1 } },
  { gregorian: { year: 2025, month: 8, day: 11 }, ethiopic: { year: 2018, month: 0, day: 1 } },
  { gregorian: { year: 2026, month: 0, day: 1 }, ethiopic: { year: 2018, month: 3, day: 23 } },
];

const DAY_MS = 86400000;

describe('ethiopicAdapter', () => {
  it('matches the fixed authoritative pairs (Gregorian → Ethiopic)', () => {
    for (const pair of FIXED_PAIRS) {
      expect(
        ethiopicAdapter.fromGregorian(
          new Date(pair.gregorian.year, pair.gregorian.month, pair.gregorian.day)
        )
      ).toEqual(pair.ethiopic);
    }
  });

  it('matches the fixed authoritative pairs (Ethiopic → Gregorian)', () => {
    for (const pair of FIXED_PAIRS) {
      const date = ethiopicAdapter.toGregorian(pair.ethiopic);
      expect(date.getFullYear()).toBe(pair.gregorian.year);
      expect(date.getMonth()).toBe(pair.gregorian.month);
      expect(date.getDate()).toBe(pair.gregorian.day);
    }
  });

  it('agrees with Intl on a 47-day grid across 2020–2024 (oracle)', () => {
    // Every 47th day from 2020-01-01 for five years — 39 samples
    // stepping over New Year drifts, Pagume tails and both year
    // lengths; any divergence from ICU is a bug in the epoch math.
    const fmt = new Intl.DateTimeFormat('en-u-ca-ethiopic', {
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
        ethiopicAdapter.fromGregorian(
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
    // Dense sweep across New Year boundaries and Pagume tails of both
    // lengths.
    for (let t = Date.UTC(2020, 0, 1); t <= Date.UTC(2030, 11, 31); t += DAY_MS) {
      const utc = new Date(t);
      const local = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
      const back = ethiopicAdapter.toGregorian(ethiopicAdapter.fromGregorian(local));
      expect(back.getFullYear()).toBe(local.getFullYear());
      expect(back.getMonth()).toBe(local.getMonth());
      expect(back.getDate()).toBe(local.getDate());
    }
  });

  it('materializes parts as local midnight', () => {
    const date = ethiopicAdapter.toGregorian({ year: 2018, month: 0, day: 1 });
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getFullYear()).toBe(2025);
  });

  it('reads the local civil date, not the UTC instant', () => {
    // 2026-01-01 local is 2018-04-23 (Tahsas) in every zone: parts
    // follow the wall clock because the conversion reads local fields
    // first.
    expect(ethiopicAdapter.fromGregorian(new Date(2026, 0, 1, 23, 59))).toEqual({
      year: 2018,
      month: 3,
      day: 23,
    });
  });

  it('reports twelve 30-day months plus Pagume 5/6', () => {
    // Leap years (Pagume 6, year ≡ 3 mod 4) in this window:
    // 2011, 2015, 2019, 2023, 2027.
    const leaps: number[] = [];
    for (let year = 2010; year <= 2030; year += 1) {
      for (let month = 0; month < 12; month += 1) {
        expect(ethiopicAdapter.getDaysInMonth(year, month)).toBe(30);
      }
      const pagume = ethiopicAdapter.getDaysInMonth(year, 12);
      expect(pagume === 5 || pagume === 6).toBe(true);
      if (pagume === 6) leaps.push(year);
    }
    expect(leaps).toEqual([2011, 2015, 2019, 2023, 2027]);
    expect(ethiopicAdapter.getDaysInMonth(2015, 12)).toBe(6);
    expect(ethiopicAdapter.getDaysInMonth(2012, 12)).toBe(5);
  });

  it('keeps month starts contiguous', () => {
    // Day 1 of month m+1 must be exactly `daysInMonth(m)` days after
    // day 1 of month m — including the short Pagume → Maskaram wrap.
    for (const year of [2014, 2015, 2016, 2017]) {
      for (let month = 0; month < 13; month += 1) {
        const next = ethiopicAdapter.addMonths({ year, month, day: 1 }, 1);
        const startMs = ethiopicAdapter.toGregorian({ year, month, day: 1 }).getTime();
        const endMs = ethiopicAdapter.toGregorian(next).getTime();
        expect((endMs - startMs) / DAY_MS).toBe(
          ethiopicAdapter.getDaysInMonth(year, month)
        );
      }
    }
  });

  it('normalizes out-of-range months with carry', () => {
    expect(ethiopicAdapter.toGregorian({ year: 2018, month: 13, day: 1 })).toEqual(
      ethiopicAdapter.toGregorian({ year: 2019, month: 0, day: 1 })
    );
    expect(ethiopicAdapter.getDaysInMonth(2018, -1)).toBe(
      ethiopicAdapter.getDaysInMonth(2017, 12)
    );
  });

  it('rejects days that exist in no Ethiopic month', () => {
    // Pagume 6 of a common year, day 31 of a 30-day month, day 0.
    expect(() =>
      ethiopicAdapter.toGregorian({ year: 2012, month: 12, day: 6 })
    ).toThrow(RangeError);
    expect(() =>
      ethiopicAdapter.toGregorian({ year: 2018, month: 0, day: 31 })
    ).toThrow(RangeError);
    expect(() =>
      ethiopicAdapter.toGregorian({ year: 2018, month: 5, day: 0 })
    ).toThrow(RangeError);
  });

  it('survives the two-digit Gregorian years of the early era', () => {
    // Ethiopic year 91 = 98 CE: the constructor's two-digit-year remap
    // must not push it to 1998.
    const date = ethiopicAdapter.toGregorian({ year: 91, month: 0, day: 1 });
    expect(date.getFullYear()).toBe(98);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(27);
    const sample = new Date();
    sample.setFullYear(98, 7, 27);
    expect(ethiopicAdapter.fromGregorian(sample)).toEqual({
      year: 91,
      month: 0,
      day: 1,
    });
  });

  it('shifts months with year carry and truncates the day', () => {
    // Pagume 5 + 1 → next Maskaram keeps the day.
    expect(ethiopicAdapter.addMonths({ year: 2017, month: 12, day: 5 }, 1)).toEqual({
      year: 2018,
      month: 0,
      day: 5,
    });
    // Day 30 into Pagume clamps to 5 (2017 common) / 6 (2015 leap).
    expect(ethiopicAdapter.addMonths({ year: 2017, month: 11, day: 30 }, 1)).toEqual({
      year: 2017,
      month: 12,
      day: 5,
    });
    expect(ethiopicAdapter.addMonths({ year: 2015, month: 11, day: 30 }, 1)).toEqual({
      year: 2015,
      month: 12,
      day: 6,
    });
    expect(ethiopicAdapter.addMonths({ year: 2018, month: 3, day: 23 }, 0)).toEqual({
      year: 2018,
      month: 3,
      day: 23,
    });
  });

  it('lists thirteen month names including Pagume', () => {
    const en = ethiopicAdapter.monthNames();
    expect(en).toHaveLength(13);
    expect(en[0]).toBe('Meskerem');
    expect(en[11]).toBe('Nehasse');
    expect(en[12]).toBe('Pagumen');
    expect(ethiopicAdapter.monthNames('en', 'short')[0]).toBe('Meskerem');
  });

  it('labels every year AM (Amete Mihret)', () => {
    expect(ethiopicAdapter.era?.(2018)).toBe('AM');
    expect(ethiopicAdapter.era?.(2012)).toBe('AM');
  });

  it('identifies itself as ethiopic', () => {
    expect(ethiopicAdapter.identifier).toBe('ethiopic');
  });
});
