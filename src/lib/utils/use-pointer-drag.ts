import type { PointerEvent as ReactPointerEvent } from 'react';

import { useRef } from 'react';

import { capturePointer, releasePointerCaptureSafe } from './pointer-capture';

/**
 * Pointer-drag wiring for one control surface: extracts a value from
 * each event, streams it through `apply` while the gesture runs and
 * commits on release. Pointer capture is guarded — jsdom and engines
 * without it still deliver moves bubbling through the element itself
 * (the Signature/BottomSheet precedent this hook was promoted from;
 * ColorPickerPanel held the original). A zero-size surface (extract
 * returns null) is a no-op.
 *
 * `onPointerUp`/`onPointerCancel` release the capture defensively: some
 * engines keep the implicit capture until the next tick, swallowing the
 * click a commit often wants to coexist with.
 *
 * The returned handlers are arrow-function properties, not method
 * shorthand: consumers detach them (`{...drag}` / `onPointerMove={drag.onPointerMove}`),
 * which the unbound-method lint correctly flags on real methods.
 */
export type PointerDragHandlers<T extends HTMLElement> = {
  onPointerDown: (event: ReactPointerEvent<T>) => void;
  onPointerMove: (event: ReactPointerEvent<T>) => void;
  onPointerUp: (event: ReactPointerEvent<T>) => void;
  onPointerCancel: (event: ReactPointerEvent<T>) => void;
};

/**
 * Slop-delayed takeover (the Carousel contract): the press stays a
 * plain click until the extracted value travels past `slop` from its
 * pointerdown value. Requires the value stream to be a linear pointer
 * position (number) — the threshold compares extracted values, so its
 * axis and scale follow the consumer's own extract.
 */
export type PointerDragSlopOptions<T extends HTMLElement> = {
  /**
   * Travel (extract-value units) the press must cross before the
   * gesture takes over. Below it: no preventDefault, no capture, no
   * apply — sub-threshold moves are ignored and up/cancel resolve with
   * zero side effects (a plain click). The first move past the
   * threshold takes over — capture armed, `onGestureStart` fired — and
   * applies from the press origin, so the follow math matches the eager
   * mode offset by the slop travel. Takeover is sticky: dipping back
   * inside the threshold never releases the gesture.
   */
  slop: number;
  /**
   * Takeover side effects the shared layer has no opinion about
   * (Carousel toggles user-select/scroll-behavior/scroll-snap inline
   * styles). Runs after capture is armed, before the triggering
   * move's `apply`.
   */
  onGestureStart?: (event: ReactPointerEvent<T>) => void;
};

export function usePointerDrag<T extends HTMLElement, R>(
  extract: (event: ReactPointerEvent<T>) => R | null,
  apply: (value: R) => void,
  commit: (value: R) => void
): PointerDragHandlers<T>;
export function usePointerDrag<T extends HTMLElement>(
  extract: (event: ReactPointerEvent<T>) => number | null,
  apply: (value: number) => void,
  commit: (value: number) => void,
  options: PointerDragSlopOptions<T>
): PointerDragHandlers<T>;
export function usePointerDrag<T extends HTMLElement, R>(
  extract: (event: ReactPointerEvent<T>) => R | null,
  apply: (value: R) => void,
  commit: (value: R) => void,
  options?: PointerDragSlopOptions<T>
): PointerDragHandlers<T> {
  const pointerRef = useRef<number | null>(null);
  // Slop-mode bookkeeping (null/false in eager mode, which applies
  // straight from pointerdown): the press's extracted value is the
  // threshold origin, takenOver marks the sticky handover.
  const pressValueRef = useRef<number | null>(null);
  const takenOverRef = useRef(false);
  const slop = options?.slop;
  const onGestureStart = options?.onGestureStart;

  return {
    onPointerDown: (event: ReactPointerEvent<T>) => {
      if (event.button !== 0) return;
      const value = extract(event);
      if (value === null) return;
      pointerRef.current = event.pointerId;
      if (slop === undefined) {
        event.preventDefault();
        capturePointer(event.currentTarget, event.pointerId);
        apply(value);
        return;
      }
      // Slop mode: the press is still a plain click — no
      // preventDefault, no capture, no apply until it crosses.
      pressValueRef.current = Number(value);
      takenOverRef.current = false;
    },
    onPointerMove: (event: ReactPointerEvent<T>) => {
      if (pointerRef.current !== event.pointerId) return;
      const value = extract(event);
      if (value === null) return;
      if (slop !== undefined && !takenOverRef.current) {
        // Number stream per the slop overload's contract.
        if (Math.abs(Number(value) - (pressValueRef.current ?? 0)) < slop)
          return;
        takenOverRef.current = true;
        capturePointer(event.currentTarget, event.pointerId);
        onGestureStart?.(event);
      }
      apply(value);
    },
    onPointerUp: (event: ReactPointerEvent<T>) => {
      if (pointerRef.current !== event.pointerId) return;
      pointerRef.current = null;
      releasePointerCaptureSafe(event.currentTarget, event.pointerId);
      // Slop mode: a press that never took over resolves as a plain
      // click — no commit.
      if (slop !== undefined && !takenOverRef.current) return;
      const value = extract(event);
      if (value !== null) commit(value);
    },
    onPointerCancel: (event: ReactPointerEvent<T>) => {
      if (pointerRef.current !== event.pointerId) return;
      // Aborted gesture: stop tracking without recording a commit.
      pointerRef.current = null;
      releasePointerCaptureSafe(event.currentTarget, event.pointerId);
    },
  };
}
