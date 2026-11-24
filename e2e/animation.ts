import { expect, type Locator } from '@playwright/test';

/**
 * Waits until an overlay's enter animation has settled — no animation is
 * running and opacity is back at 1 — so pixel reads, axe scans,
 * screenshots and transform reads observe the stable state instead of a
 * mid-fade frame (axe's visibility math is nondeterministic on a
 * mid-fade element, and dragging/closing from a half-run enter races the
 * transform reads).
 *
 * Panels animate in via data-state over the motion tokens (opacity
 * fades). The attribute check runs first so the poll cannot pass in the
 * commit window before the enter animation has even been created; an
 * element without data-state is not animated itself and settles
 * immediately. Pass the element Presence tags with data-state — for an
 * overlay-driven panel (BottomSheet) that is the overlay wrapping it,
 * not the inner panel. The animation read includes the subtree, so
 * animated children are awaited too.
 */
export async function waitForOpenAnimationToSettle(
  panel: Locator
): Promise<void> {
  await expect
    .poll(() =>
      panel.evaluate((el) => {
        if (el.dataset.state === 'closed') return false;
        return (
          el.getAnimations({ subtree: true }).length === 0 &&
          getComputedStyle(el).opacity === '1'
        );
      })
    )
    .toBe(true);
}
