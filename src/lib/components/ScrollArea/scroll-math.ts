/**
 * Pure scroll/thumb geometry for the ScrollArea family.
 *
 * jsdom has no layout engine (every extent reads 0), so the math is
 * extracted here as pure functions over plain numbers: unit tests cover
 * the math directly, component tests cover the DOM wiring with mocked
 * extents.
 *
 * Axis vocabulary (vertical examples):
 * - `viewportSize` — `clientHeight`, the visible extent
 * - `scrollSize`   — `scrollHeight`, the content extent
 * - `trackSize`    — the scrollbar track's extent
 * - `scrollOffset` — `scrollTop`, distance from the scroll *start*
 *   (logical units, see RTL below)
 * - `thumbOffset`  — the thumb's displacement from the track's
 *   *physical* start (top for vertical, left for horizontal)
 *
 * RTL: horizontal offsets stay *logical* (0 = inline start = the
 * physical right edge), normalized against the spec-aligned `scrollLeft`
 * scale that reads 0 at the start and goes negative toward the end —
 * the same convention VirtualList normalizes. The thumb's physical
 * position mirrors: logical progress 0 parks it at the right edge.
 */

import { clamp } from '../../utils/math';

/** Axis a scrollbar/thumb operates on. */
export type Orientation = 'vertical' | 'horizontal';

/**
 * Smallest rendered thumb (px) — keeps the grab target reachable when
 * the content is huge (WCAG 2.5.8 target-size spirit). Layout geometry,
 * not a visual token: it feeds the same math that consumes px extents.
 */
export const MIN_THUMB_SIZE = 24;

/**
 * Minimal element surface the readers/writers need — test literals and
 * jsdom elements (real or mocked) both plug in.
 */
type ScrollElementLike = {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
  clientWidth: number;
  scrollWidth: number;
  scrollLeft: number;
};

/**
 * The shared clamp (utils/math), kept on this module's public surface —
 * the geometry below calls it pervasively and the family's tests reach
 * for it through scroll-math.
 */
export { clamp };

export type AxisGeometryInput = {
  viewportSize: number;
  scrollSize: number;
  trackSize: number;
  /** Distance from the scroll start (logical units). */
  scrollOffset: number;
  /** Floor for the thumb extent; defaults to {@link MIN_THUMB_SIZE}. */
  minThumbSize?: number;
  /** Mirror the thumb along the track (horizontal RTL). */
  rtl?: boolean;
};

export type AxisGeometry = {
  /** Whether the axis has overflow at all. */
  scrollable: boolean;
  /** Fraction [0,1] of the content the viewport shows. */
  ratio: number;
  /** Thumb extent in px; 0 when not scrollable. */
  thumbSize: number;
  /** Thumb displacement from the track's physical start in px. */
  thumbOffset: number;
  /** Largest scroll offset (px). */
  maxScroll: number;
  /** Largest thumb displacement (px). */
  maxThumbOffset: number;
};

/** Thumb size and position for one axis from its extents. */
export function axisGeometry(input: AxisGeometryInput): AxisGeometry {
  const {
    viewportSize,
    scrollSize,
    trackSize,
    scrollOffset,
    minThumbSize = MIN_THUMB_SIZE,
    rtl = false,
  } = input;
  const maxScroll = Math.max(0, scrollSize - viewportSize);
  if (maxScroll <= 0 || trackSize <= 0) {
    return {
      scrollable: false,
      ratio: 1,
      thumbSize: 0,
      thumbOffset: 0,
      maxScroll: 0,
      maxThumbOffset: 0,
    };
  }
  const ratio = clamp(viewportSize / scrollSize, 0, 1);
  const thumbSize = clamp(
    ratio * trackSize,
    Math.min(minThumbSize, trackSize),
    trackSize
  );
  const maxThumbOffset = trackSize - thumbSize;
  const progress = clamp(scrollOffset / maxScroll, 0, 1);
  const logical = progress * maxThumbOffset;
  return {
    scrollable: true,
    ratio,
    thumbSize,
    thumbOffset: rtl ? maxThumbOffset - logical : logical,
    maxScroll,
    maxThumbOffset,
  };
}

