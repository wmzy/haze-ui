# Contributing to haze-ui

Thanks for considering a contribution! This document covers the development
environment, the commands you will need, what CI expects from a pull request,
and the conventions every component follows.

## Development environment

- **Node.js ≥ 20** (CI runs 24) and **pnpm 10**
- A Linux/macOS POSIX shell (scripts and Playwright tooling assume one)

```sh
git clone https://github.com/wmzy/haze-ui.git
cd haze-ui
pnpm install
pnpm start        # docs-site dev server with HMR
```

The docs site (`src/views/**`) is also the demo app — every component has a
live page there, and it doubles as the review surface for visual changes.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm start` | Docs-site dev server (HMR) |
| `pnpm test` | Unit tests, once (vitest + jsdom) |
| `pnpm test:watch` | Unit tests in watch mode |
| `pnpm coverage` | Unit tests with V8 coverage (scoped to `src/lib/**`) |
| `pnpm test:e2e` | Playwright e2e suite (`e2e/`) |
| `pnpm lint` | ESLint with auto-fix (`src/**` and root `*.mjs`) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm build` | Library build: JS + types + per-component CSS + `css-manifest.json` + registry + docs snapshots |
| `pnpm build:demo` | Docs-site build to `dist/` |
| `pnpm size` | size-limit budgets |
| `pnpm commit` | lint-staged + commitizen prompt (Conventional Commits) |

Run a single unit test file:

```sh
pnpm vitest run src/lib/components/Button/Button.test.tsx
```

Run a single e2e spec:

```sh
pnpm exec playwright test popover --config e2e/playwright.config.ts
```

## What CI checks

Every pull request runs: `lint` → `test` → `typecheck` → `build` (including
CSS-manifest and dist-contract assertions) → e2e → size-limit, plus two
special jobs described below. A red CI is a blocked merge, not a warning.

### Unit tests and accessibility

- Tests are **co-located**: `ComponentName.test.tsx` sits next to
  `ComponentName.tsx` under `src/lib/components/<ComponentName>/`.
- **Every component test suite must include an axe case** asserting zero
  violations on the WCAG-tagged rules — this is a hard gate, not a
  best-effort check.
- Repo-wide contract suites also run in `pnpm test` and fail loudly:
  `data-slot-coverage`, `css-box-sizing`, `rtl`, `contrast` (OKLCH token
  contrast floors) and `dist-esm-contract` (RSC-safe module split). If your
  change trips one of them, the fix belongs in your PR.

### E2E and visual baselines

- Playwright e2e lives in `e2e/`. Engine-sensitive specs (floating collision,
  popover, dialog, dropdown menu, rtl, keyboard-critical) run on
  **Chromium, Firefox and WebKit alike**; a fourth project pins phone-viewport
  contracts (412×839, touch).
- **Pixel-locked visual baselines**: if your change intentionally alters
  appearance, re-record the affected snapshots and commit the new PNGs:

  ```sh
  pnpm exec playwright test <spec> --config e2e/playwright.config.ts --update-snapshots
  ```

  Unexplained baseline drift is treated as a regression. When re-recording,
  say so in the PR description and include a screenshot of the new render.
- **Screen-reader smoke suite** (`e2e/screen-reader.spec.ts`) runs on a macOS
  CI job with a real VoiceOver instance driven by guidepup. Locally this
  needs macOS:

  ```sh
  npx -y @guidepup/setup setup --ci && npx -y @guidepup/setup install
  pnpm exec playwright test screen-reader --config e2e/playwright.config.ts
  ```

  On Linux the suite is skipped (guidepup cannot import there) — do not
  weaken its assertions to make local runs greener.

### Size budgets

`pnpm size` (size-limit) ratchets the brotli/gzip cost of the aggregate CSS
and per-family entry points. If your feature legitimately grows a budget,
raise it in the same PR with the measured numbers in the description.

## Component conventions

The full authoring template (stateless + stateful examples) lives in
[CLAUDE.md](./CLAUDE.md). The short list:

- **Tokens only** — reference `var(--haze-*)`; never hardcode colors,
  spacing, radius or typography values. Color tokens are generated from
  `src/lib/tokens/palette.ts` — edit the palette, never the generated files.
- **`x-class={[base, className]}`** for class merging; `type` over
  `interface`/`enum`; `const` over `let`.
- **Native props forward** — extend
  `Omit<ComponentPropsWithoutRef<'element'>, …>` and spread `...rest`.
- **User-facing state goes through `useControl`** (`Control<T> | T` props,
  via react-use-control) — never `useState` for state a parent may control.
- **`data-slot` attribute** on every rendered element — enforced by the
  coverage test.
- **A test file with an axe case** ships with every component.

### Registering a new component

A new component must be registered in six places, four of which are hard
build/test gates — CI will name the missing one:

1. the main barrel: `src/lib/index.ts`
2. `DESCRIPTIONS` in `scripts/generate-llms.mjs` (`pnpm build:demo` gate)
3. descriptions table + `CATEGORY_GROUPS` CSS family grouping in
   `scripts/generate-registry.mjs` (`pnpm build` gate)
4. sidebar entry: `src/views/Layout/component-groups.ts`
5. demos map + demo file: `src/views/ComponentDetail/index.tsx`
6. one-line blurb in both `src/views/i18n/en.ts` and `src/views/i18n/zh.ts`
   (the i18n coverage test fails without it)

Styled components also join the box-sizing contract
(`src/lib/css-box-sizing.test.ts`) and may need a size-limit budget bump.

### Locale strings

`LocaleProvider` packs are key-for-key complete — there is no DeepPartial
fallback for component strings. A new string must land in **all 11 packs**
(`en` in `strings.ts`, plus `zh-cn`, `ja-jp`, `de-de`, `fr-fr`, `es-es`,
`it-it`, `pt-br`, `ru-ru`, `ko-kr`, `ar-sa`); `strings.test.ts` enforces it.

## Commit and PR conventions

- **Conventional Commits** (`feat`, `fix`, `docs`, `chore`, `refactor`,
  `test`, …). `pnpm commit` runs the commitizen prompt for you.
- Keep PRs focused: one component or one concern per PR makes the visual
  baseline review meaningful.
- PR description should cover: what changed, why, which suites were
  added/updated (axe case, baselines re-recorded, budgets raised), and a
  screenshot or docs-site link for anything visual.

## Questions

Open an issue with the `feature_request` or `bug_report` template, or start
from the docs site's [Help](https://wmzy.github.io/haze-ui/help) page.
