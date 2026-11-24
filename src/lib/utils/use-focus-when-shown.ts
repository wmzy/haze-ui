import { useEffect } from 'react';

import { useLatest } from '../hooks/useLatest';

/**
 * Move focus into a floating panel once it is actually shown.
 *
 * A native popover is display:none until showPopover() runs, and a focus
 * call on a hidden element is silently dropped by real engines, so
 * "focus X when the panel opens" has to wait for the shown handover (see
 * FloatingBehavior.shown) instead of riding the open flip. Every floating
 * component used to carry its own copy of
 * `useEffect(() => { if (!shown) return; target.focus(); }, [shown])`;
 * this hook is that effect.
 *
 * Pass as `shown` the exact condition under which focus should land —
 * typically `open && floating.shown`, plus any "this panel has a focus
 * target at all" gate (a search input that only exists in one mode).
 * Focus is attempted each time that condition turns true, never on a mere
 * re-render: `getTarget` is read through a latest-ref, so an inline
 * closure per render is fine and re-triggers nothing.
 *
 * ```tsx
 * useFocusWhenShown(open && floating.shown, () => panelRef.current);
 * ```
 *
 * `getTarget` runs once per shown handover and returns the element to
 * focus, or null/undefined to leave focus alone. That also makes it the
 * place for a one-shot handoff: consume the request (clear the flag), then
 * return its target — an already-consumed request returns null.
 *
 * @param shown Whether the panel is open and actually visible.
 * @param getTarget Reads the element to focus; may return nothing to skip.
 */
export function useFocusWhenShown(
  shown: boolean,
  getTarget: () => HTMLElement | null | undefined
): void {
  const latestTarget = useLatest(getTarget);
  useEffect(() => {
    if (shown) latestTarget.current()?.focus();
  }, [shown, latestTarget]);
}
