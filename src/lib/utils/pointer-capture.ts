/**
 * Safe pointer-capture guards — the union of every hand-rolled variant
 * this tree used to carry (typeof-guard + try/catch, bare try/catch,
 * hasPointerCapture pre-check). The most defensive shape wins:
 *
 *   - engines without the API (jsdom) silently no-op, matching the
 *     "moves still bubble through the element" contract the drag
 *     surfaces rely on in tests;
 *   - a capture that raced the pointer's release throws
 *     InvalidPointerId in some engines — swallowed, the gesture keeps
 *     tracking through its own pointerId gate;
 *   - releasing an already-lost capture is likewise a no-op.
 *
 * Pure DOM helpers, no hooks or React imports (RSC-safe by inspection;
 * not on the rsc-safe.mjs list because no RSC-listed module imports it).
 */

/** Capture `pointerId` on `el` if the engine supports it. */
export function capturePointer(el: Element, pointerId: number): void {
  if (typeof el.setPointerCapture !== 'function') return;
  try {
    el.setPointerCapture(pointerId);
  } catch {
    // pointer already released — the gesture still tracks
  }
}

/** Release `pointerId` from `el`; a lost capture is not an error. */
export function releasePointerCaptureSafe(el: Element, pointerId: number): void {
  if (typeof el.releasePointerCapture !== 'function') return;
  if (typeof el.hasPointerCapture === 'function' && !el.hasPointerCapture(pointerId)) return;
  try {
    el.releasePointerCapture(pointerId);
  } catch {
    // capture already gone
  }
}
