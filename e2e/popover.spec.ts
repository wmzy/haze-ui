import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Popover smoke in a real browser: the panel must run the native popover
 * path (top-layer `popover=auto`) with CSS anchor positioning under the
 * trigger, and honor light dismiss + Escape.
 */

async function openPopover(page: Page): Promise<{ trigger: Locator; panel: Locator }> {
  const trigger = page.getByText('Open popover');
  await trigger.click();
  const panelId = await trigger.getAttribute('aria-controls');
  const panel = page.locator(`[id="${panelId}"]`);
  await expect(panel).toBeVisible();
  await waitForOpenAnimationToSettle(panel);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  return { trigger, panel };
}

/**
 * Panels fade in over var(--haze-duration-fast) via data-state
 * animations. Geometry is stable (opacity-only keyframes on floating
 * panels), but pixel reads / scans must observe the settled state. The
 * attribute check runs first so the poll cannot pass in the commit
 * window before the enter animation has even been created; a panel
 * without data-state (not animated) settles immediately.
 */
async function waitForOpenAnimationToSettle(panel: Locator): Promise<void> {
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

test.describe('Popover', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens and closes through the trigger', async ({ page }) => {
    const trigger = page.getByText('Open popover');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const { trigger: t, panel } = await openPopover(page);

    // Native path: the panel is a real popover, shown in the top layer.
    await expect
      .poll(() => panel.evaluate((el) => el.matches(':popover-open')))
      .toBe(true);

    await t.click();
    await expect(t).toHaveAttribute('aria-expanded', 'false');
    // The panel stays visible through its ~120ms fade-out (data-state
    // closed) and only then hides — the auto-waiting matcher absorbs
    // that exit window.
    await expect(panel).toBeHidden();
  });

  test('renders above any z-index (top layer)', async ({ page }) => {
    const { panel } = await openPopover(page);
    // Cover the viewport with a max-z-index overlay: only top-layer
    // rendering can paint above it.
    const paintsAboveCover = await panel.evaluate((el) => {
      const cover = document.createElement('div');
      cover.style.cssText = 'position:fixed;inset:0;z-index:2147483647';
      document.body.appendChild(cover);
      const rect = el.getBoundingClientRect();
      const stack = document.elementsFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
      cover.remove();
      const above = stack.slice(0, stack.indexOf(cover));
      return above.some((node) => node === el || el.contains(node));
    });
    expect(paintsAboveCover).toBe(true);
  });

  test('anchors below the trigger (CSS anchor positioning)', async ({ page }) => {
    const { trigger, panel } = await openPopover(page);
    const triggerBox = await trigger.boundingBox();
    const panelBox = await panel.boundingBox();
    expect(triggerBox).not.toBeNull();
    expect(panelBox).not.toBeNull();
    // bottom-span placement: the panel starts at/below the trigger's
    // bottom edge and horizontally spans it.
    expect(panelBox!.y).toBeGreaterThanOrEqual(
      triggerBox!.y + triggerBox!.height
    );
    expect(panelBox!.x).toBeLessThan(triggerBox!.x + triggerBox!.width);
    expect(panelBox!.x + panelBox!.width).toBeGreaterThan(triggerBox!.x);
  });

  test('light-dismisses on outside pointerdown', async ({ page }) => {
    const { trigger, panel } = await openPopover(page);
    // Empty page area far from the trigger/panel pair.
    await page.mouse.click(8, 700);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
  });

  test('closes on Escape', async ({ page }) => {
    const { trigger, panel } = await openPopover(page);
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
  });

  test('is keyboard reachable: Tab focuses the trigger, Enter/Space toggle', async ({ page }) => {
    const trigger = page.getByText('Open popover');
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Space must toggle, not scroll the page
    await page.keyboard.press('Space');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
