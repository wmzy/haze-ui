/*
 * Deprecation warnings for the public API surface.
 *
 * A deprecated prop, alias or component warns through this helper instead
 * of calling console.warn directly: the `[haze-ui]` prefix keeps the
 * library's output greppable, the module-level Set keeps a repeat offender
 * (a deprecated prop re-read on every render) from flooding the console,
 * and the production guard keeps both the warning and the dedup
 * bookkeeping out of consumer production builds. Bundlers replace
 * `process.env.NODE_ENV` with a literal and dead-code-eliminate the call;
 * the `typeof process` guard keeps that same reference safe in browsers
 * and other process-less runtimes, where the warning simply stays on.
 *
 * Message style follows the existing dev warnings (Command.tsx,
 * DataTable.tsx): name the deprecated surface, state the replacement and
 * the removal window, e.g.
 *   warnDeprecated(
 *     'ButtonLink.alias',
 *     "ButtonLink is deprecated — use <Button as='a'> instead; the alias is removed in the next major."
 *   );
 */

/**
 * Dedup identity of one deprecation notice: the first call for a key
 * warns, every later call is silent. Pick a stable, greppable name that
 * names the deprecated surface — `'ButtonLink.alias'`, `'Tag.variant'` —
 * it never reaches the console, it only buckets the warning.
 */
export type DeprecationKey = string;

/** Keys that already warned — module-scoped, so one page load sees each deprecation exactly once. */
const warned = new Set<DeprecationKey>();

const isProductionBuild = (): boolean =>
  typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

/**
 * Warn, at most once per `key`, that a public API surface is deprecated.
 * No-op in production; in browsers without a `process` global the warning
 * fires like in any dev build.
 */
export function warnDeprecated(key: DeprecationKey, message: string): void {
  if (isProductionBuild()) return;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[haze-ui] ${message}`);
}
