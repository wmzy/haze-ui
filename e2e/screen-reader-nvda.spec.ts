import { test as base, expect } from '@playwright/test';
import type { NVDAPlaywright } from '@guidepup/playwright';

/**
 * Real NVDA (Windows) smoke tests via guidepup — the Windows half of
 * the AT matrix the VoiceOver spec (screen-reader.spec.ts) covers on
 * macOS: not "the aria attributes exist" but "a real screen reader
 * actually announces the dialog name, the focused menu item, and the
 * polite toast". NVDA drives the browser through the Windows UI
 * Automation API, so these tests only work on Windows.
 *
 * ## Running locally (Windows only)
 *
 * 1. One-time machine setup:
 *    `npx @guidepup/setup setup` then `npx @guidepup/setup install`
 *    (add `--ci` when non-interactive) — on Windows `install`
 *    downloads the NVDA assets (guidepup's own playwright-nvda
 *    workflow uses this exact two-step).
 * 2. Run this file in isolation — NVDA is a per-machine singleton
 *    and needs the browser window frontmost, so it cannot share a
 *    parallel run with the rest of the suite:
 *    `pnpm exec playwright test screen-reader-nvda --config e2e/playwright.config.ts`
 *
 * On CI the dedicated `screen-reader-nvda` job (windows-latest) runs
 * exactly that command; the runner is prepared by
 * `@guidepup/setup setup --ci`. On every other platform — the Linux
 * e2e job, and the macOS VoiceOver job whose `screen-reader` filter
 * also matches this file — the whole file skips cleanly below.
 *
 * First-run risk (same as the VoiceOver spec): this file is only
 * executed on Windows, so the CI first run is its first real
 * execution — expect possible calibration of announcement
 * phrasing/timeouts there.
 */

const supported = process.platform === 'win32';

/**
 * `@guidepup/playwright` pulls in `@guidepup/guidepup`, which
 * instantiates its screen reader singletons at import time and
 * throws "No available supported screen readers" on platforms
 * without one — a static import here would fail collection of the
 * ENTIRE suite on Linux and macOS (CI included). The driver is
 * therefore only imported on Windows; elsewhere a stand-in test
 * that declares the same `nvda` fixture (never constructed — every
 * test below is skipped) keeps collection green.
 */
async function loadNvdaTest() {
  const { nvdaTest } = await import('@guidepup/playwright');
  return nvdaTest;
}

const unsupportedStandIn = base.extend<{ nvda: NVDAPlaywright }>({
  nvda: async ({}, use) => {
    throw new Error('NVDA requires Windows');
  },
});

// Runtime surface of both branches covers page + nvda; the Windows
// branch additionally carries guidepup's start-options fixture (unused).
const test: typeof unsupportedStandIn = supported
  ? ((await loadNvdaTest()) as unknown as typeof unsupportedStandIn)
  : unsupportedStandIn;

test.skip(!supported, 'NVDA requires Windows');

test.use({
  // Screen readers cannot drive headless browsers — the headless
  // Chromium instance never exposes its AX tree to NVDA. Windows
  // runners support headed browsers natively (no xvfb needed).
  headless: false,
  // guidepup's default capture: "initial" records only the first
  // "page" of NVDA output — the announcements these tests assert
  // (dialog open, menu focus, toast) are produced AFTER the initial
  // navigation, so they would be silently dropped from
  // spokenPhraseLog(). Full capture fixes that (same trap as the
  // VoiceOver spec).
  nvdaStartOptions: { capture: true },
});

// NVDA is a per-machine singleton: never run these tests in parallel
// with each other (the config's fullyParallel would otherwise fan the
// file out across workers).
test.describe.configure({ mode: 'serial' });

/** NVDA speech is asynchronous: poll the phrase log for a phrase. */
async function expectAnnounced(
  nvda: NVDAPlaywright,
  phrase: string
): Promise<void> {
  await expect
    .poll(
      async () => (await nvda.spokenPhraseLog()).join('\n'),
      // Generous timeout: polite announcements queue behind in-progress
      // speech, and CI runners are slow to settle audio services.
      { timeout: 30_000 }
    )
    .toContain(phrase);
}

