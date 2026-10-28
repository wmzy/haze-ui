import { useCallback, useEffect, useRef, useState } from 'react';

/** Controller surface of `usePendingFocus`. */
export type PendingFocusController<T> = {
  /** Queue a request. The request's own commit starts the retry loop,
   *  which re-attempts after every commit until `attempt` applies it.
   *  A later request replaces an earlier queued one (last wins). */
  request: (pending: T) => void;
  /** Try a request once, right now, without queueing it: `true` when it
   *  applied. The eager half of consumers that act synchronously when the
   *  target is already mounted and only defer when it is not. */
  attemptNow: (pending: T) => boolean;
  /** Drop the queued request without applying it. */
  clear: () => void;
};

/**
 * The pending-focus-after-scroll retry loop shared by components whose
 * focus (or scroll) target may not exist yet when it is requested: a
 * virtualized window must `scrollToIndex` the target's row in first (the
 * row mounts a commit later), and a collapsed subtree only reveals its
 * rows after an expansion commit lands. A request that cannot resolve
 * stays queued and is re-attempted after every commit — the row-model
 * change that mounts the target is always a commit — until it applies
 * exactly once and clears.
 *
 * `attempt` resolves the pending value against the current world and
 * reports the outcome: `true` means "applied — clear the request",
 * `false` means "target not there (yet) — keep it queued". It runs with
 * a fresh closure on every commit (the retry effect deliberately has no
 * dependency list) and must leave the world untouched on the `false`
 * path. Keeping each consumer's selector and scroll mechanics inside
 * `attempt` is what makes the loop generic: Tree keys rows by
 * `data-tree-key`, DataTable cells by `data-nav-row`/`data-nav-col`, and
 * either may `scrollToIndex` first — the loop only owns the
 * queue/retry/clear bookkeeping around it.
 */
export function usePendingFocus<T>(
  attempt: (pending: T) => boolean
): PendingFocusController<T> {
  const pendingRef = useRef<T | null>(null);
  // Every request forces a commit of its own so the retry effect runs
  // even when nothing else in the consumer changed (the state-driven
  // loops this hook replaced got that re-render for free).
  const [, requestCommit] = useState(0);

  // Retry loop: runs after every commit — the request's own commit and
  // every later commit that may have mounted the target.
  useEffect(() => {
    const pending = pendingRef.current;
    if (pending === null) return;
    if (attempt(pending)) pendingRef.current = null;
  });

  const request = useCallback((pending: T) => {
    pendingRef.current = pending;
    requestCommit((commit) => commit + 1);
  }, []);

  const clear = useCallback(() => {
    pendingRef.current = null;
  }, []);

  const attemptNow = useCallback(
    (pending: T) => attempt(pending),
    [attempt]
  );

  return { request, attemptNow, clear };
}
