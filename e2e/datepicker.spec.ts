import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Datepicker smoke in a real browser: the calendar panel is a top-layer
 * popover anchored below the (readOnly) input; picking a day commits the
 * value and closes, Escape dismisses. The harness pins the initial value
 * to 2026-09-01 so the panel is always September 2026.
 */

function locators(page: Page): { input: Locator; panel: Locator } {
  const input = page.locator('#datepicker-demo input');
  const panel = page.getByRole('grid', { name: /September 2026/ });
  return { input, panel };
}

test.describe('Datepicker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens the calendar panel anchored below the input', async ({ page }) => {
    const { input, panel } = locators(page);
    await expect(input).toHaveValue('2026-09-01');
    await input.click();

    await expect(panel).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    // The popover element is the FloatingPanel wrapper, not the grid
    // itself — :popover-open only matches the element bearing popover="".
    const popoverEl = page.locator('#datepicker-demo [popover]');
    await expect
      .poll(() => popoverEl.evaluate((el) => el.matches(':popover-open')))
      .toBe(true);

    const inputBox = await input.boundingBox();
    const panelBox = await panel.boundingBox();
    expect(inputBox).not.toBeNull();
    expect(panelBox).not.toBeNull();
    expect(panelBox!.y).toBeGreaterThanOrEqual(
      inputBox!.y + inputBox!.height
    );
  });

  test('picking a day commits the value and closes the panel', async ({ page }) => {
    const { input, panel } = locators(page);
    await input.click();
    await expect(panel).toBeVisible();

    await page.getByRole('button', { name: '15', exact: true }).click();
    await expect(input).toHaveValue('2026-09-15');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    // Controlled value flows back out to the harness app.
    await expect(page.locator('#datepicker-value')).toHaveText('2026-09-15');
  });

  test('Escape closes the open panel', async ({ page }) => {
    const { input, panel } = locators(page);
    await input.click();
    await expect(panel).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});
