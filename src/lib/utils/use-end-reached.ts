import type { RefObject } from 'react';

import { useCallback, useEffect, useRef } from 'react';

import { getDirection } from './direction';

type UseEndReachedOptions = {
  /** Scrollport element whose end is watched. */
  ref: RefObject<HTMLElement | null>;
  /**
   * Fired when the scroll offset comes within `threshold` px of the
   * content's end along the scroll axis — the infinite-scroll "load the
   * next page" trigger. Semantics: entering the zone fires once; staying
   * inside it does not re-fire; scrolling back out re-arms, and content
   * growth (`contentUnits` increasing) re-arms too, so a list that is
   * still short after a page load chains straight into the next one.
   * Content that does not fill the port on initial mount counts as being
   * in the zone and fires once.
   */
  onEndReached?: () => void;
  /** Distance in px from the content end that arms the trigger. */
  threshold: number;
  /**
   * Count of content units (items, entries, children). Only growth
   * matters: an increase re-arms the trigger and re-checks immediately.
   */
  contentUnits: number;
  /** Scroll axis; `'y'` (default) or `'x'`. */
  axis?: 'x' | 'y';
  /**
   * Mirror the end edge onto the scroll start (VirtualList `reverse`
   * mode): content anchors to the end edge, so the logical end of the
   * list sits at the physical start of the scroll range and the
   * remaining distance is the offset itself. The mount check is skipped
   * in this mode — the consumer anchors the start position first
   * (VirtualList's stick-to-end glue) and then calls `check()`.
   */
  fromStart?: boolean;
  /**
   * Viewport-extent fallback for environments where clientHeight /
   * clientWidth read 0 (no layout engine, e.g. jsdom): the consumer's
   * declared port size.
   */
  extentFallback?: number;
  /**
   * Attach the hook's own passive scroll listener (default). VirtualList
   * passes `false` and calls the returned `check()` from its existing
   * scroll handler instead.
   */
  attach?: boolean;
};

/**
 * End-reached pagination trigger for a scrollport. Shared by VirtualList
 * (`onEndReached`) and the plain scroll containers that forward the same
 * semantics (LogViewer / ConversationList `onLoadMore`); returns `check()`
 * for consumers that drive it from their own scroll handler. Zero
 * overhead when `onEndReached` is not provided: no listener, no
 * per-scroll work.
 */
export function useEndReached({
  ref,
  onEndReached,
  threshold,
  contentUnits,
  axis = 'y',
  fromStart = false,
  extentFallback,
  attach = true,
}: UseEndReachedOptions): () => void {
  // Latest callback without re-attaching listeners on every render.
  const onEndReachedRef = useRef(onEndReached);
  useEffect(() => {
    onEndReachedRef.current = onEndReached;
  });

  const enabled = onEndReached !== undefined;
  /** Whether the trigger may fire; consumed by the first in-zone check. */
  const armedRef = useRef(true);
  const prevUnitsRef = useRef<number | null>(null);

  const check = useCallback(() => {
    const cb = onEndReachedRef.current;
    if (!cb) return;
    const el = ref.current;
    if (!el) return;
    // Logical offset along the axis (horizontal RTL reads scrollLeft
    // negated — the same normalization as VirtualList's offset scale).
    const raw = axis === 'y' ? el.scrollTop : el.scrollLeft;
    const offset = axis === 'x' && getDirection(el) === 'rtl' ? -raw : raw;
    const total = axis === 'y' ? el.scrollHeight : el.scrollWidth;
    const extent =
      (axis === 'y' ? el.clientHeight : el.clientWidth) || extentFallback || 0;
    // In mirrored (reverse) space the content's logical end sits at the
    // scroll start: the distance to it is the offset itself.
    const remaining = fromStart ? offset : total - extent - offset;
    if (remaining <= threshold) {
      if (armedRef.current) {
        armedRef.current = false;
        cb();
      }
    } else {
      armedRef.current = true;
    }
  }, [ref, axis, fromStart, extentFallback, threshold]);

  // Mount check (short content fires immediately) + growth re-arm.
  const prevEnabledRef = useRef(false);
  useEffect(() => {
    const prev = prevUnitsRef.current;
    const wasEnabled = prevEnabledRef.current;
    prevUnitsRef.current = contentUnits;
    prevEnabledRef.current = enabled;
    if (!enabled) return;
    // An enable flip is a fresh mount for the trigger: a handler wired
    // after mount (`onLoadMore={hasMore ? load : undefined}`) must still
    // get the initial at-end check, or short content stays silent until
    // the user scrolls.
    if (wasEnabled && prev !== null && contentUnits <= prev) return;
    // fromStart: the initial position is provisional until the consumer
    // anchors it — skip the first armed check (growth checks still run).
    if (fromStart && (prev === null || !wasEnabled)) return;
    armedRef.current = true;
    check();
  }, [contentUnits, check, enabled, fromStart]);

  useEffect(() => {
    if (!attach || !enabled) return;
    const el = ref.current;
    if (!el) return;
    const listener = () => check();
    el.addEventListener('scroll', listener, { passive: true });
    return () => el.removeEventListener('scroll', listener);
  }, [attach, enabled, check, ref]);

  return check;
}
