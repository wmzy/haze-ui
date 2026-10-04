/**
 * Edge auto-scroll math for SortableTabList — sibling module per
 * the react-refresh only-export-components rule (Button/styles.ts,
 * Grid/grid-item-styles.ts precedents). Pure so tests can
 * exercise the gesture without layout. Not part of the barrel.
 */

/** Distance from either strip end that arms the auto-scroll, and
 * the steady scroll pace applied per animation frame. */
export const AUTO_SCROLL_EDGE = 48;
export const AUTO_SCROLL_STEP = 10;

/** Per-frame auto-scroll delta for a pointer hovering the strip's
 * ends: positive scrolls toward the right end, negative toward the
 * left, zero mid-strip. The edge zones are inclusive. */
export function edgeScrollDelta(
  stripRect: { left: number; right: number },
  pointerX: number
): number {
  if (pointerX >= stripRect.right - AUTO_SCROLL_EDGE) return AUTO_SCROLL_STEP;
  if (pointerX <= stripRect.left + AUTO_SCROLL_EDGE) return -AUTO_SCROLL_STEP;
  return 0;
}
