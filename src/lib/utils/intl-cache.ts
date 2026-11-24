/**
 * Shared Intl formatter caches. Intl.DateTimeFormat /
 * Intl.NumberFormat construction is comparatively expensive and the
 * formatters are stateless per key, so call sites keep one instance per
 * key at module scope — DateFieldCore one formatter per locale, CountUp
 * one per decimal count, NumberFormatter / TokenCounter one per locale
 * + options. Lazy construct, cache forever.
 *
 * Two shapes live here:
 *  - cachedFormatter: the generic Map discipline behind a
 *    caller-supplied key (a string, a number). Key normalization stays
 *    with the call sites (e.g. DateFieldCore maps an undefined locale to
 *    its 'default' cache key before calling in).
 *  - cachedNumberFormat: keyed by the (locale, options) pair, which
 *    arrives as a fresh object literal on every render — so the key has
 *    to be structural (see numberFormatKey).
 *
 * Pure TS, zero css.
 */
export function cachedFormatter<K, F>(
  factory: (key: K) => F
): (key: K) => F {
  const cache = new Map<K, F>();
  return (key) => {
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const formatter = factory(key);
    cache.set(key, formatter);
    return formatter;
  };
}

/**
 * Structural cache key for an Intl.NumberFormat: the locale plus every
 * option that affects output.
 *
 * - Every own enumerable option of the plain options object is listed
 *   sorted by name, so two literals spelling the same options in a
 *   different order share one entry.
 * - undefined-valued options are dropped: Intl treats them as absent, so
 *   `{ useGrouping: undefined }` must hit the no-options entry.
 * - Each value is tagged with its typeof, so `true`, `'true'` and `1`
 *   stay different keys (a bare String(value) would fold the first two)
 *   and NaN keeps its own key instead of JSON's null.
 * - The locale sits in an object slot, not an array slot: `undefined`
 *   (runtime default) drops out while `''` (a RangeError) keeps its own
 *   key — an array would fold both to null.
 */
function numberFormatKey(
  locale: string | undefined,
  options: Intl.NumberFormatOptions | undefined
): string {
  const entries: [string, string][] =
    options === undefined
      ? []
      : Object.entries(options)
          .filter(([, value]) => value !== undefined)
          .map(([name, value]) => [name, `${typeof value}:${String(value)}`]);
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return JSON.stringify({ locale, options: entries });
}

const numberFormats = new Map<string, Intl.NumberFormat>();

/**
 * The Intl.NumberFormat for a locale + options pair — the render-time
 * entry point of NumberFormatter and TokenCounter. Constructing with an
 * invalid locale or options throws exactly like a direct
 * `new Intl.NumberFormat(locale, options)` and caches nothing.
 */
export function cachedNumberFormat(
  locale?: string,
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const key = numberFormatKey(locale, options);
  const cached = numberFormats.get(key);
  if (cached !== undefined) return cached;
  const formatter = new Intl.NumberFormat(locale, options);
  numberFormats.set(key, formatter);
  return formatter;
}
