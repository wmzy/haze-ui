import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Mobile floating-panel containment contracts on a phone viewport
 * (chromium-mobile project: Pixel 7 emulation — 412×839, touch,
 * isMobile). The desktop collision spec (floating-collision.spec.ts)
 * vouches for flip/shift on an 800×600 window; a phone viewport is the
 * geometry real apps ship: narrow enough that a below-trigger panel
 * with a 4px gap and ~240-380px of height has no room under any
 * trigger in the lower half of the screen.
 *
 * The harness (e2e/app/components/mobile-overlays.html) mounts the four
 * floating families — multiple Select, Combobox, Datepicker,
 * DropdownMenu — in two arrangements: triggers in the lower band of the
 * initial viewport (opened without scrolling) and triggers near the
 * bottom of a tall document (opened after the page is scrolled fully
 * down). Each panel is opened by a real touchscreen tap.
 *
 * The asserted contract is the cross-tier containment invariant the
 * floating engine guarantees on every tier (anchored
 * position-try-fallbacks, JS-positioned flip/shift, anchored cross-axis
 * nudge): the open panel's bounding box sits fully inside the viewport,
 * and the panel never covers its own trigger (the hit test at the
 * trigger's center must still find the trigger — elementFromPoint
 * respects the top layer, so a covering panel would win the hit).
 *
 * Tolerance: the components are mounted without a `collisionPadding`
 * prop, and the engine's default is 0 (collision.ts resolvePadding — a
 * missing value counts as no padding), so containment is asserted
 * against the unpadded viewport. EPSILON only absorbs fractional
 * layout (subpixel rects from anchor-positioning and 2.625× device
 * pixel ratio snapping); any real overflow fails.
 *
 * Failure messages carry the measured geometry (panel box, viewport
 * size, per-edge coordinates) so a red run can be diagnosed from the
 * report alone.
 */

/** Layout is fractional; allow subpixel slack on edge comparisons. */
const EPSILON = 0.5;

/** The panel a floating trigger controls, via aria-controls. */
async function panelOf(trigger: Locator): Promise<Locator> {
  const id = await trigger.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  return trigger.page().locator(`[id="${id}"]`);
}

/** The four floating families under test, keyed by trigger name part. */
type PanelKind = 'select' | 'combobox' | 'datepicker' | 'menu';

const KINDS: PanelKind[] = ['select', 'combobox', 'datepicker', 'menu'];

function triggerFor(page: Page, stage: 'Lower' | 'Bottom', kind: PanelKind) {
  if (kind === 'menu') {
    return page.getByRole('button', { name: `${stage} actions` });
  }
  const subject =
    kind === 'select' ? 'fruits' : kind === 'combobox' ? 'engine' : 'date';
  // Select's floating trigger, Combobox's input and Datepicker's
  // readonly input all expose role=combobox (aria-expanded +
  // aria-controls), named via aria-label / placeholder in the fixture.
  return page.getByRole('combobox', { name: `${stage} ${subject}` });
}

/** Taps the trigger open and resolves the trigger + its panel. */
async function openPanel(
  page: Page,
  stage: 'Lower' | 'Bottom',
  kind: PanelKind
): Promise<{ trigger: Locator; panel: Locator }> {
  const trigger = triggerFor(page, stage, kind);
  // Geometry precondition: the fixture places this stage's triggers in
  // the lower band of the phone viewport (lower stage via the vh spacer
  // at scroll 0, bottom stage via the tail block once scrolled down) —
  // that is what leaves no room below the trigger and forces the
  // collision path under test. If fixture drift ever moves a trigger
  // up, the test would keep passing while exercising nothing, so the
  // band is asserted, not assumed.
  const triggerBox = await trigger.boundingBox();
  const viewport = page.viewportSize()!;
  expect(
    triggerBox && triggerBox.y + triggerBox.height / 2 > viewport.height * 0.55,
    `${kind} (${stage} stage): trigger center at y ` +
      `${triggerBox ? fmt(triggerBox.y + triggerBox.height / 2) : 'n/a'} is not in ` +
      `the lower band of the ${viewport.width}×${viewport.height} viewport — fix the fixture spacers`
  ).toBeTruthy();
  await trigger.tap();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const panel = await panelOf(trigger);
  await expect(panel).toBeVisible();
  return { trigger, panel };
}

function fmt(value: number): string {
  return value.toFixed(1);
}

type Box = { x: number; y: number; width: number; height: number };

function describeBox(box: Box): string {
  return (
    `${fmt(box.width)}×${fmt(box.height)} at x ${fmt(box.x)}→${fmt(box.x + box.width)}, ` +
    `y ${fmt(box.y)}→${fmt(box.y + box.height)}`
  );
}

