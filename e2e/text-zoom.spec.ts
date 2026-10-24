import { expect, test } from '@playwright/test';

/**
 * WCAG 1.4.4 (Resize Text) acceptance for the opt-in rem preset.
 *
 * haze-ui's default token scales are px: under full-page browser zoom
 * everything scales, but under text-only zoom (browser text zoom, OS
 * font-size settings that surface as rem) the glyphs grow while
 * px-declared paddings, gaps and radii stay fixed. The remScale preset
 * (src/lib/tokens/zoom.ts) re-declares the space / text-size / radius
 * scales at an exact 16px = 1rem base, so a subtree that mounts it next
 * to its spacing/typography classes follows the root font size.
 *
 * The harness (e2e/app/zoom-main.tsx) renders two identical islands: a
 * px baseline and one carrying spacing + typography + remScale. This
 * spec flips the root font size 16px → 32px (200%) and asserts every
 * token-driven metric doubles inside the rem island while the baseline
 * island computes unchanged values — including exact parity at the
 * default 16px root (the rem conversion must not shift resting layout).
 */

type Metrics = {
  probeFontSize: number;
  probePaddingTop: number;
  probeRadius: number;
  buttonFontSize: number;
  buttonPaddingTop: number;
  buttonPaddingLeft: number;
  islandGap: number;
};

const metricsOf = async (
  page: import('@playwright/test').Page,
  region: 'baseline' | 'rem'
): Promise<Metrics> =>
  page.locator(`[data-zoom-region="${region}"]`).evaluate((root) => {
    const probe = root.querySelector<HTMLElement>('[data-slot="zoom-probe"]')!;
    const button = root.querySelector<HTMLButtonElement>('button')!;
    const probeStyle = getComputedStyle(probe);
    const buttonStyle = getComputedStyle(button);
    return {
      probeFontSize: parseFloat(probeStyle.fontSize),
      probePaddingTop: parseFloat(probeStyle.paddingTop),
      probeRadius: parseFloat(probeStyle.borderRadius),
      buttonFontSize: parseFloat(buttonStyle.fontSize),
      buttonPaddingTop: parseFloat(buttonStyle.paddingTop),
      buttonPaddingLeft: parseFloat(buttonStyle.paddingLeft),
      islandGap: parseFloat(getComputedStyle(root).columnGap),
    };
  });

/** var(--haze-space-4/2), var(--haze-text-base/sm), var(--haze-radius-lg), var(--haze-space-3). */
const AT_16PX_ROOT: Metrics = {
  probeFontSize: 16,
  probePaddingTop: 16,
  probeRadius: 8,
  buttonFontSize: 14,
  buttonPaddingTop: 8,
  buttonPaddingLeft: 16,
  islandGap: 12,
};

const AT_32PX_ROOT: Metrics = Object.fromEntries(
  Object.entries(AT_16PX_ROOT).map(([key, value]) => [key, value * 2])
) as Metrics;

test.describe('remScale — WCAG 1.4.4 text zoom', () => {
  test('200% root font size doubles rem-island metrics and leaves the px baseline fixed', async ({
    page,
  }) => {
    await page.goto('/zoom.html');
    await expect(page.locator('[data-zoom-region="baseline"]')).toBeVisible();
    await expect(page.locator('[data-zoom-region="rem"]')).toBeVisible();

    // At the default 16px root the rem conversion is exact: both islands
    // compute identical metrics (opting in must not shift resting layout).
    expect(await metricsOf(page, 'baseline')).toEqual(AT_16PX_ROOT);
    expect(await metricsOf(page, 'rem')).toEqual(AT_16PX_ROOT);

    // Text-only zoom: only the root font size changes, nothing re-renders.
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    ).toBe('32px');

    // Baseline island: px tokens do not follow the root font size.
    expect(await metricsOf(page, 'baseline')).toEqual(AT_16PX_ROOT);

    // rem island: every token-driven metric doubles at 200%.
    expect(await metricsOf(page, 'rem')).toEqual(AT_32PX_ROOT);
  });
});
