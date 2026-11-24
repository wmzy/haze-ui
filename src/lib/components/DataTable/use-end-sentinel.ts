import { useEffect, useRef } from 'react';

/**
 * ── Infinite scroll (non-virtualized) ───────────────────────────────
 * A sentinel after the body, watched through an IntersectionObserver.
 * Rooted at the component's own vertical scroller when it has one
 * (sticky mode), else at the viewport — which still honors consumer
 * scroll containers, since intersection is computed through every
 * scrollable clipper above the sentinel. The rootMargin pre-arms the
 * trigger by the threshold, matching VirtualList's end-reached
 * semantics; re-observing after content growth re-delivers the initial
 * notification, which is what chains short pages into the next load.
 *
 * Not utils/use-end-reached's `useEndReached` (the scroll-offset trigger
 * VirtualList / LogViewer / ConversationList use): that one measures a
 * known scrollport, while the non-sticky table ends at the viewport —
 * possibly the consumer's own scroll container — which only an
 * intersection observer sees through. Hence the distinct name.
 */
export function useEndSentinel({
  virtual,
  onEndReached,
  endReachedThreshold,
  stickyHeader,
  loading,
  rowCount,
}: {
  /** Virtualized mode rides VirtualList's own end-reached channel, so the
   *  sentinel watcher stays off there. */
  virtual: boolean;
  onEndReached: (() => void) | undefined;
  /** Distance in px from the end of the content that arms the trigger
   *  (`200` when not given). */
  endReachedThreshold: number | undefined;
  stickyHeader: boolean;
  loading: boolean;
  /** Rendered data rows — nothing to reach without any. */
  rowCount: number;
}) {
  const endSentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (virtual || onEndReached === undefined) return;
    const sentinel = endSentinelRef.current;
    if (!sentinel) return;
    const root = stickyHeader
      ? sentinel.closest<HTMLElement>('[data-slot="scroll-area"]')
      : null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onEndReached();
      },
      { root, rootMargin: `${endReachedThreshold ?? 200}px 0px` }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [virtual, onEndReached, endReachedThreshold, stickyHeader, loading, rowCount]);

  return endSentinelRef;
}
