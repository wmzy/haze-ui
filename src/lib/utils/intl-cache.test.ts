import { countNumberFormatConstructions } from './testing/count-number-formats';

import { cachedFormatter, cachedNumberFormat } from './intl-cache';

/*
 * The caches are module-scoped and intentionally not resettable, so
 * every case works on keys no other case has used — identity and
 * construction-count assertions need untouched keys to mean something.
 */

describe('cachedFormatter', () => {
  it('constructs one instance per key and keeps each cache private to its factory', () => {
    const factory = vi.fn((key: string) => ({ key }));
    const get = cachedFormatter(factory);
    const other = cachedFormatter((key: string) => ({ key, other: true }));

    expect(get('cachedFormatter.once')).toBe(get('cachedFormatter.once'));
    expect(get('cachedFormatter.once')).toEqual({ key: 'cachedFormatter.once' });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(other('cachedFormatter.once')).toEqual({
      key: 'cachedFormatter.once',
      other: true,
    });
  });
});

describe('cachedNumberFormat', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('constructs one formatter per (locale, options), whatever the literal order', () => {
    const constructions = countNumberFormatConstructions();

    const first = cachedNumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      useGrouping: false,
    });
    const again = cachedNumberFormat('en-US', {
      currency: 'EUR',
      useGrouping: false,
      style: 'currency',
    });

    expect(again).toBe(first);
    expect(constructions).toHaveLength(1);
    expect(first.format(1234.5)).toBe('€1234.50');
  });

  it('never caches a construction that throws', () => {
    const constructions = countNumberFormatConstructions();
    const invalid = { minimumFractionDigits: -1 };

    expect(() => cachedNumberFormat('en-US', invalid)).toThrow(RangeError);
    expect(() => cachedNumberFormat('en-US', invalid)).toThrow(RangeError);
    expect(constructions).toHaveLength(2);
  });

  it('does not let a null digit option answer for NaN', () => {
    // JS-only input: Intl reads null as 0, while NaN is a RangeError —
    // and both would serialize to null if values were plain JSON.
    cachedNumberFormat(
      'en-ZA',
      { minimumFractionDigits: null } as unknown as Intl.NumberFormatOptions
    );

    expect(() =>
      cachedNumberFormat('en-ZA', { minimumFractionDigits: NaN })
    ).toThrow(RangeError);
  });

  it('keys on every option: different options under one locale are different formatters', () => {
    const zeroDigits = cachedNumberFormat('en-GB', { maximumFractionDigits: 0 });
    const oneDigit = cachedNumberFormat('en-GB', { maximumFractionDigits: 1 });
    const ungrouped = cachedNumberFormat('en-GB', { useGrouping: false });
    const compact = cachedNumberFormat('en-GB', { notation: 'compact' });
    const plain = cachedNumberFormat('en-GB');
    const formatters = [zeroDigits, oneDigit, ungrouped, compact, plain];

    expect(new Set(formatters).size).toBe(formatters.length);
    expect(zeroDigits.format(1234.567)).toBe('1,235');
    expect(oneDigit.format(1234.567)).toBe('1,234.6');
    expect(ungrouped.format(1234.567)).toBe('1234.567');
    expect(compact.format(1234.567)).toBe('1.2K');
    expect(plain.format(1234.567)).toBe('1,234.567');
  });

  it('keys on the locale', () => {
    const german = cachedNumberFormat('de-DE');
    const american = cachedNumberFormat('en-US');

    expect(german).not.toBe(american);
    expect(german.format(1234.5)).toBe('1.234,5');
    expect(american.format(1234.5)).toBe('1,234.5');
  });

  it('treats undefined-valued options like absent ones', () => {
    const plain = cachedNumberFormat('en-CA');

    expect(cachedNumberFormat('en-CA', {})).toBe(plain);
    expect(
      cachedNumberFormat('en-CA', { style: undefined, useGrouping: undefined })
    ).toBe(plain);
  });

  it('keeps a boolean and a string useGrouping apart', () => {
    const always = cachedNumberFormat('en-NZ', { useGrouping: true });
    const min2 = cachedNumberFormat('en-NZ', { useGrouping: 'min2' });

    expect(min2).not.toBe(always);
    expect(always.format(1000)).toBe('1,000');
    expect(min2.format(1000)).toBe('1000');
  });

  it('keeps the runtime default locale apart from an empty string', () => {
    // Populates the undefined-locale entry first.
    expect(() => cachedNumberFormat()).not.toThrow();
    // '' is an invalid tag: it must throw on its own key, not be served
    // from the default entry.
    expect(() => cachedNumberFormat('')).toThrow(RangeError);
  });
});
