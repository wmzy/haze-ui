/**
 * Shared numeric helpers — the one clamp implementation every haze-ui
 * module delegates to (scroll geometry, color math, collision placement,
 * upload progress, splitter ranges). Pure functions, zero imports: no
 * hooks, no DOM access (RSC-safe; see scripts/rsc-safe.mjs).
 */

/**
 * Constrain `value` into the inclusive `[min, max]` range. An inverted
 * range (`min > max`) yields `max` — callers needing different
 * inverted-range semantics keep their own guard (utils/collision.ts pins
 * to `min` so a viewport smaller than the panel clamps at its start).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
