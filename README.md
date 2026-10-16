# Haze UI

> The React UI component library with controllable states.

English | [简体中文](./README-zh_CN.md)

[![npm](https://img.shields.io/npm/v/haze-ui)](https://www.npmjs.com/package/haze-ui)
[![downloads](https://img.shields.io/npm/dm/haze-ui.svg)](https://www.npmjs.com/package/haze-ui)
[![CI](https://github.com/wmzy/haze-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/wmzy/haze-ui/actions/workflows/ci.yml)

haze-ui is a React 19 component library styled with Linaria (zero-runtime
CSS-in-JS) against `--haze-*` design tokens: 140 components in 9 groups,
ESM-only with a tree-shakeable `preserveModules` dist, RTL by construction,
and an RSC-aware split (`'use client'` is pre-injected only on interactive
modules, so the static subset renders as React Server Components). Every
stateful component speaks the same `ControlOrValue<T>` protocol — one prop,
`checked?: Control<T> | T`, covers controlled *and* uncontrolled usage.
Only `react` and `react-dom` (v19) are peers; every engine (react-f0rm,
TanStack Table, recharts, dnd-kit, qrcode) is a regular dependency that
tree-shakes away when your imports never reach it.

## Quickstart

```sh
npm i haze-ui
# or
pnpm add haze-ui
```

Load the CSS — pick one of two modes:

```jsx
// A) one full stylesheet (simplest)
import 'haze-ui/styles.css';
```

```ts
// B) the official Vite plugin injects per-component CSS automatically
//    vite.config.ts
import hazeCss from 'haze-ui-vite';

export default { plugins: [react(), hazeCss()] };
```

Then render your first component:

```jsx
import { lightTheme, Button } from 'haze-ui';

export function App() {
  return (
    <main className={lightTheme}>
      <Button onClick={() => console.log('haze!')}>Start</Button>
    </main>
  );
}
```

The theme class activates the token set — that is the whole setup. Prefer a
scaffolded start? `pnpm create haze-ui my-app` ships runnable Vite and
Next.js App Router templates.

Colors are generated in OKLCH with interaction states derived at runtime via
CSS relative colors, so the browser floor is Chrome/Edge 119+, Safari 16.4+
or Firefox 128+ (no HSL/hex fallbacks).

## Highlights

- **Accessibility as a release gate** — an axe case in every component test
  suite, Playwright e2e across Chromium/Firefox/WebKit plus a phone-viewport
  project, pixel-locked visual baselines, and a real VoiceOver smoke suite on
  macOS CI.
  → [Accessibility guide](https://wmzy.github.io/haze-ui/guides/a11y) ·
  [A11y contracts](https://wmzy.github.io/haze-ui/guides/a11y-contracts)
- **Per-component CSS** — the JS entry imports no stylesheet. Load the full
  `haze-ui/styles.css`, cherry-pick `haze-ui/css/*.css` subpaths, or let
  [haze-ui-vite](https://www.npmjs.com/package/haze-ui-vite) inject the right
  files per import through `haze-ui/css-manifest.json`.
  → [Getting started](https://wmzy.github.io/haze-ui/getting-started)
- **`Control<T> | T` controllable state** — one state prop per component,
  powered by [react-use-control](https://github.com/wmzy/react-use-control);
  no `defaultXxx`/`xxx` dual API to keep in sync.
  → [Getting started](https://wmzy.github.io/haze-ui/getting-started)
- **AI / chat component family** — `ChatContainer`, `ChatMessage`,
  `StreamingText`, `ToolCallCard`, `ThinkingIndicator` and `ChatInput` cover
  the agent chat surface, with a unit-tested adapter recipe for the Vercel AI
  SDK's `useChat`.
  → [AI showcase](https://wmzy.github.io/haze-ui/ai-showcase) ·
  [Recipes](https://wmzy.github.io/haze-ui/recipes)
- **Multi-calendar date layer** — Gregorian plus six built-in adapters
  (Hijri Umm al-Qura, Persian, Hebrew, Japanese era, Buddhist, Ethiopic):
  integer-arithmetic implementations cross-verified against full-ICU `Intl`
  oracles, exported from the barrel via `getAdapter()`.
  → [Components](https://wmzy.github.io/haze-ui/components)
- **OKLCH tokens with W3C DTF export** — hover/active/focus-ring colors
  re-derive at runtime from CSS relative-color formulas, and the whole token
  registry exports to the W3C Design Tokens format for Figma / Tokens Studio.
  → [Tokens](https://wmzy.github.io/haze-ui/tokens) ·
  [Theme editor](https://wmzy.github.io/haze-ui/theme-editor)

## Ecosystem

| Resource | Link |
| --- | --- |
| Documentation | <https://wmzy.github.io/haze-ui/> |
| Getting started | <https://wmzy.github.io/haze-ui/getting-started> |
| Migration guide (AntD / shadcn) | <https://wmzy.github.io/haze-ui/guides/migration> |
| llms.txt / full API for AI readers | <https://wmzy.github.io/haze-ui/llms.txt> |
| MCP server (`haze-ui-mcp`) | <https://www.npmjs.com/package/haze-ui-mcp> |
| shadcn registry | [registry/README.md](./registry/README.md) — `pnpm dlx shadcn@latest add wmzy/haze-ui/button` |
| create-haze-ui (CLI scaffolding) | <https://www.npmjs.com/package/create-haze-ui> |
| haze-ui-vite (CSS auto-injection) | <https://www.npmjs.com/package/haze-ui-vite> |

Every styled export is also installable through the shadcn CLI as a thin
wrapper over the npm package — see [registry/README.md](./registry/README.md).

## Community

- 🐛 [Report a bug](https://github.com/wmzy/haze-ui/issues/new?template=bug_report.yml)
- ✨ [Request a feature](https://github.com/wmzy/haze-ui/issues/new?template=feature_request.yml)
- 📖 [Contribute to the project](./CONTRIBUTING.md)
- 🔒 [Security policy](./SECURITY.md)

**Building with haze-ui?** We would love to feature you. Open an issue
titled `used by: <your project>` with the project name, a link and (optionally)
a logo, and it will be added to this README.

## License

[MIT](https://choosealicense.com/licenses/mit/)
