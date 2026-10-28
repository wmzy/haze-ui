import { useCallback, useEffect, useRef } from 'react';

/**
 * A setTimeout that survives being paused: the elapsed slice is banked
 * on pause and the resume re-arms with whatever budget is left (not the
 * full delay again). Shared by Toast's auto-close countdown and
 * Carousel's autoplay engine — both freeze the budget on hover/focus
 * per WCAG 2.2.1 and resume where they stopped.
 *
 * The two historical implementations differed in three knobs, all
 * parameterized here:
 * - `recurring`: Carousel re-arms the full budget after every fire
 *   (autoplay cadence); Toast fires once and is done.
 * - `minRemaining`: Carousel banks at a 1ms floor so a budget consumed
 *   to the edge never turns resume into a permanent stall; Toast banks
 *   at 0 (a consumed countdown is simply over).
 * - `resetKey`: a value whose change restarts the budget from the full
 *   delay (Carousel's slide count; Toast needs none — `delay` covers
 *   its `duration` update path).
 */

type PausableTimeoutOptions = {
  /** Full budget per cycle, in ms. A change restarts from the full
   * budget (unless paused — then the fresh budget waits for resume). */
  delay: number;
  /** Fires when the budget runs out. Identity changes never re-arm a
   * running budget — the latest closure is read at fire time. */
  onFire: () => void;
  /** No timer runs while false; pause/resume become no-ops. Enabling
   * arms the fresh budget (unless paused). Default true. */
  enabled?: boolean;
  /** Re-arm the full budget after every fire instead of stopping.
   * Default false (fire once). */
  recurring?: boolean;
  /** Floor for the banked remainder, in ms. Default 0. */
  minRemaining?: number;
  /** Change this value to restart the budget from the full delay. */
  resetKey?: unknown;
};

type PausableTimeout = {
  /** Stop the clock and bank the elapsed slice. Idempotent. */
  pause: () => void;
  /** Re-arm with the remaining budget. No-op while paused twice,
   * disabled, or (non-recurring) after the budget already fired. */
  resume: () => void;
};

export function usePausableTimeout({
  delay,
  onFire,
  enabled = true,
  recurring = false,
  minRemaining = 0,
  resetKey,
}: PausableTimeoutOptions): PausableTimeout {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);
  const remainingRef = useRef(delay);
  const pausedRef = useRef(false);
  // Latest config read at fire/pause time so identity changes never
  // re-arm a running budget (Toast's onClose-identity contract).
  const onFireRef = useRef(onFire);
  const enabledRef = useRef(enabled);
  const recurringRef = useRef(recurring);
  const delayRef = useRef(delay);
  const minRemainingRef = useRef(minRemaining);

  // Synced before the arming effect below (same-commit ordering), so a
  // config change that also restarts the budget always fires the
  // latest closure.
  useEffect(() => {
    onFireRef.current = onFire;
    enabledRef.current = enabled;
    recurringRef.current = recurring;
    delayRef.current = delay;
    minRemainingRef.current = minRemaining;
  }, [onFire, enabled, recurring, delay, minRemaining]);

  const stopAndBank = useCallback(() => {
    if (timerRef.current === null) return; // not running: idempotent
    clearTimeout(timerRef.current);
    timerRef.current = null;
    // Bank the elapsed slice so resuming uses the remaining budget, not
    // the full delay again.
    remainingRef.current = Math.max(
      minRemainingRef.current,
      remainingRef.current - (Date.now() - startedAtRef.current)
    );
  }, []);

  // Late-bound so the recurring re-arm below can hand control back to
  // resume() without a use-before-declare cycle (arm → resume → arm).
  const resumeRef = useRef<() => void>(() => undefined);

  const arm = useCallback((): void => {
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onFireRef.current();
      if (!recurringRef.current) return;
      // Next cycle gets the full budget again; only re-arm while
      // unpaused — a paused engine re-arms on the next resume().
      remainingRef.current = delayRef.current;
      if (enabledRef.current && !pausedRef.current) resumeRef.current();
    }, remainingRef.current);
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    stopAndBank();
  }, [stopAndBank]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    if (!enabledRef.current) return;
    if (timerRef.current !== null || remainingRef.current <= 0) return;
    arm();
  }, [arm]);

  useEffect(() => {
    resumeRef.current = resume;
  }, [resume]);

  useEffect(() => {
    if (!enabled) return;
    remainingRef.current = delay;
    if (!pausedRef.current) resume();
    // Cleanup banks the elapsed slice so the budget stays accurate
    // across config changes and unmount (without flipping the paused
    // intent — a re-enable while hovered must stay parked).
    return stopAndBank;
  }, [enabled, delay, resetKey, resume, stopAndBank]);

  return { pause, resume };
}

export type { PausableTimeout, PausableTimeoutOptions };
