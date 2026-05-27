# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

haze-ui is a React UI component library built on a "controllable state" pattern via `react-use-control`. It uses Linaria (zero-runtime CSS-in-JS) for styling and design tokens as CSS custom properties.

## Commands

```bash
pnpm start          # Dev server with HMR
pnpm test           # Run tests once (vitest)
pnpm test:watch     # Run tests in watch mode
pnpm coverage       # Tests with V8 coverage (scoped to src/lib/**)
pnpm lint           # ESLint with auto-fix
pnpm build          # Build library (JS + types + CSS)
pnpm build:demo     # Build demo/docs site to dist/
```

Run a single test file: `pnpm vitest run src/lib/components/Button/Button.test.tsx`

## Architecture

### Library vs Demo App

- **`src/lib/`** — The published library. This is the only directory that gets built and published to npm.
- Everything else under `src/` (views, components, contexts, services, util) is the demo documentation app, not part of the package.

### Component Structure

Each component lives in `src/lib/components/{ComponentName}/` with:
- `index.ts` — barrel export only
- `ComponentName.tsx` — implementation
- `ComponentName.test.tsx` — tests (co-located)

Compound components (Accordion, Tabs, Table, etc.) have sub-components in the same directory.

### Design Tokens (`src/lib/tokens/`)

All visual values are CSS custom properties prefixed `--haze-{category}-{name}`. Components must never hardcode colors, spacing, or typography — always reference tokens.

- `colors.ts` — `lightTheme` / `darkTheme` Linaria classes
- `spacing.ts` — spacing, radius, shadow tokens
- `typography.ts` — font, size, weight tokens
- `registry.ts` — `TOKEN_REGISTRY` (all token definitions) and `COMPONENT_TOKENS` (per-component token mappings)

### Key Pattern: Controllable State

The library's differentiator. Stateful components accept `Control<T> | T` props via `react-use-control`, enabling controlled and uncontrolled usage without separate APIs.

### Vite Build Modes

Controlled by environment variables in `vite.config.mts`:
- `BUILD_LIB=true` — Library build (entry: `src/lib/index.ts`, preserveModules, externalizes peers)
- `BUILD_DEMO=true` — Demo site build
- Neither — Dev server

## Code Conventions

- `type` over `interface` and `enum`; `const` over `let`
- Function declarations for components: `export default function Button(...)`
- Use `import type` for type-only imports
- Extend native HTML attributes via `Omit<ComponentPropsWithoutRef<'element'>, ...>` and spread `...rest`
- Every component accepts `className` and merges via `x-class={[baseClass, className]}`
- Styling uses Linaria `css` tagged templates; variants as plain objects mapping names to Linaria classes
- `x-class` and `x-if` are JSX extensions from babel-plugin-transform-jsx-class / babel-plugin-transform-jsx-condition

## Testing

- Vitest with jsdom environment, globals enabled (no need to import `describe`/`it`/`expect`)
- @testing-library/react + @testing-library/user-event for rendering and interaction
- @testing-library/jest-dom/vitest for DOM assertions
- CSS processing disabled in tests (`css: false`)
- Coverage excludes: test files, barrel indexes, tokens, `.d.ts`

## Path Alias

`@/` maps to `src/` (configured in tsconfig and vite).
