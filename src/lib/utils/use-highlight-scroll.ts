import type { RefObject } from 'react';

import type { VirtualListHandle } from '../components/VirtualList';

import { useEffect } from 'react';

type UseHighlightScrollOptions = {
  /**
   * Whether the popover is physically on screen — gates the effect so it
   * never scrolls a still-hidden panel.
   */
  shown: boolean;
  /** Flat index of the highlighted row; negative disables the effect. */
  highlightIndex: number;
  /** Virtualized mode drives the window through `scrollToIndex`. */
  virtualized: boolean;
  /** VirtualList handle of the virtualized path. */
  listRef: RefObject<VirtualListHandle | null>;
  /** Plain-path handle: ref on the currently highlighted row element. */
  rowRef: RefObject<HTMLDivElement | null>;
};

/**
 * Keep the highlighted row visible whenever it moves (keyboard
 * navigation) and whenever the panel (re)opens with a live highlight —
 * 'auto' alignment is a no-op for rows already on screen. Gated on
 * `shown`, not `open`: this child effect runs before the behavior
 * effect calls showPopover(), and scrollTop set on a still-hidden
 * popover is clamped away and lost. Virtualized mode drives the
 * window through scrollToIndex (rows outside the window are not
 * mounted, so scrollIntoView has no target); jsdom ships no
 * scrollIntoView, hence the typeof guard on the plain path.
 */
export function useHighlightScroll({
  shown,
  highlightIndex,
  virtualized,
  listRef,
  rowRef,
}: UseHighlightScrollOptions): void {
  useEffect(() => {
    if (!shown || highlightIndex < 0) return;
    if (virtualized) {
      listRef.current?.scrollToIndex(highlightIndex, 'auto');
      return;
    }
    const row = rowRef.current;
    if (row && typeof row.scrollIntoView === 'function') {
      row.scrollIntoView({ block: 'nearest' });
    }
  }, [virtualized, shown, highlightIndex, listRef, rowRef]);
}
