/**
 * Shared resize-gesture primitives for the drag-styled grips — the
 * keyboard-delta math and pointer-drag teardown Splitter (percent
 * panes) and Resizable (px panels) both carry. The per-consumer units
 * differ, so the arrow `step` is a parameter; the Home/End park delta
 * is unit-free and shared.
 *
 * Pure TS (type-only React surface); drags release pointer capture
 * through utils/pointer-capture's safe helpers.
 */
import { getDirection } from './direction';
import { releasePointerCaptureSafe } from './pointer-capture';

/** Direction of the layout axis a grip resizes along. */
export type GripOrientation = 'horizontal' | 'vertical';

/** Home/End park the leading pane/panel at its clamp — a delta so
 * large the clamp math saturates, without overflowing. */
export const PARK_DELTA = Number.MAX_SAFE_INTEGER;

/** A grip key's signed delta along the layout axis, or `null` when the
 * key is not a grip key (the caller leaves it to the platform).
 *
 * Grow/shrink follow the group's orientation — ArrowRight/Left on a
 * horizontal axis, ArrowDown/Up on a vertical one. Under RTL the
 * horizontal pair swaps: ArrowRight keeps its screen-space meaning
 * (move the divider right), but that shrinks the lead pane flex paints
 * on the divider's right. */
export function axisKeyDelta(
  key: string,
  {
    orientation,
    rtl,
    step,
  }: { orientation: GripOrientation; rtl: boolean; step: number }
): number | null {
  const growKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
  const shrinkKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
  if (
    key !== growKey &&
    key !== shrinkKey &&
    key !== 'Home' &&
    key !== 'End'
  ) {
    return null;
  }
  // Only the horizontal pair swaps; vertical groups are
  // direction-invariant (the callers' mirrored() gates this too).
  const swap = orientation === 'horizontal' && rtl;
  return key === growKey
    ? swap
      ? -step
      : step
    : key === shrinkKey
      ? swap
        ? step
        : -step
      : key === 'Home'
        ? -PARK_DELTA
        : PARK_DELTA;
}

/** RTL mirror of a grip: in a horizontal group flex paints the DOM-lead
 * pane on the RIGHT under rtl, so rightward motion moves the divider
 * INTO it and must shrink it (read at event time — the
 * utils/direction convention). Vertical groups are
 * direction-invariant. */
export function gripMirrored(
  orientation: GripOrientation,
  el: Element | null
): boolean {
  return orientation === 'horizontal' && getDirection(el) === 'rtl';
}

/** The pointer-identity part every in-flight drag state carries. */
type PointerDrag = { pointerId: number };

/** Ends the drag owned by `event.pointerId`, if any: nulls the ref and
 * releases pointer capture. Returns whether this event's gesture was
 * in flight — callers run their commit/ownership aftermath only then,
 * so a stale pointer (a second finger, a race) tears nothing down. */
export function endPointerDrag(
  dragRef: { current: PointerDrag | null },
  event: { pointerId: number; currentTarget: Element }
): boolean {
  const drag = dragRef.current;
  if (drag?.pointerId !== event.pointerId) return false;
  dragRef.current = null;
  releasePointerCaptureSafe(event.currentTarget, event.pointerId);
  return true;
}
