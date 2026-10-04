import { japaneseAdapter } from './japanese';

/**
 * The japanese adapter keeps Gregorian structure and the Gregorian
 * year number; only the era *label* segments at imperial accessions.
 * The fixed pairs below double as identity anchors, and the Intl oracle
 * grid reconstructs the Gregorian year from the era-relative year part
 * (Reiwa 8 = 2018 + 8 = 2026) — the same relationship ICU renders.
 */
const FIXED_PAIRS: readonly {
  gregorian: { year: number; month: number; day: number };
  japanese: { year: number; month: number; day: number };
}[] = [
  { gregorian: { year: 2020, month: 0, day: 1 }, japanese: { year: 2020, month: 0, day: 1 } },
  { gregorian: { year: 2024, month: 1, day: 29 }, japanese: { year: 2024, month: 1, day: 29 } },
  { gregorian: { year: 2025, month: 8, day: 23 }, japanese: { year: 2025, month: 8, day: 23 } },
  { gregorian: { year: 2026, month: 0, day: 1 }, japanese: { year: 2026, month: 0, day: 1 } },
];

const DAY_MS = 86400000;

/** Era accession years (Gregorian year in which era year 1 began)
 * minus one — gregorian = base + era-relative year. 2020–2025 sit
 * wholly inside Reiwa (base 2018). */
const ERA_BASE_YEARS: Readonly<Record<string, number>> = {
  Reiwa: 2018,
  Heisei: 1988,
  'Shōwa': 1925,
  'Taishō': 1911,
  Meiji: 1867,
};

describe('japaneseAdapter', () => {
  it('is the identity on parts (Gregorian structure, Gregorian year)', () => {
    for (const pair of FIXED_PAIRS) {
      expect(
        japaneseAdapter.fromGregorian(
          new Date(pair.gregorian.year, pair.gregorian.month, pair.gregorian.day)
        )
      ).toEqual(pair.japanese);
      const date = japaneseAdapter.toGregorian(pair.japanese);
      expect(date.getFullYear()).toBe(pair.gregorian.year);
      expect(date.getMonth()).toBe(pair.gregorian.month);
      expect(date.getDate()).toBe(pair.gregorian.day);
    }
  });

  it('agrees with Intl on a 47-day grid across 2020–2024 (oracle)', () => {
    // The era-relative year part plus the era name reconstructs the
    // Gregorian year; month/day compare directly.
    const fmt = new Intl.DateTimeFormat('en-u-ca-japanese', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      era: 'short',
    });
    for (let t = Date.UTC(2020, 0, 1); t <= Date.UTC(2024, 11, 31); t += 47 * DAY_MS) {
      const expected: Record<string, number | string> = {};
      for (const part of fmt.formatToParts(new Date(t))) {
        if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
          expected[part.type] = Number(part.value);
        } else if (part.type === 'era') {
          expected.era = part.value;
        }
      }
      const utc = new Date(t);
      const parts = japaneseAdapter.fromGregorian(
        new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate())
      );
      const base = ERA_BASE_YEARS[String(expected.era)];
      if (base === undefined) {
        throw new Error(`Unexpected era from Intl: ${String(expected.era)}`);
      }
      expect(parts.year).toBe(base + Number(expected.year));
      expect(parts.month).toBe(Number(expected.month) - 1);
      expect(parts.day).toBe(Number(expected.day));
    }
  });

  it('round-trips every day of 2020–2030', () => {
    for (let t = Date.UTC(2020, 0, 1); t <= Date.UTC(2030, 11, 31); t += DAY_MS) {
      const utc = new Date(t);
      const local = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
      const back = japaneseAdapter.toGregorian(japaneseAdapter.fromGregorian(local));
      expect(back.getFullYear()).toBe(local.getFullYear());
      expect(back.getMonth()).toBe(local.getMonth());
      expect(back.getDate()).toBe(local.getDate());
    }
  });

  it('materializes parts as local midnight', () => {
    const date = japaneseAdapter.toGregorian({ year: 2026, month: 4, day: 15 });
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
  });

  it('delegates month lengths to the Gregorian leap rules', () => {
    expect(japaneseAdapter.getDaysInMonth(2024, 1)).toBe(29);
    expect(japaneseAdapter.getDaysInMonth(2026, 1)).toBe(28);
    // Century rules: 2000 leaps, 2100 does not.
    expect(japaneseAdapter.getDaysInMonth(2000, 1)).toBe(29);
    expect(japaneseAdapter.getDaysInMonth(2100, 1)).toBe(28);
  });

  it('normalizes out-of-range months with carry', () => {
    expect(japaneseAdapter.toGregorian({ year: 2026, month: 12, day: 1 })).toEqual(
      japaneseAdapter.toGregorian({ year: 2027, month: 0, day: 1 })
    );
    expect(japaneseAdapter.getDaysInMonth(2026, -1)).toBe(
      japaneseAdapter.getDaysInMonth(2025, 11)
    );
  });

  it('rejects days that exist in no month', () => {
    expect(() =>
      japaneseAdapter.toGregorian({ year: 2026, month: 1, day: 30 })
    ).toThrow(RangeError);
    expect(() =>
      japaneseAdapter.toGregorian({ year: 2026, month: 0, day: 0 })
    ).toThrow(RangeError);
  });

  it('shifts months with year carry and truncates the day', () => {
    expect(japaneseAdapter.addMonths({ year: 2024, month: 0, day: 31 }, 1)).toEqual({
      year: 2024,
      month: 1,
      day: 29,
    });
    expect(japaneseAdapter.addMonths({ year: 2026, month: 11, day: 15 }, 1)).toEqual({
      year: 2027,
      month: 0,
      day: 15,
    });
    expect(japaneseAdapter.addMonths({ year: 2026, month: 5, day: 10 }, 0)).toEqual({
      year: 2026,
      month: 5,
      day: 10,
    });
  });

  it('lists month names per locale and style', () => {
    const en = japaneseAdapter.monthNames();
    expect(en).toHaveLength(12);
    expect(en[0]).toBe('January');
    expect(en[11]).toBe('December');
    expect(japaneseAdapter.monthNames('ja')[0]).toBe('1月');
    expect(japaneseAdapter.monthNames('ja')[11]).toBe('12月');
  });

  it('labels eras via Intl (June 1 sampling)', () => {
    expect(japaneseAdapter.era?.(2026)).toBe('Reiwa');
    expect(japaneseAdapter.era?.(2019)).toBe('Reiwa');
    expect(japaneseAdapter.era?.(2018)).toBe('Heisei');
    expect(japaneseAdapter.era?.(1990)).toBe('Heisei');
    expect(japaneseAdapter.era?.(1970)).toBe('Shōwa');
    expect(japaneseAdapter.era?.(1930)).toBe('Shōwa');
    expect(japaneseAdapter.era?.(1915)).toBe('Taishō');
    expect(japaneseAdapter.era?.(1900)).toBe('Meiji');
    expect(japaneseAdapter.era?.(2026, 'ja')).toBe('令和');
  });

  it('identifies itself as japanese', () => {
    expect(japaneseAdapter.identifier).toBe('japanese');
  });
});
