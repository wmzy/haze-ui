/**
 * Shared grid keyboard roving — the WAI-ARIA grid/radiogroup walker
 * behind Calendar's day and selector grids, TimeGrid's slot group and
 * Schedule's month grid. Two layers:
 *
 *  - `nextGridRovingAction` — the pure resolver: one key press plus the
 *    grid geometry becomes the landing cell (skipping disabled cells in
 *    the direction of travel, stopping at the edges, never wrapping);
 *  - `useGridRoving` — the container-level wiring for grids whose cells
 *    are plain buttons: resolves against the live DOM and focuses the
 *    landing button.
 *
 * Key semantics (columns = the row stride):
 *  - ArrowLeft/ArrowRight move one cell, ArrowUp/ArrowDown one row of
 *    `columns` cells; under dir="rtl" the horizontal arrows mirror
 *    (ArrowLeft advances) so the keys follow the painted column order —
 *    the caller passes the rendered direction read at event time
 *    (getDirection on the actual container, see utils/direction.ts);
 *  - Home/End jump to the focused row's first/last cell ('row', the
 *    grid pattern) or the whole grid's first/last enabled cell
 *    ('group', the radiogroup pattern TimeGrid uses);
 *  - PageUp/PageDown resolve to a 'page' action for view-stepping
 *    callers (Calendar's month/period hops); callers that do not page
 *    ignore the action.
 * A recognized roving key whose walk runs off the grid's edge resolves
 * to 'blocked' — callers may still swallow the native scroll; keys that
 * are not roving keys at all resolve to null. Pure logic plus DOM
 * focus wiring, no css.
 */
import type {
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
} from 'react';

import { getDirection } from './direction';
import { nextEnabledIndex } from './skip-walker';

/** Buttons of a grid container in DOM order (disabled ones included —
 * the walker skips them). */
export function dayButtons(grid: HTMLElement | null): HTMLButtonElement[] {
  return Array.from(
    grid?.querySelectorAll<HTMLButtonElement>('button') ?? []
  );
}

/** Home/End geometry: 'row' lands on the focused row's first/last cell
 * (WAI-ARIA grid pattern); 'group' on the whole grid's first/last
 * enabled cell (radiogroup pattern). */
export type GridHomeEnd = 'row' | 'group';

export type GridRovingOptions = {
  /** Cells per row — the ArrowUp/ArrowDown stride and the 'row'
   * Home/End math. */
  columns: number;
  /** Total cell count; walks stop at the grid's edges, never wrap. */
  count: number;
  /** Disabled predicate over cell indices — skipped in the direction
   * of travel (utils/skip-walker semantics). */
  isDisabled: (index: number) => boolean;
  /** Home/End geometry; default 'row'. */
  homeEnd?: GridHomeEnd;
};

/** One resolved roving key press. */
export type GridRovingAction =
  /** The walk landed on `target`. */
  | { type: 'move'; target: number }
  /** PageUp/PageDown — the caller's view hop (delta ±1). */
  | { type: 'page'; delta: number }
  /** A recognized roving key whose walk ran off the grid's edge. */
  | { type: 'blocked' };

/**
 * Resolve one key press on a `columns`-wide grid of `count` cells to
 * the roving action — null when the key is not a grid-roving key at
 * all. `current` is the focused cell index, -1 when the container
 * itself (no cell) holds focus: arrows and Home then walk from the
 * grid's start, End from the first row's end.
 */
export function nextGridRovingAction(
  key: string,
  current: number,
  rtl: boolean,
  { columns, count, isDisabled, homeEnd = 'row' }: GridRovingOptions
): GridRovingAction | null {
  const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
  const backward = forward === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
  const walk = (from: number, delta: number): number | null =>
    nextEnabledIndex(count, isDisabled, from, delta);
  const landed = (target: number | null): GridRovingAction =>
    target === null ? { type: 'blocked' } : { type: 'move', target };
  const origin = current < 0 ? 0 : current;

  switch (key) {
    case forward:
      return landed(walk(origin, 1));
    case backward:
      return landed(walk(origin, -1));
    case 'ArrowDown':
      return landed(walk(origin, columns));
    case 'ArrowUp':
      return landed(walk(origin, -columns));
    case 'Home': {
      // Group mode: the first enabled cell from a virtual origin just
      // before the grid; row mode: from the slot just before the row's
      // start (so a disabled row head keeps skipping in-row).
      const rowStart = current < 0 ? 0 : current - (current % columns);
      return landed(walk(homeEnd === 'group' ? -1 : rowStart - 1, 1));
    }
    case 'End': {
      // Group mode: walk back from just past the grid's end; row mode:
      // from just past the row's end, clamped to the grid (the
      // no-focused-cell default of the first row's last slot).
      const rowEnd =
        homeEnd === 'group'
          ? count - 1
          : current < 0
            ? columns - 1
            : Math.min(
                current - (current % columns) + columns - 1,
                count - 1
              );
      return landed(walk(rowEnd + 1, -1));
    }
    case 'PageUp':
      return { type: 'page', delta: -1 };
    case 'PageDown':
      return { type: 'page', delta: 1 };
    default:
      return null;
  }
}

/**
 * Container-level grid roving over every button inside `gridRef` (the
 * WAI-ARIA grid pattern Calendar's day and selector grids use):
 * `nextGridRovingAction` against the live DOM — arrows/Home/End skip
 * disabled buttons in the direction of travel and focus the landing
 * button, PageUp/PageDown hand to `onPageKey` (the view hop keeping
 * the focused cell), Enter/Space pick via the button's native
 * activation. Under dir="rtl" the horizontal arrows mirror, read from
 * the DOM at event time so the keys follow the mirrored grid.
 */
export function useGridRoving(
  gridRef: RefObject<HTMLElement | null>,
  columns: number,
  onPageKey: (
    delta: number,
    current: number,
    buttons: HTMLButtonElement[]
  ) => void
) {
  return (event: ReactKeyboardEvent<HTMLElement>) => {
    const grid = gridRef.current;
    if (!grid) return;
    const buttons = dayButtons(grid);
    if (buttons.length === 0) return;
    const current = buttons.indexOf(
      (event.target as HTMLElement).closest('button')!
    );
    const action = nextGridRovingAction(
      event.key,
      current,
      getDirection(grid) === 'rtl',
      {
        columns,
        count: buttons.length,
        isDisabled: (index) => buttons[index]!.disabled,
      }
    );
    // Unrecognized keys and edge-blocked walks leave the event alone,
    // exactly like the former Calendar-local walker.
    if (action === null || action.type === 'blocked') return;
    event.preventDefault();
    if (action.type === 'move') {
      buttons[action.target]!.focus();
      return;
    }
    onPageKey(action.delta, current, buttons);
  };
}
