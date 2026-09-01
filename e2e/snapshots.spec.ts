import { expect, test } from '@playwright/test';

/**
 * Stable-state pixel baselines for the four floating components (panels in
 * their open state, dialog modal). Cross-platform tolerance is configured
 * once in playwright.config.ts (maxDiffPixelRatio 0.02 — same pinned
 * Chromium locally and in CI, but host font fallbacks and rasterization
 * differ slightly); see the comment there for the rationale.
 */

test.describe('visual baselines', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('popover panel', async ({ page }) => {
    const trigger = page.getByText('Open popover');
    await trigger.click();
    const panelId = await trigger.getAttribute('aria-controls');
    const panel = page.locator(`[id="${panelId}"]`);
    await expect(panel).toBeVisible();
    await expect(panel).toHaveScreenshot('popover-open.png');
  });

  test('dropdown menu panel', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveScreenshot('dropdown-menu-open.png');
  });

  test('dialog', async ({ page }) => {
    await page.locator('#dialog-opener').click();
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveScreenshot('dialog-open.png');
  });

  test('datepicker panel', async ({ page }) => {
    const input = page.locator('#datepicker-demo input');
    await input.click();
    // The calendar header (month title + nav buttons) lives outside the
    // role=grid element; screenshot the whole panel the input controls.
    const panelId = await input.getAttribute('aria-controls');
    const panel = page.locator(`[id="${panelId}"]`);
    await expect(panel).toBeVisible();
    await expect(panel).toHaveScreenshot('datepicker-open.png');
  });
});
