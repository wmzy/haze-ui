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

- Vitest with jsdom environment, globals enabled (no need to import `describe`/`it`/expect`)
- @testing-library/react + @testing-library/user-event for rendering and interaction
- @testing-library/jest-dom/vitest for DOM assertions
- CSS processing disabled in tests (`css: false`)
- Coverage excludes: test files, barrel indexes, tokens, `.d.ts`

## Path Alias

`@/` maps to `src/` (configured in tsconfig and vite).

---

## Component Authoring Template

New components must follow this exact structure. Use Button or Switch as reference.

### Stateless component (no internal state)

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import { css } from '@linaria/core';

type BadgeProps = {
  variant?: 'solid' | 'outline';
} & Omit<ComponentPropsWithoutRef<'span'>, 'color'>;

const base = css`
  display: inline-flex;
  /* ... use tokens only: var(--haze-*) */
`;

const variants = {
  solid: css`background: var(--haze-color-primary);`,
  outline: css`border: 1px solid var(--haze-color-border);`,
} as const;

export default function Badge({
  variant = 'solid',
  className,
  ...rest
}: BadgeProps) {
  return (
    <span x-class={[base, variants[variant], className]} {...rest} />
  );
}

export type { BadgeProps };
```

### Stateful component (controllable state)

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

type SwitchProps = {
  checked?: Control<boolean> | boolean;
} & Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'checked'>;

// ... css definitions ...

export default function Switch({
  checked: checkedControl,  // rename to avoid collision
  className,
  ...rest
}: SwitchProps) {
  const [checked, setChecked] = useControl(
    checkedControl as Control<boolean>,
    false  // default value for uncontrolled mode
  );

  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      x-class={[base, checked && checkedClass, className]}
      onClick={() => setChecked((prev) => !prev)}
      {...rest}
    />
  );
}

export type { SwitchProps };
```

### Test template

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Component from './Component';

describe('Component', () => {
  it('renders with correct role', () => {
    render(<Component aria-label="test" />);
    expect(screen.getByRole('button', { name: 'test' })).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Component className="custom" aria-label="test" />);
    expect(screen.getByRole('button')).toHaveClass('custom');
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<Component aria-label="test" />);
    await user.click(screen.getByRole('button'));
    // assert state change
  });

  it('forwards native props', () => {
    render(<Component disabled aria-label="test" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## Anti-Patterns

Things that will break the build, break theming, or violate the library's conventions.

### 1. Using useState for controllable state

All user-facing state must go through `useControl`. This is the library's core contract.

```tsx
// WRONG — bypasses controllable pattern
const [open, setOpen] = useState(false);

// CORRECT — accepts external control
type Props = { open?: Control<boolean> | boolean };

function Modal({ open: openControl }: Props) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, false);
}
```

### 2. Hardcoding visual values

Components must use `--haze-*` tokens. No exceptions for "quick" values.

```tsx
// WRONG — breaks theming
css`color: #0066ff;`
css`padding: 8px;`
css`font-size: 14px;`
css`border-radius: 4px;`

// CORRECT
css`color: var(--haze-color-primary);`
css`padding: var(--haze-space-2);`
css`font-size: var(--haze-text-sm);`
css`border-radius: var(--haze-radius-md);`
```

### 3. Using interface or enum

```tsx
// WRONG
interface ButtonProps { variant: string; }
enum Status { Active,Inactive }

// CORRECT
type ButtonProps = { variant: string; }
type Status = 'active' | 'inactive';
```

### 4. Using className directly instead of x-class

```tsx
// WRONG — won't merge Linaria classes correctly
<div className={`${base} ${className}`}>

// CORRECT
<div x-class={[base, className]}>
```

### 5. Omitting ...rest spread on native elements

Components must forward native HTML attributes for accessibility and composability.

```tsx
// WRONG — blocks native props like aria-label, data-*, onClick
export default function Badge({ variant, className }: BadgeProps) {
  return <span x-class={[base, className]} />;
}

// CORRECT — spread remaining props
export default function Badge({ variant, className, ...rest }: BadgeProps) {
  return <span x-class={[base, className]} {...rest} />;
}
```

### 6. Using let or mutable variables

```tsx
// WRONG
let count = 0;
count += 1;

// CORRECT
const count = 0;
const next = count + 1;
```

### 7. Importing useState when you mean useControl

If a component manages state that a parent might want to control, it must use `useControl`. Only use `useState` for purely internal UI state (like hover tracking) that is never exposed as a prop.

---

## Design Decisions

Why certain choices were made. Read before proposing alternatives.

### Why Linaria instead of Tailwind/CSS Modules/styled-components?

**Zero runtime.** Linaria extracts CSS at build time — no JS ships for styling. This keeps the library small and avoids style recalculation overhead. Tailwind would impose its utility class system on consumers. CSS Modules don't integrate well with design token theming. styled-components has runtime cost.

### Why x-class instead of className?

`x-class` (from babel-plugin-transform-jsx-class) handles array merging and conditional classes correctly with Linaria's extracted class names. Direct `className` string concatenation doesn't work reliably with Linaria's hashed class names.

### Why Control<T> | T instead of separate controlled/uncontrolled APIs?

Single prop, two modes. No `defaultXxx` vs `xxx` duplication. `react-use-control` handles the wiring internally — the component just calls `useControl(prop, default)` and gets `[value, setter]`. This is the library's primary differentiator.

### Why co-locate tests with components?

Keeps tests discoverable and close to the code they test. Moving tests to a separate `__tests__/` tree makes it easy to forget them and harder to navigate in editors.

### Why barrel exports (index.ts)?

Single import path for consumers: `import { Button, Switch } from 'haze-ui'`. The barrel re-exports from each component's file. This is a public API contract — don't add internal utilities to barrels.
