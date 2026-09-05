import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Floating collision behavior across engines. Each engine takes
 * whichever tier it supports (all three currently resolve the anchored
 * tier: Chromium/Firefox 141+/WebKit 2.53 ship CSS anchor positioning;
 * engines without it fall to the JS-positioned popover tier's
 * computeFloatingPosition flip/shift). The config pins firefox and
 * webkit to this spec; chromium runs it alongside the rest. Every
 * assertion is tier-agnostic: an open panel's bounding box must sit
 * fully inside the (optionally padded) viewport, and must stay inside
 * after scroll and resize re-placement.
 *
 * Close-path assertions elsewhere wait out the ~120-200ms exit
 * animation window; here the panels stay open the whole time and the
 * enter fade is opacity-only, so bounding boxes are stable — the
 * expect.poll in expectInsideViewport additionally absorbs the one or
 * two frames the position effect needs after the panel is shown.
 */

/** Layout is fractional; allow subpixel slack on edge comparisons. */
const EPSILON = 0.5;

/** The panel a popover-style trigger controls, via aria-controls. */
async function panelOf(trigger: Locator): Promise<Locator> {
  const id = await trigger.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  return trigger.page().locator(`[id="${id}"]`);
}

/**
 * Smallest clearance between the panel box and the padded viewport, in
 * px — negative when the panel sticks out over an edge. null while the
 * panel has no laid-out box yet, so expect.poll keeps waiting.
 */
async function clearance(
  page: Page,
  panel: Locator,
  pad: number
): Promise<number | null> {
  const box = await panel.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) return null;
  return Math.min(
    box.x - pad,
    box.y - pad,
    viewport.width - pad - (box.x + box.width),
    viewport.height - pad - (box.y + box.height)
  );
}

/** Polls until the panel is fully inside the padded viewport. */
async function expectInsideViewport(
  page: Page,
  panel: Locator,
  pad = 0
): Promise<void> {
  await expect
    .poll(() => clearance(page, panel, pad))
    .toBeGreaterThanOrEqual(-EPSILON);
}

test.describe('floating collision', () => {
  test.beforeEach(async ({ page }) => {
    // Fixed, small enough that every fixture's panel genuinely collides
    // with an edge; overrides the per-engine device defaults so all
    // three engines solve the exact same geometry.
    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto('/collision.html');
  });

  test('top-right popover shifts fully inside the viewport', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', {name: 'Corner popover'});
    await trigger.click();
    const panel = await panelOf(trigger);
    await expect(panel).toBeVisible();
    // The trigger hugs the right edge; the bottom-span panel would
    // overflow it. Whatever tier places it, it must end up inside.
    await expectInsideViewport(page, panel);
  });

  test('collisionPadding keeps the panel 16px inside every edge', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', {name: 'Padded popover'});
    await trigger.click();
    const panel = await panelOf(trigger);
    await expect(panel).toBeVisible();
    // The trigger sits 4px from the top-left corner: the natural panel
    // position breaks the 16px padding on the left edge.
    await expectInsideViewport(page, panel, 16);
  });

  test('bottom dropdown menu flips above its trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Bottom menu' });
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expectInsideViewport(page, menu);

    const triggerBox = await trigger.boundingBox();
    const menuBox = await menu.boundingBox();
    expect(triggerBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    // No room below the bottom-edge trigger: the menu must sit above it.
    expect(menuBox!.y + menuBox!.height).toBeLessThanOrEqual(
      triggerBox!.y + EPSILON
    );
  });

  test('left-edge tooltip stays inside the viewport', async ({ page }) => {
    const trigger = page.getByText('Left-edge tooltip', {exact: true});
    await trigger.hover();
    const tip = page.getByRole('tooltip');
    // 150ms hover delay before the tooltip appears.
    await expect(tip).toBeVisible();
    await expectInsideViewport(page, tip);
    // Not asserting the flip direction: position="left" at the very edge
    // gives a degenerate position-area cell on the anchored tier (the
    // cell is only as wide as the trigger's left offset), where Chromium
    // clamps the bubble into view instead of running flip-inline — a
    // documented tier-1 limitation. The JS-positioned tiers flip it to
    // the trigger's right side; containment is the shared contract.
  });

  test('narrow viewport still shifts the popover inside', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 420, height: 560 });
    const trigger = page.getByRole('button', {name: 'Corner popover'});
    await trigger.click();
    const panel = await panelOf(trigger);
    await expect(panel).toBeVisible();
    // Barely wider than the panel: the clamp must pin it inside anyway.
    await expectInsideViewport(page, panel);
  });

  test('flipped menu tracks its trigger after scroll', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Bottom menu' });
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expectInsideViewport(page, menu);

    // The stage is 160vh tall: scrolling is real and moves the trigger.
    await page.evaluate(() => window.scrollBy(0, 150));
    await expectInsideViewport(page, menu);

    const triggerBox = await trigger.boundingBox();
    const menuBox = await menu.boundingBox();
    expect(triggerBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    // Still glued above the trigger (gap --haze-space-1 = 4px).
    expect(Math.abs(triggerBox!.y - (menuBox!.y + menuBox!.height)))
      .toBeLessThanOrEqual(12);
  });

  test('corner popover re-places after viewport resize', async ({ page }) => {
    const trigger = page.getByRole('button', {name: 'Corner popover'});
    await trigger.click();
    const panel = await panelOf(trigger);
    await expect(panel).toBeVisible();
    await expectInsideViewport(page, panel);

    // Shrinking the viewport re-runs placement (tier-1 nudge listener /
    // tier-2 resize listener); the panel must stay inside the new box.
    await page.setViewportSize({ width: 560, height: 480 });
    await expectInsideViewport(page, panel);
  });
});
