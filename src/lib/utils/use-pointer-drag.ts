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
export function usePointerDrag<T extends HTMLElement, R>(
  extract: (event: ReactPointerEvent<T>) => R | null,
  apply: (value: R) => void,
  commit: (value: R) => void
) {
  const pointerRef = useRef<number | null>(null);

  return {
    onPointerDown: (event: ReactPointerEvent<T>) => {
      if (event.button !== 0) return;
      const value = extract(event);
      if (value === null) return;
      event.preventDefault();
      pointerRef.current = event.pointerId;
      capturePointer(event.currentTarget, event.pointerId);
      apply(value);
    },
    onPointerMove: (event: ReactPointerEvent<T>) => {
      if (pointerRef.current !== event.pointerId) return;
      const value = extract(event);
      if (value !== null) apply(value);
    },
    onPointerUp: (event: ReactPointerEvent<T>) => {
      if (pointerRef.current !== event.pointerId) return;
      pointerRef.current = null;
      releasePointerCaptureSafe(event.currentTarget, event.pointerId);
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
