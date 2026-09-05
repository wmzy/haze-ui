import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * DropdownMenu smoke in a real browser: full menu-button keyboard pattern
 * (open on ArrowDown/ArrowUp, Arrow navigation with wrap-around and
 * disabled skipping, Home/End, typeahead, Escape) plus top-layer rendering
 * and light dismiss.
 */

async function activeItemLabel(page: Page): Promise<string> {
  return page.evaluate(
    () => (document.activeElement as HTMLElement | null)?.textContent?.trim() ?? ''
  );
}

/**
 * The panel fades in/out over var(--haze-duration-fast) (120ms) driven by
 * data-state. Asserting mid-animation can observe a half-faded panel, so
 * open flows wait for the enter animation to settle (data-state='open' +
 * computed opacity back at 1) and close flows rely on toBeHidden()'s
 * auto-retry — the unmount only happens once the exit settles.
 */
async function expectOpenAnimationSettled(menu: Locator): Promise<void> {
  await expect(menu).toHaveAttribute('data-state', 'open');
  await expect(menu).toHaveCSS('opacity', '1');
}

test.describe('DropdownMenu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  async function openWithKeyboard(page: Page) {
    const trigger = page.getByRole('button', { name: 'Actions' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expectOpenAnimationSettled(menu);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    return { trigger, menu };
  }

  test('ArrowDown on the trigger opens the menu on the first item', async ({ page }) => {
    await openWithKeyboard(page);
    await expect.poll(() => activeItemLabel(page)).toBe('Apple');
  });

  test('Arrow keys move and wrap, skipping the disabled item', async ({ page }) => {
    await openWithKeyboard(page); // focus: Apple
    await page.keyboard.press('ArrowDown'); // Banana
    await expect.poll(() => activeItemLabel(page)).toBe('Banana');
    await page.keyboard.press('ArrowDown'); // Cherry
    await expect.poll(() => activeItemLabel(page)).toBe('Cherry');

    await page.keyboard.press('End'); // last enabled item
    await expect.poll(() => activeItemLabel(page)).toBe('Durian');
    await page.keyboard.press('ArrowDown'); // wraps to first (Elderberry disabled)
    await expect.poll(() => activeItemLabel(page)).toBe('Apple');
    await page.keyboard.press('ArrowUp'); // wraps to last
    await expect.poll(() => activeItemLabel(page)).toBe('Durian');
    await page.keyboard.press('Home'); // first
    await expect.poll(() => activeItemLabel(page)).toBe('Apple');
  });

  test('typeahead focuses items by typed prefix', async ({ page }) => {
    await openWithKeyboard(page); // focus: Apple
    await page.keyboard.press('b');
    await expect.poll(() => activeItemLabel(page)).toBe('Banana');
    // Typed characters accumulate for 500ms into a multi-char prefix
    // ('b' then 'c' within the window would search 'bc' and match
    // nothing) — let the buffer reset between prefixes.
    await page.waitForTimeout(600);
    await page.keyboard.press('c');
    await expect.poll(() => activeItemLabel(page)).toBe('Cherry');
    await page.waitForTimeout(600);
    await page.keyboard.press('d');
    await expect.poll(() => activeItemLabel(page)).toBe('Durian');
  });

  test('Escape closes the menu and returns focus to the trigger', async ({ page }) => {
    const { trigger, menu } = await openWithKeyboard(page);
    await expect.poll(() => activeItemLabel(page)).toBe('Apple');
    await page.keyboard.press('Escape');
    // toBeHidden auto-retries through the 120ms fade-out: the panel
    // unmounts only once the exit animation settles.
    await expect(menu).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => activeItemLabel(page)).toBe('Actions');
  });

  test('clicking an item closes the menu and refocuses the trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Actions' });
    await trigger.click();
    const menu = page.getByRole('menu');
    await expectOpenAnimationSettled(menu);
    await page.getByRole('menuitem', { name: 'Cherry' }).click();
    await expect(menu).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => activeItemLabel(page)).toBe('Actions');
  });

  test('renders in the top layer and light-dismisses on outside click', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Actions' });
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expectOpenAnimationSettled(menu);
    await expect
      .poll(() => menu.evaluate((el) => el.matches(':popover-open')))
      .toBe(true);

    await page.mouse.click(8, 700);
    await expect(menu).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
