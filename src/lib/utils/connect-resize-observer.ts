import type { RefObject } from 'react';

type ConnectResizeObserverOptions = {
  /** The calling hook's observer slot — disconnected and cleared first,
   * then repopulated with the fresh observer. */
  observerRef: RefObject<ResizeObserver | null>;
  /** The newly attached node, or `null` when React detaches the ref. */
  node: Element | null;
  /** Passed to `observe()` verbatim — a changed box is one of the two
   * inputs (with `enabled`) that re-runs this connect. */
  box: ResizeObserverBoxOptions;
  /** When `false` the previous observer is dropped and nothing replaces
   * it (the ref-identity change is the whole notification). */
  enabled: boolean;
  /** Receives the first entry of each notification — both consumers
   * observe a single element, so the array tail is noise. */
  onEntry: (entry: ResizeObserverEntry) => void;
};

/**
 * The ResizeObserver lifecycle useResizeObserver and useElementSize
 * share: disconnect the previous observer, bail when there is nothing to
 * watch (null node, disabled, engine without ResizeObserver), otherwise
 * observe the node and store the observer for the next disconnect.
 * Disconnect beats an empty-observe + reobserve dance — it releases
 * every listen surface with no race window.
 *
 * Detach semantics stay with the caller, keyed off the return value:
 * useResizeObserver freezes its last entry, useElementSize zeroes its
 * size.
 *
 * @returns `true` when an observer is now watching `node`.
 */
export function connectResizeObserver({
  observerRef,
  node,
  box,
  enabled,
  onEntry,
}: ConnectResizeObserverOptions): boolean {
  observerRef.current?.disconnect();
  observerRef.current = null;

  if (!node || !enabled || typeof globalThis.ResizeObserver !== 'function') {
    return false;
  }

  const observer = new globalThis.ResizeObserver((entries) => {
    const first = entries[0];
    if (first) onEntry(first);
  });
  observer.observe(node, { box });
  observerRef.current = observer;
  return true;
}
