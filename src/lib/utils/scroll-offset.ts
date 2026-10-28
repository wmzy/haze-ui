/**
 * Logical horizontal scroll offset read/write — the RTL-normalizing
 * pair shared by the scroll surfaces (ScrollArea's scroll-math,
 * VirtualList).
 *
 * Logical scroll offset is the distance scrolled from the start edge
 * (horizontal: inline-start). Horizontal RTL reads `scrollLeft`
 * negated — every evergreen engine reports RTL `scrollLeft` as 0 at the
 * start edge going negative toward the end (CSSOM View), and the
 * negation maps it onto the same "distance from start" scale as LTR.
 *
 * Pure DOM arithmetic — no hooks, no React. The element surface is
 * structural (same contract as scroll-math's `ScrollElementLike`) so
 * jsdom elements, mocks, and test literals all plug in.
 */
import { getDirection } from './direction';

/**
 * Minimal element surface the helpers read/write — structural so test
 * literals plug in alongside real elements.
 */
type ScrollLeftHost = {
  scrollLeft: number;
};

/**
 * Resolve the horizontal direction: callers that already know it
 * (scroll-math receives `rtl` alongside the axis) pass it through;
 * everyone else derives it from the rendered direction at call time.
 * A structural literal that omits `rtl` is not a DOM element and
 * resolves `'ltr'`.
 */
function horizontalIsRtl(
  el: ScrollLeftHost,
  rtl: boolean | undefined
): boolean {
  return rtl ?? getDirection(el instanceof Element ? el : null) === 'rtl';
}

/**
 * Read the logical (inline-start-origin) horizontal scroll offset.
 * RTL `scrollLeft` reads 0 at the inline start (the physical right
 * edge) and goes negative toward the end — negate it into logical
 * units.
 */
export function readLogicalScrollLeft(
  el: ScrollLeftHost,
  rtl?: boolean
): number {
  return horizontalIsRtl(el, rtl) ? -el.scrollLeft : el.scrollLeft;
}

/**
 * Write a logical horizontal scroll offset back to the element
 * (RTL de-normalized).
 */
export function writeLogicalScrollLeft(
  el: ScrollLeftHost,
  value: number,
  rtl?: boolean
): void {
  el.scrollLeft = horizontalIsRtl(el, rtl) ? -value : value;
}
