import { hebrewAdapter } from './hebrew';

/**
 * Authoritative Gregorian ↔ Hebrew pairs — verified against Node
 * full-ICU `Intl.DateTimeFormat('en-u-ca-hebrew').formatToParts` (UTC
 * civil timeline). The three Rosh Hashanah anchors pin the molad +
 * postponement machinery (including the 383-day deficient leap year
 * 5784 pushing RH 5785 to October); 2024-03-25 = Adar II 15 pins the
 * intercalated-month layout. ICU renders hebrew months by *name* even
 * for numeric styles (leap months make bare numbers ambiguous), so the
 * oracle grid below cross-walks names to the adapter's positional
 * indices. Development sweep: the arithmetic matched ICU on every day
 * of 1600–2400.
 */
const FIXED_PAIRS: readonly {
  gregorian: { year: number; month: number; day: number };
  hebrew: { year: number; month: number; day: number };
}[] = [
  { gregorian: { year: 2023, month: 8, day: 16 }, hebrew: { year: 5784, month: 0, day: 1 } },
  { gregorian: { year: 2024, month: 2, day: 25 }, hebrew: { year: 5784, month: 6, day: 15 } },
  { gregorian: { year: 2024, month: 9, day: 3 }, hebrew: { year: 5785, month: 0, day: 1 } },
  { gregorian: { year: 2025, month: 8, day: 23 }, hebrew: { year: 5786, month: 0, day: 1 } },
  { gregorian: { year: 2026, month: 0, day: 1 }, hebrew: { year: 5786, month: 3, day: 12 } },
];

const DAY_MS = 86400000;

/** The thirteen ICU month names in leap-year order; common years keep
 * the same names minus "Adar I" with "Adar II" collapsing to "Adar". */
const LEAP_MONTH_NAMES: readonly string[] = [
  'Tishri', 'Heshvan', 'Kislev', 'Tevet', 'Shevat',
  'Adar I', 'Adar II',
  'Nisan', 'Iyar', 'Sivan', 'Tamuz', 'Av', 'Elul',
];

/** Positional month index of an ICU-rendered hebrew month name: leap
 * years use all thirteen slots; common years drop one Adar slot, so
 * every name after Shevat shifts down by one ("Adar" itself is the
 * common-year name of slot 5). */
function monthIndexFromName(name: string, isLeap: boolean): number {
  if (name === 'Adar') return 5;
  const index = LEAP_MONTH_NAMES.indexOf(name);
  if (index < 0) throw new Error(`Unexpected hebrew month name: ${name}`);
  return isLeap || index <= 5 ? index : index - 1;
}

function isHebrewLeap(year: number): boolean {
  return ((year * 7 + 1) % 19) < 7;
}

