/**
 * Shared wiring for "re-run placement while the viewport moves":
 * window scroll (capture — scroll does not bubble, but it captures
 * down to window) plus resize, returned as one removable bundle.
 *
 * Two consumers with deliberately different timing:
 * - utils/floating.tsx stays SYNCHRONOUS (the default): collision tests
 *   and e2e rely on the panel re-nudging within the same task, and a
 *   rAF hop would let a frame paint the un-nudged position.
 * - components/Tour/Tour passes `{ throttle: true }` — a scroll storm
 *   must cost at most one placement per frame.
 *
 * Pure TS, no CSS — should this module ever grow a class, register it
 * in scripts/split-css.mjs sharedLayers and scripts/rsc-safe.mjs.
 */
type ViewportPlacementOptions = {
  /**
   * Coalesce event bursts into one `place` per animation frame; the
   * teardown cancels a pending frame. Default false: synchronous.
   */
  throttle?: boolean;
};

/**
 * Listens for viewport movement and calls `place`. Returns a teardown
 * that removes both listeners (and cancels a throttled pending frame).
 */
export function addViewportPlacementListener(
  place: () => void,
  options?: ViewportPlacementOptions
): () => void {
  let raf = 0;
  const onViewportChange = () => {
    if (!options?.throttle) {
      place();
      return;
    }
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      place();
    });
  };
  window.addEventListener('scroll', onViewportChange, true);
  window.addEventListener('resize', onViewportChange);
  return () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onViewportChange, true);
    window.removeEventListener('resize', onViewportChange);
  };
}
