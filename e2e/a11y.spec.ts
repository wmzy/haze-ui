import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * axe baseline for the core interactive components (Popover, menu class,
 * Toast, FormItem) — states both closed and open/errored, since the open
 * panels carry the aria wiring. Only WCAG-tagged rules run: the harness
 * page is not a real document (no landmarks/h1), and best-practice-only
 * rules like `region` / `page-has-heading-one` are noise here — the same
 * policy as the unit-level jest-axe scans, which disable `region`.
 */

const WCAG_TAGS = [
  'wcag2a',
  'wcag21a',
  'wcag2aa',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
];

async function scan(page: Page, selector: string) {
  const results = await new AxeBuilder({page})
    .withTags(WCAG_TAGS)
    .include(selector)
    .analyze();
  const summary = results.violations
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.help} → ${v.nodes
          .map((n) => n.target.join(' '))
          .join('; ')}`
    )
    .join('\n');
  expect(summary || 'no violations', summary).toBe('no violations');
}

test.describe('axe baseline', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
  });

  test('closed Popover and menu triggers', async ({page}) => {
    await scan(page, '#popover-demo');
    await scan(page, '#menu-demo');
  });

  test('open Popover panel', async ({page}) => {
    await page.getByText('Open popover').click();
    await scan(page, '#popover-demo');
  });

  test('open dropdown menu', async ({page}) => {
    await page.getByRole('button', {name: 'Actions'}).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await scan(page, '#menu-demo');
  });

  test('shown toast', async ({page}) => {
    await page.locator('#toast-opener').click();
    await expect(page.getByRole('alert')).toBeVisible();
    await scan(page, '#toast-demo');
  });

  test('FormItem with and without validation error', async ({page}) => {
    await scan(page, '#form-demo');
    await page.getByRole('button', {name: 'Submit'}).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await scan(page, '#form-demo');
  });
});