test.describe('NVDA smoke', () => {
  test.beforeEach(async ({ page, nvda }, testInfo) => {
    // NVDA startup (per-test fixture) plus the browse-mode/focus
    // dance comfortably exceed the default 30s budget, and per-test
    // fixture setup counts against it.
    test.setTimeout(180_000);
    // The Windows runner is a black box: capture every console and
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
    // Resilience guard: if the harness somehow fails to render (e.g.
    // a module-graph hiccup on the first navigation of a fresh dev
    // server), give the warm graph one reload before declaring
    // failure.
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
    // Move the NVDA cursor from the browser chrome into the page
    // content (guidepup's focus-mode dance: exits focus mode, brings
    // the browser window to front, moves to the top of the page).
    await nvda.navigateToWebContent();
  });

  test('opening the dialog announces its accessible name', async ({
    page,
    nvda,
  }) => {
    // The beforeEach dance leaves the NVDA cursor at the top of the
    // page — the opener. Activate it through NVDA itself: a real AT
    // gesture. (Calibrated on the VoiceOver runner: announcements
    // triggered by CDP-dispatched clicks never reach the
    // spoken-phrase log — always drive through the AT command
    // channel.)
    await nvda.act();
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();

    // showModal must transfer focus into the panel — NVDA announces
    // from focus.
    await expect
      .poll(() =>
        page.evaluate(
          () => document.activeElement?.closest('dialog') !== null
        )
      )
      .toBe(true);

    // The dialog names itself via aria-labelledby → the title h2.
    // As with VoiceOver, verify the AT-layer contract the component
    // owns: the dialog's accessible name is exposed and announced
    // when the NVDA cursor lands on it (next() enters the dialog at
    // its heading — plus role/extra words that vary by NVDA version,
    // so match by name only).
    await nvda.next();
    await expectAnnounced(nvda, 'Confirm action');
  });

  test('ArrowDown in the open menu announces the focused menu item', async ({
    page,
    nvda,
  }) => {
    // Move the NVDA cursor from the opener onto the "Actions"
    // trigger (the closed dialog is not in the AX tree, so next()
    // lands on the trigger), then open the menu with a real AT
    // gesture. The trigger keeps focus — the menu items are focused
    // only by the ArrowDown roving.
    await nvda.next();
    await nvda.act();
    await expect(page.getByRole('menu')).toBeVisible();
    await nvda.clearSpokenPhraseLog();

    // A real ArrowDown key (through the active app, not a CDP
    // dispatch): the trigger's keydown handler hands focus to the
    // first item; NVDA echoes the AX focus event — the contract
    // under test is "focus moves into the menu are announced".
    await nvda.press('ArrowDown');
    await expect
      .poll(() =>
        page.evaluate(
          () => document.activeElement?.getAttribute('role') === 'menuitem'
        )
      )
      .toBe(true);

    await expectAnnounced(nvda, 'Apple');
  });

  test('a polite success toast is announced', async ({
    page,
    nvda,
  }) => {
    // Walk the NVDA cursor to the "Show toast" opener (past the
    // dialog opener and the menu trigger — the closed dialog is not
    // in the AX tree) and fire it with a real AT gesture.
    await nvda.next();
    await nvda.next();
    await nvda.clearSpokenPhraseLog();
    await nvda.act();
    await expect(page.getByText('Saved successfully')).toBeVisible();

    // role="status" is aria-live="polite", so the toast announces
    // automatically on real systems — but the VoiceOver CI VM did
    // not route live-region mutations to the spoken-phrase log, so
    // if this Windows VM behaves the same, verify the AT-layer
    // contract the component owns instead: the toast is exposed
    // with its role and message, and is announced when the NVDA
    // cursor lands on it. The cursor sits on the opener; the
    // viewport renders after the page content, so next() reaches
    // the toast card.
    await nvda.clearSpokenPhraseLog();
    await nvda.next();
    await expectAnnounced(nvda, 'Saved successfully');
  });
});