/** Inverse of {@link axisGeometry}'s offset: physical thumb position → scroll offset. */
function scrollForThumbOffset(
  thumbOffset: number,
  geometry: AxisGeometry,
  rtl: boolean
): number {
  if (geometry.maxThumbOffset <= 0) return 0;
  const progress = clamp(thumbOffset / geometry.maxThumbOffset, 0, 1);
  const logical = rtl ? 1 - progress : progress;
  return logical * geometry.maxScroll;
}

export type ThumbDragInput = {
  /** Thumb displacement from the track start at grab time (physical px). */
  thumbStart: number;
  /** Pointer travel since grab (px, positive = toward the track's physical end). */
  pointerDelta: number;
  viewportSize: number;
  scrollSize: number;
  trackSize: number;
  minThumbSize?: number;
  rtl?: boolean;
};

/**
 * Scroll offset a thumb drag must produce: travel the thumb by the
 * pointer delta (mirrored in RTL), then invert the offset mapping.
 */
export function thumbDragToScroll(input: ThumbDragInput): number {
  const geometry = axisGeometry({ ...input, scrollOffset: 0 });
  if (!geometry.scrollable) return 0;
  const target = clamp(
    input.thumbStart + (input.rtl ? -input.pointerDelta : input.pointerDelta),
    0,
    geometry.maxThumbOffset
  );
  return scrollForThumbOffset(target, geometry, input.rtl ?? false);
}

export type TrackPageInput = {
  /** Pointer displacement from the track's physical start (px). */
  trackPos: number;
  /** Live thumb placement on that track. */
  thumbOffset: number;
  thumbSize: number;
  scrollOffset: number;
  viewportSize: number;
  scrollSize: number;
};

/**
 * Track-press paging, Chrome/Windows-scrollbar semantics: jump one
 * viewport toward the press (past/before the thumb's center), clamped
 * to the scroll range.
 */
export function trackPageToScroll(input: TrackPageInput): number {
  const maxScroll = Math.max(0, input.scrollSize - input.viewportSize);
  if (maxScroll <= 0) return input.scrollOffset;
  const thumbCenter = input.thumbOffset + input.thumbSize / 2;
  const forward = input.trackPos > thumbCenter;
  return clamp(
    input.scrollOffset + (forward ? input.viewportSize : -input.viewportSize),
    0,
    maxScroll
  );
}

/** One axis of a scroll element in logical units (RTL horizontal normalized). */
export type ViewportAxis = {
  viewportSize: number;
  scrollSize: number;
  scrollOffset: number;
};

/**
 * Read one axis off a scroll element. Horizontal RTL `scrollLeft` reads
 * 0 at the inline start (physical right) and goes negative toward the
 * end — negate it into logical units.
 */
export function readViewportAxis(
  el: ScrollElementLike,
  orientation: Orientation,
  rtl: boolean
): ViewportAxis {
  if (orientation === 'vertical') {
    return {
      viewportSize: el.clientHeight,
      scrollSize: el.scrollHeight,
      scrollOffset: el.scrollTop,
    };
  }
  return {
    viewportSize: el.clientWidth,
    scrollSize: el.scrollWidth,
    scrollOffset: rtl ? -el.scrollLeft : el.scrollLeft,
  };
}

/** Write a logical scroll offset back to the element (RTL de-normalized). */
export function writeViewportAxis(
  el: { scrollTop: number; scrollLeft: number },
  orientation: Orientation,
  rtl: boolean,
  value: number
): void {
  if (orientation === 'vertical') {
    el.scrollTop = value;
  } else {
    el.scrollLeft = rtl ? -value : value;
  }
}
