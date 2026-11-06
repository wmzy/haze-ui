/**
 * Shared per-key Intl formatter cache. Intl.DateTimeFormat /
 * Intl.NumberFormat construction is comparatively expensive and the
 * formatters are stateless per key, so call sites memoize one instance
 * per key at module scope — DateFieldCore one formatter per locale,
 * CountUp one per decimal count. Lazy construct, cache forever.
 *
 * Key normalization stays with the call sites (e.g. DateFieldCore maps
 * an undefined locale to its 'default' cache key before calling in);
 * this helper only owns the Map discipline. Pure TS, zero css.
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
