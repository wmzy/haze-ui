/**
 * Axis traversal: the roving-focus arithmetic shared by every component
 * whose items sit on one keyboard axis — menus, toolbars and the
 * NavigationMenu trigger strip (utils/menuKeyboard), the Tabs strip
 * (Tabs/TabList) and the Segmented control (Segmented/SegmentedCore).
 *
 * Two pure halves, so every caller keeps its own DOM reads and side
 * effects:
 *  - {@link axisMove} classifies a key against the layout: which arrow
 *    pair walks the axis (horizontal layouts mirror under
 *    `dir="rtl"`), plus the direction-invariant Home/End;
 *  - {@link axisMoveTarget} turns that move into an item index —
 *    wrapping past both ends, skipping the indices the caller rejects
 *    (disabled items) and settling where the arrows enter while focus
 *    sits on no item.
 *
 * No CSS and no React: sharing it across component families pulls no
 * style or hook into any of them.
 */
import type { Direction } from './direction';

import { inlineAxisKeys } from './direction';

/** Layout axis of a roving container: which arrow pair walks it. */
export type AxisOrientation = 'horizontal' | 'vertical';

/**
 * One resolved main-axis key: a single step along the axis, or a jump
 * to an edge.
 */
export type AxisMove = { step: 1 | -1 } | { edge: 'first' | 'last' };

/**
 * Classify `key` against the orientation's main axis. Horizontal
 * layouts mirror under `dir="rtl"` (ArrowLeft advances); vertical
 * layouts never mirror. Home/End jump to the first/last item and are
 * direction-invariant either way. Any other key yields null.
 */
export function axisMove(
  key: string,
  orientation: AxisOrientation,
  dir: Direction | 'auto'
): AxisMove | null {
  if (key === 'Home') return { edge: 'first' };
  if (key === 'End') return { edge: 'last' };
  const { next, prev } = inlineAxisKeys(orientation, dir);
  if (key === next) return { step: 1 };
  if (key === prev) return { step: -1 };
  return null;
}

/**
 * Search with wrap-around over `[0, length)`: tests `matches` against
 * every index starting at `start` (inclusive), stepping forward (the
 * default) or backward, wrapping past either end; each index is tested
 * exactly once. Callers that pass `current + 1` (both typeahead
 * searches do) make the current item the last candidate, so repeating
 * a character cycles between items starting with it. Negative or
 * overflowing `start` values are normalized modulo `length`. Returns
 * the first matching index, or -1 when nothing matches.
 */
export function findWrapIndex(
  length: number,
  start: number,
  matches: (index: number) => boolean,
  step: 1 | -1 = 1
): number {
  if (length <= 0) return -1;
  const from = ((start % length) + length) % length;
  for (let i = 0; i < length; i += 1) {
    const index = (from + step * i + length) % length;
    if (matches(index)) return index;
  }
  return -1;
}

type AxisTargetOptions = {
  /** Index of the item holding focus; -1 when focus sits on no item. */
  current: number;
  /** Number of items on the axis. */
  length: number;
  /**
   * Which indices can take focus — disabled items answer false and
   * are skipped. Every index qualifies by default: callers whose item
   * query already excluded the unfocusable need not pass one.
   */
  isFocusable?: (index: number) => boolean;
  /**
   * Index the arrows step from while focus sits on no item
   * (`current < 0`). Defaults to the matching end — the forward arrow
   * enters at the first item, the backward arrow at the last (the
   * WAI-ARIA entry rule for menus and toolbars). Edge jumps never use
   * it: Home/End always walk in from their own end.
   */
  entry?: number;
};

const anyIndexFocusable = (): boolean => true;

/**
 * The index `move` lands on among `length` items, skipping every index
 * `isFocusable` rejects and wrapping past both ends; -1 when no item
 * qualifies (the empty list included). Edge jumps and no-focus entry
 * walk in from just outside the list, so Home lands on the first
 * focusable item and End on the last.
 */
export function axisMoveTarget(
  move: AxisMove,
  { current, length, isFocusable = anyIndexFocusable, entry }: AxisTargetOptions
): number {
  if (length <= 0) return -1;
  // Edge jumps walk in from their own end: Home from just before the
  // list, End from just after it.
  if ('edge' in move) {
    const first = move.edge === 'first';
    return findWrapIndex(length, first ? 0 : length - 1, isFocusable, first ? 1 : -1);
  }
  const { step } = move;
  // A step walks from the focused item, else from `entry` (a caller's
  // stand-in for focus), else in from the matching end — the forward
  // arrow enters at the first item, the backward one at the last.
  const outside = step === 1 ? -1 : length;
  const from = current >= 0 ? current : entry ?? outside;
  return findWrapIndex(length, from + step, isFocusable, step);
}