/**
 * Smallest clearance between the panel box and the viewport, in px —
 * negative when the panel sticks out over an edge. null while the
 * panel has no laid-out box yet, so expect.poll keeps waiting.
 */
async function clearance(
  page: Page,
  panel: Locator,
  pad = 0
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

/** Asserts the panel is fully inside the unpadded viewport, with the
 * measured coordinates baked into the failure message. */
async function expectPanelInsideViewport(
  page: Page,
  panel: Locator,
  label: string
): Promise<void> {
  // The enter fade is opacity-only, but tier placement (the anchored
  // nudge / JS position effect) may need a frame after the panel is
  // shown — poll until the geometry settles. expect.poll's failure
  // output only prints the clearance number, so the contract itself is
  // then re-asserted once with a fully descriptive message.
  await expect
    .poll(() => clearance(page, panel))
    .toBeGreaterThanOrEqual(-EPSILON);
  const box = (await panel.boundingBox())!;
  const viewport = page.viewportSize()!;
  const value = Math.min(
    box.x,
    box.y,
    viewport.width - (box.x + box.width),
    viewport.height - (box.y + box.height)
  );
  expect(
    value,
    `${label}: panel ${describeBox(box)} escapes the ${viewport.width}×${viewport.height} viewport ` +
      `(edges — left ${fmt(box.x)}, top ${fmt(box.y)}, right ${fmt(box.x + box.width)}, ` +
      `bottom ${fmt(box.y + box.height)}); containment contract with the default ` +
      `collisionPadding 0 (±${EPSILON}px subpixel slack)`
  ).toBeGreaterThanOrEqual(-EPSILON);
}

/** Asserts the open panel does not cover its trigger: the hit test at
 * the trigger's center must land inside the trigger. elementFromPoint
 * respects the top layer, so a panel overlapping that point would win
 * the hit and fail this. */
async function expectTriggerTappable(
  trigger: Locator,
  label: string
): Promise<void> {
  const hit = await trigger.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const point = document.elementFromPoint(x, y);
    return {
      covered: !point || !el.contains(point),
      by: point
        ? `${point.tagName.toLowerCase()}${point.id ? `#${point.id}` : ''}`
        : 'nothing (outside the viewport)',
      at: `(${x.toFixed(1)}, ${y.toFixed(1)})`,
    };
  });
  expect(
    hit.covered,
    `${label}: the hit test at the trigger center ${hit.at} found ${hit.by} ` +
      `instead of the trigger — the panel must not overlap its own trigger`
  ).toBe(false);
}

// Two arrangements, one describe each: the lower band of the initial
// viewport (opened without scrolling) and the bottom of a tall document
// (opened after scrolling fully down — the second scroll position
// mobile panels constantly face).
const STAGES = [
  {
    stage: 'Lower' as const,
    label: 'lower band of the initial viewport',
    scrollToBottom: false,
  },
  {
    stage: 'Bottom' as const,
    label: 'bottom of the scrolled document',
    scrollToBottom: true,
  },
];

for (const { stage, label, scrollToBottom } of STAGES) {
  test.describe(`mobile overlay containment — ${label}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/components/mobile-overlays');
      if (scrollToBottom) {
        await page.evaluate(() =>
          window.scrollTo(0, document.documentElement.scrollHeight)
        );
      }
    });

    for (const kind of KINDS) {
      test(`${kind} panel stays inside the viewport and keeps its trigger tappable`, async ({
        page,
      }) => {
        const { trigger, panel } = await openPanel(page, stage, kind);
        await expectPanelInsideViewport(page, panel, `${kind} (${stage} stage)`);
        await expectTriggerTappable(trigger, `${kind} (${stage} stage)`);
      });
    }
  });
}

test.describe('mobile overlay containment — scroll re-placement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/mobile-overlays');
  });

  test('open menu tracks its trigger and stays inside while the page scrolls', async ({
    page,
  }) => {
    const { trigger, panel } = await openPanel(page, 'Lower', 'menu');
    await expectPanelInsideViewport(page, panel, 'menu (before scroll)');

    // The document is ~2.8 viewports tall: scrolling under the open
    // panel moves its trigger, and whichever tier placed the panel
    // (anchor tracking / scroll-listener place / anchored nudge) must
    // re-place it back inside.
    await page.evaluate(() => window.scrollBy(0, 260));
    await expectPanelInsideViewport(page, panel, 'menu (after scrollBy 260)');
    await expectTriggerTappable(trigger, 'menu (after scrollBy 260)');
  });
});
