import { test as base, expect } from '@playwright/test';
import type { VoiceOverPlaywright } from '@guidepup/playwright';

/**
 * Real VoiceOver (macOS) smoke tests via guidepup — the AT layer that
 * axe cannot verify: not "the aria attributes exist" but "a real screen
 * reader actually announces the dialog name, the focused menu item, and
 * the polite toast". VoiceOver drives the browser through the macOS
 * accessibility API, so these tests only work on macOS.
 *
 * ## Running locally (macOS only)
 *
 * 1. Grant your terminal (and IDE) Accessibility permission:
 *    System Settings → Privacy & Security → Accessibility.
 * 2. One-time machine setup:
 *    `npx @guidepup/setup setup` then `npx @guidepup/setup install`
 *    (add `--ci` when non-interactive).
 * 3. Run this file in isolation — VoiceOver is a per-machine singleton
 *    and needs the browser window frontmost, so it cannot share a
 *    parallel run with the rest of the suite:
 *    `pnpm exec playwright test screen-reader --config e2e/playwright.config.ts`
 *
 * On CI the dedicated `screen-reader` job (macos-latest) runs exactly
 * that command; the runner is prepared by `@guidepup/setup setup --ci`.
 * On every other platform (the Linux e2e job included) the whole file
 * skips cleanly below.
 *
 * First-run risk (documented in the wave report): this file is only
 * executed on macOS, so the CI first run is its first real execution —
 * expect possible calibration of announcement phrasing/timeouts there.
 */

const supported = process.platform === 'darwin';

/**
 * `@guidepup/playwright` instantiates its screen reader singleton at
 * import time and throws "No available supported screen readers" on
 * platforms without one — a static import here would fail collection
 * of the ENTIRE suite on Linux (CI included). The driver is therefore
 * only imported on macOS; elsewhere a stand-in test that declares the
 * same `voiceOver` fixture (never constructed — every test below is
 * skipped) keeps collection green.
 */
async function loadVoiceOverTest() {
  const { voiceOverTest } = await import('@guidepup/playwright');
  return voiceOverTest;
}

const linuxStandIn = base.extend<{ voiceOver: VoiceOverPlaywright }>({
  voiceOver: async ({}, use) => {
    throw new Error('VoiceOver requires macOS');
  },
});

// Runtime surface of both branches covers page + voiceOver; the macOS
// branch additionally carries guidepup's start-options fixture (unused).
const test: typeof linuxStandIn = supported
  ? ((await loadVoiceOverTest()) as unknown as typeof linuxStandIn)
  : linuxStandIn;

test.skip(!supported, 'VoiceOver requires macOS');

test.use({
  // Screen readers cannot drive headless browsers — the headless
  // Chromium instance never exposes its AX tree to VoiceOver. macOS
  // runners support headed browsers natively (no xvfb needed).
  headless: false,
  // guidepup's default capture: "initial" records only the first
  // "page" of VoiceOver output — the announcements these tests
  // assert (dialog open, menu focus, toast) are produced AFTER the
  // initial navigation, so they were silently dropped from
  // spokenPhraseLog() and every assertion failed with the stale
  // "Open dialog button" phrase. Full capture fixes that.
  voiceOverStartOptions: { capture: true },
});

// VoiceOver is a per-machine singleton: never run these tests in
// parallel with each other (the config's fullyParallel would otherwise
// fan the file out across workers).
test.describe.configure({ mode: 'serial' });

/** VoiceOver speech is asynchronous: poll the phrase log for a phrase. */
async function expectAnnounced(
  voiceOver: VoiceOverPlaywright,
  phrase: string
): Promise<void> {
  await expect
    .poll(
      async () => (await voiceOver.spokenPhraseLog()).join('\n'),
      // Generous timeout: polite announcements queue behind in-progress
      // speech, and CI runners are slow to settle audio services.
      { timeout: 30_000 }
    )
    .toContain(phrase);
}

test.describe('VoiceOver smoke', () => {
  test.beforeEach(async ({ page, voiceOver }, testInfo) => {
    // VoiceOver startup (per-test fixture) plus the item-chooser
    // navigation dance comfortably exceed the default 30s budget,
    // and per-test fixture setup counts against it.
    test.setTimeout(180_000);
    // The macOS runner is a black box: capture every console and
    // page error so a module-graph crash surfaces in the job log
    // instead of a blank-root timeout.
    const consoleErrors: string[] = [];
    page.on('pageerror', (error) => {
      consoleErrors.push(`pageerror: ${error.message}`);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(`console: ${message.text()}`);
      }
    });
    await page.goto('/components/screen-reader');
    // Resilience guard: if the harness somehow fails to
    // render (e.g. a module-graph hiccup on the first
    // navigation of a fresh dev server), give the warm
    // graph one reload before declaring failure.
    if ((await page.locator('#dialog-opener').count()) === 0) {
      await page.reload();
    }
    // Fail fast: a local dev server renders in well under 30s, so a
    // miss is a real failure — dump the DOM and captured errors for
    // remote diagnosis rather than burning the full 180s budget.
    try {
      await page
        .locator('#dialog-opener')
        .waitFor({ state: 'attached', timeout: 30_000 });
    } catch (error) {
      const html = await page.content();
      throw new Error(
        `screen-reader harness never rendered (blank root?). ` +
          `console: ${consoleErrors.join(' | ') || 'none'}\n` +
          `html: ${html.slice(0, 2000)}\n` +
          `${testInfo.title}: ${
            error instanceof Error ? error.message : String(error)
          }`
      );
    }
    // Move the VoiceOver cursor from the browser chrome into the page
    // content (guidepup's item-chooser dance); also brings the browser
    // window to front.
    await voiceOver.navigateToWebContent();
  });

  test('opening the dialog announces its accessible name', async ({
    page,
    voiceOver,
  }) => {
    await page.locator('#dialog-opener').click();
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();

    // showModal must transfer focus into the panel — VoiceOver
    // announces from focus.
    await expect
      .poll(() =>
        page.evaluate(
          () => document.activeElement?.closest('dialog') !== null
        )
      )
      .toBe(true);

    // The dialog names itself via aria-labelledby → the title h2, so
    // the announcement contains "Confirm action" (plus role/extra
    // words that vary by VoiceOver version — match by name only).
    await expectAnnounced(voiceOver, 'Confirm action');
  });

  test('ArrowDown in the open menu announces the focused menu item', async ({
    page,
    voiceOver,
  }) => {
    // Clicking opens the menu with focus left on the trigger — the
    // menu items are focused only by the ArrowDown roving.
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await voiceOver.clearSpokenPhraseLog();

    // Page-level keystroke (Playwright keyboard): the trigger's
    // keydown handler hands focus to the first item; VoiceOver echoes
    // the AX focus event — the contract under test is "focus moves
    // into the menu are announced".
    await page.keyboard.press('ArrowDown');
    await expect
      .poll(() =>
        page.evaluate(
          () => document.activeElement?.getAttribute('role') === 'menuitem'
        )
      )
      .toBe(true);

    await expectAnnounced(voiceOver, 'Apple');
  });

  test('a polite success toast is announced', async ({
    page,
    voiceOver,
  }) => {
    await voiceOver.clearSpokenPhraseLog();
    await page.locator('#toast-opener').click();
    await expect(page.getByText('Saved successfully')).toBeVisible();

    // role="status" is aria-live="polite": the announcement queues
    // behind any in-progress speech, so poll the log rather than the
    // last phrase.
    await expectAnnounced(voiceOver, 'Saved successfully');
  });
});
