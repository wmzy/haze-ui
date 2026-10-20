import type { NextConfig } from 'next';

// haze-ui is consumed from dist/ via its package exports map
// (`import` -> dist ESM, `./styles.css` -> dist/haze-ui.css), already
// compiled — no JSX/TS reaches the consumer. That is why no
// `transpilePackages: ['haze-ui']` entry is needed even though the
// package is linked with `link:../..`: Next bundles the prebuilt
// ESM and CSS as-is. If you ever point the link at an unbuilt
// checkout (src/ instead of dist/), add transpilePackages here.
const nextConfig: NextConfig = {
  // Pin both roots to the haze-ui repository root. The host machine may have
  // unrelated lockfiles above this repo (Next walks up and picks the wrong
  // workspace root), and Turbopack additionally refuses to resolve files
  // outside its root: `haze-ui` is a `link:../..` symlink whose dist/ lives
  // in the repository root, outside this example's own lockfile boundary.
  // Without the shared root every `import ... from 'haze-ui'` fails with
  // "Module not found" under `next dev --turbopack` (webpack is unaffected;
  // outputFileTracingRoot and turbopack.root must match or Next warns).
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
  turbopack: {
    root: new URL('../../', import.meta.url).pathname,
  },
  // Next's build-time lint inherits the repo root eslint config, whose
  // react-refresh rules flag the standard `export const metadata` +
  // default component layout pattern. This example proves SSR/hydration,
  // not lint policy — `pnpm lint` at the repo root owns that.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
