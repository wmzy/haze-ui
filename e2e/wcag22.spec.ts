import { expect, test } from '@playwright/test';

/**
 * WCAG 2.2 targeted audit on real layout — the checks axe cannot do:
 *
 *   - SC 2.5.8 Target Size (Minimum): every interactive element on the
 *     harness page must present a ≥24×24 CSS px target box.
 *   - SC 2.4.11 Focus (Appearance): walking the page with Tab, every
 *     stop must paint a focus indicator — an ≥2px outline or a
 *     box-shadow ring (the library uses both shapes; slider thumbs
 *     carry the ring on their pseudo-elements).
 *
 * Chromium-only by design: the assertions read exact CSS px boxes and
 * computed styles; the other engines' testMatch whitelist keeps this
 * spec out of their runs.
 */

const MIN_TARGET = 24;

/**
 * Elements exempt from the 24px floor, each with the reason it cannot
 * honestly reach it. Keep this list SHORT — an entry here is a
 * documented deviation, not a fix. (Currently empty: native range
 * thumbs are covered by measuring the input element, which carries its
 * own 24px hit strip.)
 */
const TARGET_SIZE_WHITELIST: { selector: string; reason: string }[] = [];

/** The interactive-element universe the audit walks. */
const INTERACTIVE_SELECTOR = [
  'button',
  'a',
  'input',
  'select',
  "[role='button']",
  "[role='switch']",
  "[role='tab']",
  "[role='menuitem']",
  "[role='option']",
  "[role='checkbox']",
  "[role='radio']",
  "[role='treeitem']",
].join(', ');

async function gotoAuditPage(page: import('@playwright/test').Page) {
  await page.goto('/components/wcag22');
  await expect(page.getByTestId('case-command')).toBeVisible();
}

test.describe('WCAG 2.5.8 target size (minimum)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuditPage(page);
  });

  test('every interactive element presents a ≥24×24 target box', async ({ page }) => {
    const violations = await page.evaluate(
      ({ selector, whitelist, min }) => {
        const exempt = (el: Element) =>
          whitelist.some((entry) => el.matches(entry.selector));
        const describe = (el: Element) => {
          const own = [
            el.tagName.toLowerCase(),
            el.getAttribute('role'),
            el.getAttribute('data-slot'),
            el.getAttribute('aria-label'),
          ].filter(Boolean);
          const text = (el.textContent ?? '').trim().slice(0, 24);
          return `${own.join('|')}${text ? ` "${text}"` : ''}`;
        };
        const found: {
          selector: string;
          size: string;
          width: number;
          height: number;
        }[] = [];
        for (const el of Array.from(document.querySelectorAll(selector))) {
          // Only elements that actually render: hidden panels (native
          // popover display:none) would measure 0×0 and misreport.
          if (!(el instanceof HTMLElement)) continue;
          if (el.offsetParent === null && el.getClientRects().length === 0)
            continue;
          if (el.matches(':disabled, [aria-disabled="true"]')) continue;
          if (exempt(el)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width >= min && rect.height >= min) continue;
          found.push({
            selector: describe(el),
            size: `${Math.round(rect.width)}×${Math.round(rect.height)}`,
            width: Math.round(rect.width * 100) / 100,
            height: Math.round(rect.height * 100) / 100,
          });
        }
        return found;
      },
      {
        selector: INTERACTIVE_SELECTOR,
        whitelist: TARGET_SIZE_WHITELIST,
        min: MIN_TARGET,
      }
    );
    expect(
      violations,
      `SC 2.5.8 — under-sized targets (w×h): ${violations
        .map((v) => `${v.selector} [${v.size}]`)
        .join('; ')}`
    ).toEqual([]);
  });
});

test.describe('WCAG 2.4.11 focus appearance', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuditPage(page);
  });

  test('every Tab stop paints a ≥2px outline or a box-shadow ring', async ({ page }) => {
    // Snapshot the RESTING shadow of every candidate BEFORE the walk:
    // a persistent decorative/elevation shadow must not satisfy the
    // check — SC 2.4.11 demands a focus-time CHANGE (an ≥2px outline,
    // or a box-shadow that differs from the unfocused state's).
    await page.evaluate((selector) => {
      for (const el of Array.from(document.querySelectorAll(selector))) {
        if (!(el instanceof HTMLElement)) continue;
        el.dataset.restingRing = getComputedStyle(el).boxShadow;
        const isRange =
          el instanceof HTMLInputElement && el.type === 'range';
        el.dataset.restingThumb = isRange
          ? getComputedStyle(el, '::-webkit-slider-thumb').boxShadow
          : '';
      }
    }, INTERACTIVE_SELECTOR);
    // Walk the page's tab order: press Tab until focus returns to an
    // already-visited element (with a safety cap). Keyboard-driven focus
    // matches :focus-visible, where the library's rings live. Stops are
    // tracked by element identity — sibling controls can share a
    // description, which would end the walk early.
    const stops: string[] = [];
    for (let i = 0; i < 120; i += 1) {
      await page.keyboard.press('Tab');
      const stop = await page.evaluate((visited: number) => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        if (!(el instanceof HTMLElement)) return null;
        // Identity marker: revisiting a stop means the order wrapped.
        if (el.dataset.focusWalkVisited !== undefined)
          return { repeat: true, selector: el.dataset.focusWalkVisited };
        const own = [
          el.tagName.toLowerCase(),
          el.getAttribute('role'),
          el.getAttribute('data-slot'),
          el.getAttribute('aria-label'),
        ].filter(Boolean);
        const selector = own.join('|');
        el.dataset.focusWalkVisited = `${visited}:${selector}`;
        return { repeat: false, selector };
      }, stops.length);
      if (stop === null) continue; // focus fell to body mid-order
      if (stop.repeat) break; // wrapped around — walk complete
      stops.push(stop.selector);

      // expect.poll: computed-style assertions settle under parallel
      // load (the forced-colors spec precedent).
      await expect
        .poll(
          async () => {
            const info = await page.evaluate(() => {
              const el = document.activeElement;
              if (!(el instanceof HTMLElement))
                return {
                  outline: 0,
                  ring: 'none',
                  thumb: 'none',
                  restingRing: 'none',
                  restingThumb: '',
                };
              const cs = getComputedStyle(el);
              // Range inputs paint the ring on the thumb pseudo —
              // the element-level computed style cannot see it.
              const isRange =
                el instanceof HTMLInputElement && el.type === 'range';
              const thumb = isRange
                ? getComputedStyle(el, '::-webkit-slider-thumb')
                : null;
              return {
                outline: parseFloat(cs.outlineWidth) || 0,
                ring: cs.boxShadow,
                thumb: thumb ? thumb.boxShadow : 'none',
                restingRing: el.dataset.restingRing ?? 'none',
                restingThumb: el.dataset.restingThumb ?? '',
              };
            });
            return (
              info.outline >= 2 ||
              // A shadow only counts when focus CHANGED it — a resting
              // decorative shadow must not satisfy the indicator.
              (info.ring !== 'none' && info.ring !== info.restingRing) ||
              (info.thumb !== 'none' && info.thumb !== info.restingThumb)
            );
          },
          {
            timeout: 3_000,
            message: `SC 2.4.11 — no focus indicator on ${stop.selector}`,
          }
        )
        .toBe(true);
    }
    // Sanity: the walk actually visited controls (a broken fixture
    // would pass vacuously).
    expect(stops.length, `visited: ${stops.join(' → ')}`).toBeGreaterThan(10);
  });
});
