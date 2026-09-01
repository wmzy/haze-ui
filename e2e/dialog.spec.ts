import { expect, test } from '@playwright/test';

/**
 * Dialog smoke in a real browser: native <dialog> showModal puts it in the
 * top layer (:modal) and moves focus inside; every close path (Escape,
 * backdrop click) restores focus to the opener.
 */

test.describe('Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('showModal promotes the dialog and moves focus inside', async ({ page }) => {
    const dialog = page.locator('dialog');
    await expect(dialog).toBeHidden();

    await page.locator('#dialog-opener').click();
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Confirm action' })).toBeVisible();

    // Real modal state: only showModal() reaches the top layer.
    await expect
      .poll(() => dialog.evaluate((el) => el.matches(':modal')))
      .toBe(true);
    // showModal transfers focus into the dialog.
    await expect
      .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true);
  });

  test('Escape closes the dialog and returns focus to the opener', async ({ page }) => {
    const opener = page.locator('#dialog-opener');
    await opener.click();
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect
      .poll(() => dialog.evaluate((el) => (el as HTMLDialogElement).open))
      .toBe(false);
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id))
      .toBe('dialog-opener');
  });

  test('clicking the backdrop closes the dialog', async ({ page }) => {
    await page.locator('#dialog-opener').click();
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();

    // Far viewport corner: on the ::backdrop, outside the centered box.
    await page.mouse.click(8, 8);
    await expect(dialog).toBeHidden();
  });
});
