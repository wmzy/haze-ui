import { buddhistAdapter } from './buddhist';

/**
 * The buddhist adapter is Gregorian structure with a constant +543
 * year offset (Buddhist Era). Fixed pairs pin the offset and the
 * year-boundary alignment; the Intl oracle grid confirms the era year
 * ICU itself renders.
 */
const FIXED_PAIRS: readonly {
  gregorian: { year: number; month: number; day: number };
  buddhist: { year: number; month: number; day: number };
}[] = [
  { gregorian: { year: 2000, month: 0, day: 1 }, buddhist: { year: 2543, month: 0, day: 1 } },
  { gregorian: { year: 2024, month: 1, day: 29 }, buddhist: { year: 2567, month: 1, day: 29 } },
  { gregorian: { year: 2025, month: 8, day: 23 }, buddhist: { year: 2568, month: 8, day: 23 } },
  { gregorian: { year: 2026, month: 4, day: 15 }, buddhist: { year: 2569, month: 4, day: 15 } },
];

const DAY_MS = 86400000;

describe('buddhistAdapter', () => {
  it('matches the fixed authoritative pairs (Gregorian → Buddhist Era)', () => {
    for (const pair of FIXED_PAIRS) {
      expect(
        buddhistAdapter.fromGregorian(
          new Date(pair.gregorian.year, pair.gregorian.month, pair.gregorian.day)
        )
      ).toEqual(pair.buddhist);
    }
  });

  it('matches the fixed authoritative pairs (Buddhist Era → Gregorian)', () => {
    for (const pair of FIXED_PAIRS) {
      const date = buddhistAdapter.toGregorian(pair.buddhist);
      expect(date.getFullYear()).toBe(pair.gregorian.year);
      expect(date.getMonth()).toBe(pair.gregorian.month);
      expect(date.getDate()).toBe(pair.gregorian.day);
    }
  });

  it('agrees with Intl on a 47-day grid across 2020–2024 (oracle)', () => {
    const fmt = new Intl.DateTimeFormat('en-u-ca-buddhist', {
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
        buddhistAdapter.fromGregorian(
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
    for (let t = Date.UTC(2020, 0, 1); t <= Date.UTC(2030, 11, 31); t += DAY_MS) {
      const utc = new Date(t);
      const local = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
      const back = buddhistAdapter.toGregorian(buddhistAdapter.fromGregorian(local));
      expect(back.getFullYear()).toBe(local.getFullYear());
      expect(back.getMonth()).toBe(local.getMonth());
      expect(back.getDate()).toBe(local.getDate());
    }
  });

  it('materializes parts as local midnight', () => {
    const date = buddhistAdapter.toGregorian({ year: 2569, month: 4, day: 15 });
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getFullYear()).toBe(2026);
  });

  it('reads the local civil date, not the UTC instant', () => {
    expect(buddhistAdapter.fromGregorian(new Date(2026, 0, 1, 23, 59))).toEqual({
      year: 2569,
      month: 0,
      day: 1,
    });
  });

  it('shares the Gregorian leap rules through the era offset', () => {
    expect(buddhistAdapter.getDaysInMonth(2567, 1)).toBe(29); // 2024
    expect(buddhistAdapter.getDaysInMonth(2568, 1)).toBe(28); // 2025
    // Century rules: 2543 BE = 2000 CE leaps, 2643 BE = 2100 CE does not.
    expect(buddhistAdapter.getDaysInMonth(2543, 1)).toBe(29);
    expect(buddhistAdapter.getDaysInMonth(2643, 1)).toBe(28);
  });

  it('normalizes out-of-range months with carry', () => {
    expect(buddhistAdapter.toGregorian({ year: 2569, month: 12, day: 1 })).toEqual(
      buddhistAdapter.toGregorian({ year: 2570, month: 0, day: 1 })
    );
    expect(buddhistAdapter.getDaysInMonth(2569, -1)).toBe(
      buddhistAdapter.getDaysInMonth(2568, 11)
    );
  });

  it('rejects days that exist in no month', () => {
    expect(() =>
      buddhistAdapter.toGregorian({ year: 2569, month: 1, day: 30 })
    ).toThrow(RangeError);
    expect(() =>
      buddhistAdapter.toGregorian({ year: 2569, month: 0, day: 0 })
    ).toThrow(RangeError);
  });

  it('survives the two-digit Gregorian years of the early era', () => {
    // Buddhist year 608 = 65 CE: the constructor's two-digit-year remap
    // must not push it to 1965.
    const date = buddhistAdapter.toGregorian({ year: 608, month: 0, day: 1 });
    expect(date.getFullYear()).toBe(65);
    const sample = new Date();
    sample.setFullYear(65, 0, 1);
    expect(buddhistAdapter.fromGregorian(sample)).toEqual({
      year: 608,
      month: 0,
      day: 1,
    });
  });

  it('shifts months with year carry and truncates the day', () => {
    expect(buddhistAdapter.addMonths({ year: 2567, month: 0, day: 31 }, 1)).toEqual({
      year: 2567,
      month: 1,
      day: 29,
    });
    expect(buddhistAdapter.addMonths({ year: 2569, month: 11, day: 15 }, 1)).toEqual({
      year: 2570,
      month: 0,
      day: 15,
    });
    expect(buddhistAdapter.addMonths({ year: 2569, month: 5, day: 10 }, 0)).toEqual({
      year: 2569,
      month: 5,
      day: 10,
    });
  });

  it('lists month names per locale and style', () => {
    const en = buddhistAdapter.monthNames();
    expect(en).toHaveLength(12);
    expect(en[0]).toBe('January');
    expect(en[11]).toBe('December');
    expect(buddhistAdapter.monthNames('en', 'short')[0]).toBe('Jan');
    // CLDR ships no localized month names for the buddhist calendar in
    // zh — Intl falls back to numerals, which is still a stable,
    // month-differentiated header row.
    expect(buddhistAdapter.monthNames('zh')[0]).toMatch(/0?1/);
    expect(buddhistAdapter.monthNames('th')[0]).toMatch(/./);
  });

  it('labels every year BE', () => {
    expect(buddhistAdapter.era?.(2569)).toBe('BE');
    expect(buddhistAdapter.era?.(2543)).toBe('BE');
    expect(buddhistAdapter.era?.(2569, 'de')).toBe('BE');
  });

  it('identifies itself as buddhist', () => {
    expect(buddhistAdapter.identifier).toBe('buddhist');
  });
});
