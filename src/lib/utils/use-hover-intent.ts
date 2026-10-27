import {useCallback, useEffect, useMemo, useRef} from 'react';

/**
 * Shared hover-intent timer protocol for the floating surfaces that
 * open after a pointer dwell and close after a grace period:
 * `useSubmenu` (Menu/DropdownMenu submenus), NavigationMenu panels,
 * HoverCard and Tooltip. One hook owns the two timers so every call
 * site shares the same choreography:
 *
 *   - `scheduleOpen(target)` cancels both timers first (re-entering an
 *     open surface must not leave a pending close armed), then arms the
 *     open dwell — skipped when `isOpen` reports the surface already
 *     open. The arm-time `target` is what `onOpen` receives when the
 *     dwell elapses (NavigationMenu commits the value that was hovered,
 *     not the value at fire time).
 *   - `scheduleClose()` cancels both timers (leaving before the dwell
 *     never opens), then arms the close grace — skipped when `isOpen`
 *     reports the surface already closed. A `closeDelay` of `0` means
 *     no grace at all: `onClose` fires synchronously inside the call
 *     (Tooltip hides on the mouseleave itself).
 *   - `cancel()` drops both pending timers without firing anything —
 *     the "resting zone" entry (pointer reached the panel) and every
 *     non-hover state change (click toggles, Escape).
 *
 * Options and callbacks are read at event time via latest-refs, so the
 * returned record keeps a stable identity across renders (safe in
 * context/memo dependency lists); pending timers are cleared on
 * unmount and never fire into a gone component.
 */

/** Tuning of one hover-intent surface — see {@link useHoverIntent}. */
type UseHoverIntentOptions<T> = {
  /** Pointer dwell (ms) before `onOpen` fires. `0` still defers to a `0`-ms timeout. */
  openDelay: number;
  /**
   * Grace (ms) before `onClose` fires after leaving. `0` closes
   * synchronously inside `scheduleClose` — no timeout, no grace.
   */
  closeDelay: number;
  /**
   * Present-ness guard read at arm time: `scheduleOpen` arms nothing
   * while it reports open (a dwell restart on an open surface is
   * meaningless), `scheduleClose` arms nothing while it reports closed.
   * Surfaces whose setters are idempotent by construction (Tooltip)
   * may omit it and keep their unguarded re-arm semantics.
   */
  isOpen?: () => boolean;
  /** Fires when the open dwell elapses; receives the arm-time target. */
  onOpen: (target: T) => void;
  /** Fires when the close grace elapses (or immediately at `closeDelay` 0). */
  onClose: () => void;
};

/** Intent handlers returned by {@link useHoverIntent}. */
type HoverIntent<T> = {
  /** Cancel both timers, then arm the open dwell for `target`. */
  scheduleOpen: (target: T) => void;
  /** Cancel both timers, then arm the close grace (or close now at `closeDelay` 0). */
  scheduleClose: () => void;
  /** Drop both pending timers without firing anything. */
  cancel: () => void;
};

export function useHoverIntent<T = void>({
  openDelay,
  closeDelay,
  isOpen,
  onOpen,
  onClose,
}: UseHoverIntentOptions<T>): HoverIntent<T> {
  const optionsRef = useRef<UseHoverIntentOptions<T>>({openDelay, closeDelay, isOpen, onOpen, onClose});
  // Refresh after every commit (concurrent renders that get discarded
  // never pollute the ref); handlers read it at event time.
  useEffect(() => {
    optionsRef.current = {openDelay, closeDelay, isOpen, onOpen, onClose};
  });

  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const scheduleOpen = useCallback(
    (target: T) => {
      clearTimers();
      const {openDelay: dwell, isOpen: open, onOpen: openNow} = optionsRef.current;
      if (open?.()) return;
      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null;
        openNow(target);
      }, dwell);
    },
    [clearTimers]
  );

  const scheduleClose = useCallback(() => {
    clearTimers();
    const {closeDelay: grace, isOpen: open, onClose: closeNow} = optionsRef.current;
    if (open && !open()) return;
    if (grace <= 0) {
      closeNow();
      return;
    }
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      closeNow();
    }, grace);
  }, [clearTimers]);

  const intent = useMemo<{scheduleOpen: (target: T) => void; scheduleClose: () => void; cancel: () => void}>(
    () => ({scheduleOpen, scheduleClose, cancel: clearTimers}),
    [scheduleOpen, scheduleClose, clearTimers]
  );
  return intent;
}

export type {UseHoverIntentOptions, HoverIntent};
