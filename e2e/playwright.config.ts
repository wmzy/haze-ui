import * as path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig, devices } from '@playwright/test';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
export default defineConfig({
  testDir: '.',
  outputDir: './test-results',
  snapshotDir: './__snapshots__',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5199',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      // Pixel baselines run on the same Playwright-pinned Chromium locally
      // and in CI, but host fontconfig fallbacks and GPU vs software
      // rasterization can still shift subpixels at text edges. A 2% pixel
      // ratio absorbs that platform noise without masking layout or color
      // regressions (panels are far more than 2% pixels).
      maxDiffPixelRatio: 0.02,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx vite --config e2e/vite.config.mts --port 5199',
    url: 'http://127.0.0.1:5199',
    cwd: repoRoot,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
