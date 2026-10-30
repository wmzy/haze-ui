/**
 * Shared skip-disabled index walker — the roving-step primitive behind
 * Calendar's grid keyboards (components/Calendar/grid-roving.ts: the
 * day grid and the month/quarter/year selector grids) and TimeGrid's
 * slot group: step `delta` from a possibly virtual origin, keep
 * stepping while the landing cell is disabled, stop at the edges.
 * Consumers pass their own disabled predicate (DOM `button.disabled`,
 * a Set of slot strings, ...). Pure functions, zero imports: no hooks,
 * no DOM access. No RSC-safe registration needed — both importers are
 * hook-driven client modules (see scripts/rsc-safe.mjs).
 */

/**
 * The next enabled index stepping by `delta` from `from` — the shared
 * body of the former Calendar `focusFrom` and TimeGrid `nextEnabled`
 * walkers.
 *
 * `from` may be a virtual origin outside `[0, length)` — Home/End pass
 * the slot just before/after their row (`rowStart - 1`, `rowEnd + 1`,
 * so -1 and `length` are routine origins) and the first landing is
 * `from + delta`. While a landing cell is disabled the walk keeps its
 * stride (`index += delta`): a column move stays in its column,
 * skipping whole disabled rows rather than crawling to the adjacent
 * cell. The walk never wraps — running off either edge, an
 * all-disabled range, an empty range or a zero stride yields null.
 * `isDisabled` is only consulted for in-range indices.
 */
export function nextEnabledIndex(
  length: number,
  isDisabled: (index: number) => boolean,
  from: number,
  delta: number
): number | null {
  if (delta === 0) return null;
  let index = from + delta;
  while (index >= 0 && index < length && isDisabled(index)) {
    index += delta;
  }
  if (index < 0 || index >= length) return null;
  return index;
}