describe('hebrewAdapter', () => {
  it('matches the fixed authoritative pairs (Gregorian → Hebrew)', () => {
    for (const pair of FIXED_PAIRS) {
      expect(
        hebrewAdapter.fromGregorian(
          new Date(pair.gregorian.year, pair.gregorian.month, pair.gregorian.day)
        )
      ).toEqual(pair.hebrew);
    }
  });

  it('matches the fixed authoritative pairs (Hebrew → Gregorian)', () => {
    for (const pair of FIXED_PAIRS) {
      const date = hebrewAdapter.toGregorian(pair.hebrew);
      expect(date.getFullYear()).toBe(pair.gregorian.year);
      expect(date.getMonth()).toBe(pair.gregorian.month);
      expect(date.getDate()).toBe(pair.gregorian.day);
    }
  });

  it('agrees with Intl on a 47-day grid across 2020–2024 (oracle)', () => {
    // Every 47th day from 2020-01-01 for five years — 39 samples
    // crossing the leap year 5784 (Adar I/II), both Rosh Hashanah
    // weekday postponements in the window and the complete year 5785.
    const fmt = new Intl.DateTimeFormat('en-u-ca-hebrew', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    for (let t = Date.UTC(2020, 0, 1); t <= Date.UTC(2024, 11, 31); t += 47 * DAY_MS) {
      const expected: Record<string, string> = {};
      for (const part of fmt.formatToParts(new Date(t))) {
        if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
          expected[part.type] = part.value;
        }
      }
      const utc = new Date(t);
      const intlYear = Number(expected.year);
      expect(
        hebrewAdapter.fromGregorian(
          new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate())
        )
      ).toEqual({
        year: intlYear,
        month: monthIndexFromName(expected.month ?? '', isHebrewLeap(intlYear)),
        day: Number(expected.day),
      });
    }
  });

  it('round-trips every day of 2020–2030', () => {
    // Dense sweep across Rosh Hashanah boundaries, the variable Adar
    // layout, and the defective/regular/complete Heshvan-Kislev pairs
    // of 5784–5791.
    for (let t = Date.UTC(2020, 0, 1); t <= Date.UTC(2030, 11, 31); t += DAY_MS) {
      const utc = new Date(t);
      const local = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
      const back = hebrewAdapter.toGregorian(hebrewAdapter.fromGregorian(local));
      expect(back.getFullYear()).toBe(local.getFullYear());
      expect(back.getMonth()).toBe(local.getMonth());
      expect(back.getDate()).toBe(local.getDate());
    }
  });

  it('materializes parts as local midnight', () => {
    const date = hebrewAdapter.toGregorian({ year: 5786, month: 0, day: 1 });
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getFullYear()).toBe(2025);
  });

  it('reads the local civil date, not the UTC instant', () => {
    // 2026-01-01 local is 5786-04-12 (Tevet) in every zone: parts
    // follow the wall clock because the conversion reads local fields
    // first.
    expect(hebrewAdapter.fromGregorian(new Date(2026, 0, 1, 23, 59))).toEqual({
      year: 5786,
      month: 3,
      day: 12,
    });
  });

  it('intercalates Adar I/II in leap years only (Metonic cycle)', () => {
    // 5784 and 5787 are leap (years 3/6/8/11/14/17/19 of the cycle):
    // months 5/6 are the 30-day Adar I and 29-day Adar II. Common
    // years hold a single 29-day Adar at index 5 with Nisan at 6.
    expect(isHebrewLeap(5784)).toBe(true);
    expect(isHebrewLeap(5785)).toBe(false);
    expect(hebrewAdapter.getDaysInMonth(5784, 5)).toBe(30);
    expect(hebrewAdapter.getDaysInMonth(5784, 6)).toBe(29);
    expect(hebrewAdapter.getDaysInMonth(5785, 5)).toBe(29);
    expect(hebrewAdapter.getDaysInMonth(5785, 6)).toBe(30); // Nisan
    expect(hebrewAdapter.getDaysInMonth(5787, 5)).toBe(30);
    expect(hebrewAdapter.getDaysInMonth(5787, 6)).toBe(29);
  });

  it('reports the month-length tables and year types of 5784–5787', () => {
    // From ICU's own year lengths: 5784 defective leap (383),
    // 5785 complete common (355), 5786 regular common (354),
    // 5787 complete leap (385) — Heshvan/Kislev encode the type.
    const EXPECTED: Readonly<Record<number, { months: number; yearLength: number; heshvan: number; kislev: number }>> = {
      5784: { months: 13, yearLength: 383, heshvan: 29, kislev: 29 },
      5785: { months: 12, yearLength: 355, heshvan: 30, kislev: 30 },
      5786: { months: 12, yearLength: 354, heshvan: 29, kislev: 30 },
      5787: { months: 13, yearLength: 385, heshvan: 30, kislev: 30 },
    };
    for (const [yearRaw, expected] of Object.entries(EXPECTED)) {
      const year = Number(yearRaw);
      let total = 0;
      for (let month = 0; month < expected.months; month += 1) {
        const length = hebrewAdapter.getDaysInMonth(year, month);
        expect(length === 29 || length === 30).toBe(true);
        total += length;
      }
      expect(total).toBe(expected.yearLength);
      expect(hebrewAdapter.getDaysInMonth(year, 1)).toBe(expected.heshvan);
      expect(hebrewAdapter.getDaysInMonth(year, 2)).toBe(expected.kislev);
    }
  });

  it('keeps month starts contiguous', () => {
    // Day 1 of month m+1 must be exactly `daysInMonth(m)` days after
    // day 1 of month m — the molad arithmetic cannot be off by a day.
    for (const year of [5784, 5785, 5786, 5787]) {
      const months = isHebrewLeap(year) ? 13 : 12;
      for (let month = 0; month < months - 1; month += 1) {
        const next = hebrewAdapter.addMonths({ year, month, day: 1 }, 1);
        const startMs = hebrewAdapter.toGregorian({ year, month, day: 1 }).getTime();
        const endMs = hebrewAdapter.toGregorian(next).getTime();
        expect((endMs - startMs) / DAY_MS).toBe(
          hebrewAdapter.getDaysInMonth(year, month)
        );
      }
    }
  });

  it('normalizes out-of-range months with carry across variable years', () => {
    // Month 13 of common 5785 and month 14 of leap 5784 both land on
    // Tishri 1 of the next year.
    expect(hebrewAdapter.toGregorian({ year: 5785, month: 12, day: 1 })).toEqual(
      hebrewAdapter.toGregorian({ year: 5786, month: 0, day: 1 })
    );
    expect(hebrewAdapter.toGregorian({ year: 5784, month: 13, day: 1 })).toEqual(
      hebrewAdapter.toGregorian({ year: 5785, month: 0, day: 1 })
    );
    // Tishri 5785 minus one month is leap 5784's Elul (month 12), not
    // Av (month 11).
    expect(hebrewAdapter.getDaysInMonth(5785, -1)).toBe(
      hebrewAdapter.getDaysInMonth(5784, 12)
    );
  });

  it('rejects days that exist in no Hebrew month', () => {
    expect(() =>
      hebrewAdapter.toGregorian({ year: 5786, month: 0, day: 31 })
    ).toThrow(RangeError);
    expect(() =>
      hebrewAdapter.toGregorian({ year: 5784, month: 6, day: 30 })
    ).toThrow(RangeError);
    expect(() =>
      hebrewAdapter.toGregorian({ year: 5786, month: 3, day: 0 })
    ).toThrow(RangeError);
  });

  it('shifts months across variable-length years and truncates the day', () => {
    // Elul 29 (5784) + 1 → Tishri 29 (5785): year carry into a 30-day
    // month keeps the day.
    expect(hebrewAdapter.addMonths({ year: 5784, month: 12, day: 29 }, 1)).toEqual({
      year: 5785,
      month: 0,
      day: 29,
    });
    // Adar II 29 → Nisan 29.
    expect(hebrewAdapter.addMonths({ year: 5784, month: 6, day: 29 }, 1)).toEqual({
      year: 5784,
      month: 7,
      day: 29,
    });
    // Common 5785 Adar 29 back six months lands on leap 5784's Elul.
    expect(hebrewAdapter.addMonths({ year: 5785, month: 5, day: 29 }, -6)).toEqual({
      year: 5784,
      month: 12,
      day: 29,
    });
    // Day 30 into the 29-day Adar of a common year clamps.
    expect(hebrewAdapter.addMonths({ year: 5785, month: 4, day: 30 }, 1)).toEqual({
      year: 5785,
      month: 5,
      day: 29,
    });
    expect(hebrewAdapter.addMonths({ year: 5786, month: 3, day: 12 }, 0)).toEqual({
      year: 5786,
      month: 3,
      day: 12,
    });
  });

  it('lists the common-year month names per locale and style', () => {
    const en = hebrewAdapter.monthNames();
    expect(en).toHaveLength(12);
    expect(en[0]).toBe('Tishri');
    expect(en[5]).toBe('Adar');
    expect(en[11]).toBe('Elul');
    expect(hebrewAdapter.monthNames('en', 'short')[0]).toBe('Tishri');
    expect(hebrewAdapter.monthNames('he')[0]).toBe('תשרי');
  });

  it('labels every year AM', () => {
    expect(hebrewAdapter.era?.(5786)).toBe('AM');
    expect(hebrewAdapter.era?.(5784)).toBe('AM');
  });

  it('identifies itself as hebrew', () => {
    expect(hebrewAdapter.identifier).toBe('hebrew');
  });
});
