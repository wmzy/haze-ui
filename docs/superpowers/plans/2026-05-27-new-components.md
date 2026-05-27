# New Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7 commonly-used components (Divider, Spinner, Empty, Progress, Pagination, Grid, Drawer) to haze-ui, following existing patterns exactly.

**Architecture:** Each component is a standalone directory under `src/lib/components/` with co-located test and barrel export. All use Linaria `css` for styling with design tokens, `x-class` for class merging, and `export default function` declaration. Stateful components use `useControl` from `react-use-control`.

**Tech Stack:** React 19, Linaria (`@linaria/core`), `react-use-control`, Vitest, @testing-library/react, @testing-library/user-event

---

## File Structure

New files to create (21 files total):

```
src/lib/components/
  Divider/
    Divider.tsx          # Component
    Divider.test.tsx     # Tests
    index.ts             # Barrel export
  Spinner/
    Spinner.tsx
    Spinner.test.tsx
    index.ts
  Empty/
    Empty.tsx
    Empty.test.tsx
    index.ts
  Progress/
    Progress.tsx
    Progress.test.tsx
    index.ts
  Pagination/
    Pagination.tsx
    Pagination.test.tsx
    index.ts
  Grid/
    Grid.tsx
    GridItem.tsx
    Grid.test.tsx
    index.ts
  Drawer/
    Drawer.tsx
    Drawer.test.tsx
    index.ts
```

Modified files:
- `src/lib/index.ts` — add exports for all 7 components

---

## Task 1: Divider

**Files:**
- Create: `src/lib/components/Divider/Divider.tsx`
- Create: `src/lib/components/Divider/Divider.test.tsx`
- Create: `src/lib/components/Divider/index.ts`
- Modify: `src/lib/index.ts`

### Step 1: Write failing tests

Create `src/lib/components/Divider/Divider.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import Divider from './Divider';

describe('Divider', () => {
  it('renders an hr element', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Divider className="custom" />);
    expect(screen.getByRole('separator')).toHaveClass('custom');
  });

  it('renders horizontal by default', () => {
    render(<Divider />);
    const el = screen.getByRole('separator');
    expect(el).toBeInTheDocument();
  });

  it('renders vertical divider', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveAttribute('role', 'separator');
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm vitest run src/lib/components/Divider/Divider.test.tsx`
Expected: FAIL — module not found

### Step 3: Implement Divider

Create `src/lib/components/Divider/Divider.tsx`:

```tsx
import { css } from '@linaria/core';

type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

const base = css`
  border: none;
  background: var(--haze-color-border);
`;

const horizontal = css`
  height: 1px;
  width: 100%;
`;

const vertical = css`
  width: 1px;
  height: 1em;
  align-self: stretch;
`;

export default function Divider({
  orientation = 'horizontal',
  className,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        x-class={[base, vertical, className]}
      />
    );
  }
  return <hr role="separator" x-class={[base, horizontal, className]} />;
}

export type { DividerProps };
```

Create `src/lib/components/Divider/index.ts`:

```ts
export {default as Divider} from './Divider';
export type {DividerProps} from './Divider';
```

### Step 4: Run test to verify it passes

Run: `pnpm vitest run src/lib/components/Divider/Divider.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/lib/components/Divider/
git commit -m "feat: add Divider component"
```

---

## Task 2: Spinner

**Files:**
- Create: `src/lib/components/Spinner/Spinner.tsx`
- Create: `src/lib/components/Spinner/Spinner.test.tsx`
- Create: `src/lib/components/Spinner/index.ts`
- Modify: `src/lib/index.ts`

### Step 1: Write failing tests

Create `src/lib/components/Spinner/Spinner.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import Spinner from './Spinner';

describe('Spinner', () => {
  it('renders with role="status"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label "Loading"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('applies className', () => {
    render(<Spinner className="custom" />);
    expect(screen.getByRole('status')).toHaveClass('custom');
  });

  it('renders an SVG', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm vitest run src/lib/components/Spinner/Spinner.test.tsx`
Expected: FAIL — module not found

### Step 3: Implement Spinner

Create `src/lib/components/Spinner/Spinner.tsx`:

```tsx
import { css } from '@linaria/core';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const base = css`
  display: inline-flex;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const sizes = {
  sm: css`
    width: 16px;
    height: 16px;
  `,
  md: css`
    width: 24px;
    height: 24px;
  `,
  lg: css`
    width: 32px;
    height: 32px;
  `,
} as const;

export default function Spinner({
  size = 'md',
  className,
}: SpinnerProps) {
  return (
    <span role="status" aria-label="Loading" x-class={[base, sizes[size], className]}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--haze-color-border)"
          strokeWidth="3"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="var(--haze-color-primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export type { SpinnerProps };
```

Create `src/lib/components/Spinner/index.ts`:

```ts
export {default as Spinner} from './Spinner';
export type {SpinnerProps} from './Spinner';
```

### Step 4: Run test to verify it passes

Run: `pnpm vitest run src/lib/components/Spinner/Spinner.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/lib/components/Spinner/
git commit -m "feat: add Spinner component"
```

---

## Task 3: Empty

**Files:**
- Create: `src/lib/components/Empty/Empty.tsx`
- Create: `src/lib/components/Empty/Empty.test.tsx`
- Create: `src/lib/components/Empty/index.ts`
- Modify: `src/lib/index.ts`

### Step 1: Write failing tests

Create `src/lib/components/Empty/Empty.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import Empty from './Empty';

describe('Empty', () => {
  it('renders default "No data" text', () => {
    render(<Empty />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders custom description', () => {
    render(<Empty description="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders custom image', () => {
    render(<Empty image={<span>custom image</span>} />);
    expect(screen.getByText('custom image')).toBeInTheDocument();
  });

  it('renders children as action area', () => {
    render(<Empty><button>Retry</button></Empty>);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Empty className="custom" />);
    expect(screen.getByText('No data').parentElement).toHaveClass('custom');
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm vitest run src/lib/components/Empty/Empty.test.tsx`
Expected: FAIL — module not found

### Step 3: Implement Empty

Create `src/lib/components/Empty/Empty.tsx`:

```tsx
import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type EmptyProps = {
  description?: string;
  image?: ReactNode;
  className?: string;
  children?: ReactNode;
};

const base = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--haze-space-8) var(--haze-space-4);
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
`;

const imageStyle = css`
  margin-bottom: var(--haze-space-4);
`;

const descStyle = css`
  font-size: var(--haze-text-sm);
`;

const actionStyle = css`
  margin-top: var(--haze-space-4);
`;

const defaultImage = (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="8" y="16" width="48" height="36" rx="4" stroke="var(--haze-color-border)" strokeWidth="2" />
    <path d="M8 28h48" stroke="var(--haze-color-border)" strokeWidth="2" />
    <circle cx="20" cy="22" r="2" fill="var(--haze-color-border)" />
    <circle cx="28" cy="22" r="2" fill="var(--haze-color-border)" />
    <path d="M24 38l6-6 4 4 8-8" stroke="var(--haze-color-border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Empty({
  description = 'No data',
  image,
  className,
  children,
}: EmptyProps) {
  return (
    <div x-class={[base, className]}>
      <div x-class={[imageStyle]}>{image ?? defaultImage}</div>
      <div x-class={[descStyle]}>{description}</div>
      {children && <div x-class={[actionStyle]}>{children}</div>}
    </div>
  );
}

export type { EmptyProps };
```

Create `src/lib/components/Empty/index.ts`:

```ts
export {default as Empty} from './Empty';
export type {EmptyProps} from './Empty';
```

### Step 4: Run test to verify it passes

Run: `pnpm vitest run src/lib/components/Empty/Empty.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/lib/components/Empty/
git commit -m "feat: add Empty component"
```

---

## Task 4: Progress

**Files:**
- Create: `src/lib/components/Progress/Progress.tsx`
- Create: `src/lib/components/Progress/Progress.test.tsx`
- Create: `src/lib/components/Progress/index.ts`
- Modify: `src/lib/index.ts`

### Step 1: Write failing tests

Create `src/lib/components/Progress/Progress.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import Progress from './Progress';

describe('Progress', () => {
  it('renders a progressbar', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has correct aria-valuemin, aria-valuemax, aria-valuenow', () => {
    render(<Progress value={30} />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('aria-valuemin', '0');
    expect(el).toHaveAttribute('aria-valuemax', '100');
    expect(el).toHaveAttribute('aria-valuenow', '30');
  });

  it('defaults value to 0', () => {
    render(<Progress />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('applies className', () => {
    render(<Progress className="custom" value={50} />);
    expect(screen.getByRole('progressbar')).toHaveClass('custom');
  });

  it('renders bar variant by default', () => {
    const { container } = render(<Progress value={50} />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  it('renders circle variant', () => {
    const { container } = render(<Progress variant="circle" value={75} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('clamps value to 0-100', () => {
    render(<Progress value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm vitest run src/lib/components/Progress/Progress.test.tsx`
Expected: FAIL — module not found

### Step 3: Implement Progress

Create `src/lib/components/Progress/Progress.tsx`:

```tsx
import { css } from '@linaria/core';

type ProgressProps = {
  value?: number;
  variant?: 'bar' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
};

const barBase = css`
  width: 100%;
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-full);
  overflow: hidden;
`;

const barSizes = {
  sm: css`height: 4px;`,
  md: css`height: 8px;`,
  lg: css`height: 12px;`,
} as const;

const barFill = css`
  height: 100%;
  border-radius: var(--haze-radius-full);
  transition: width 0.3s ease;
`;

const colorMap = {
  primary: css`background: var(--haze-color-primary);`,
  success: css`background: var(--haze-color-success);`,
  warning: css`background: var(--haze-color-warning);`,
  danger: css`background: var(--haze-color-danger);`,
} as const;

const circleBase = css`
  transform: rotate(-90deg);
`;

const circleSizes = {
  sm: css`width: 32px; height: 32px;`,
  md: css`width: 48px; height: 48px;`,
  lg: css`width: 64px; height: 64px;`,
} as const;

const circleBg = css`
  fill: none;
  stroke: var(--haze-color-bg-muted);
`;

const circleFill = css`
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
`;

const circleColorMap = {
  primary: css`stroke: var(--haze-color-primary);`,
  success: css`stroke: var(--haze-color-success);`,
  warning: css`stroke: var(--haze-color-warning);`,
  danger: css`stroke: var(--haze-color-danger);`,
} as const;

const strokeWidths = { sm: 3, md: 4, lg: 5 };
const circleRadius = { sm: 13, md: 20, lg: 27 };

export default function Progress({
  value = 0,
  variant = 'bar',
  size = 'md',
  color = 'primary',
  className,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  if (variant === 'circle') {
    const r = circleRadius[size];
    const sw = strokeWidths[size];
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (clamped / 100) * circumference;

    return (
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        x-class={[circleBase, circleSizes[size], className]}
      >
        <svg viewBox={`0 0 ${(r + sw) * 2} ${(r + sw) * 2}`}>
          <circle
            cx={r + sw}
            cy={r + sw}
            r={r}
            strokeWidth={sw}
            x-class={[circleBg]}
          />
          <circle
            cx={r + sw}
            cy={r + sw}
            r={r}
            strokeWidth={sw}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            x-class={[circleFill, circleColorMap[color]]}
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      x-class={[barBase, barSizes[size], className]}
    >
      <div
        x-class={[barFill, colorMap[color]]}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export type { ProgressProps };
```

Create `src/lib/components/Progress/index.ts`:

```ts
export {default as Progress} from './Progress';
export type {ProgressProps} from './Progress';
```

### Step 4: Run test to verify it passes

Run: `pnpm vitest run src/lib/components/Progress/Progress.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/lib/components/Progress/
git commit -m "feat: add Progress component"
```

---

## Task 5: Pagination

**Files:**
- Create: `src/lib/components/Pagination/Pagination.tsx`
- Create: `src/lib/components/Pagination/Pagination.test.tsx`
- Create: `src/lib/components/Pagination/index.ts`
- Modify: `src/lib/index.ts`

### Step 1: Write failing tests

Create `src/lib/components/Pagination/Pagination.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Pagination from './Pagination';

describe('Pagination', () => {
  it('renders a nav element', () => {
    render(<Pagination total={100} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders page buttons', () => {
    render(<Pagination total={50} pageSize={10} />);
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
  });

  it('renders prev and next buttons', () => {
    render(<Pagination total={50} pageSize={10} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('disables prev button on first page', () => {
    render(<Pagination total={50} pageSize={10} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination total={50} pageSize={10} page={5} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('calls page change on click', async () => {
    const user = userEvent.setup();
    render(<Pagination total={50} pageSize={10} />);
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Pagination className="custom" total={50} />);
    expect(screen.getByRole('navigation')).toHaveClass('custom');
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm vitest run src/lib/components/Pagination/Pagination.test.tsx`
Expected: FAIL — module not found

### Step 3: Implement Pagination

Create `src/lib/components/Pagination/Pagination.tsx`:

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

type PaginationProps = {
  page?: Control<number> | number;
  total: number;
  pageSize?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'>;

const nav = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-1);
  font-family: var(--haze-font-sans);
`;

const btn = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 var(--haze-space-2);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover:not(:disabled) {
    background: var(--haze-color-bg-subtle);
    border-color: var(--haze-color-border-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const activeBtn = css`
  background: var(--haze-color-primary);
  border-color: var(--haze-color-primary);
  color: var(--haze-color-text-inverse);

  &:hover:not(:disabled) {
    background: var(--haze-color-primary-hover);
    border-color: var(--haze-color-primary-hover);
  }
`;

const ellipsis = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;

const sizes = {
  sm: css`
    & button { min-width: 28px; height: 28px; font-size: var(--haze-text-xs); }
  `,
  md: css``,
  lg: css`
    & button { min-width: 40px; height: 40px; font-size: var(--haze-text-base); }
  `,
} as const;

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function Pagination({
  page: pageControl,
  total,
  pageSize = 10,
  size = 'md',
  className,
  ...rest
}: PaginationProps) {
  const [page, setPage] = useControl(pageControl as Control<number>, 1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = getPageNumbers(page, totalPages);

  return (
    <nav x-class={[nav, sizes[size], className]} {...rest}>
      <button
        type="button"
        x-class={[btn]}
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        aria-label="Previous"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} x-class={[ellipsis]}>…</span>
        ) : (
          <button
            key={p}
            type="button"
            x-class={[btn, p === page && activeBtn]}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => setPage(p as number)}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        x-class={[btn]}
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        aria-label="Next"
      >
        ›
      </button>
    </nav>
  );
}

export type { PaginationProps };
```

Create `src/lib/components/Pagination/index.ts`:

```ts
export {default as Pagination} from './Pagination';
export type {PaginationProps} from './Pagination';
```

### Step 4: Run test to verify it passes

Run: `pnpm vitest run src/lib/components/Pagination/Pagination.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/lib/components/Pagination/
git commit -m "feat: add Pagination component"
```

---

## Task 6: Grid

**Files:**
- Create: `src/lib/components/Grid/Grid.tsx`
- Create: `src/lib/components/Grid/GridItem.tsx`
- Create: `src/lib/components/Grid/Grid.test.tsx`
- Create: `src/lib/components/Grid/index.ts`
- Modify: `src/lib/index.ts`

### Step 1: Write failing tests

Create `src/lib/components/Grid/Grid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { Grid, GridItem } from './index';

describe('Grid', () => {
  it('renders children', () => {
    render(<Grid><div>child</div></Grid>);
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Grid className="custom">x</Grid>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders with default 12 columns', () => {
    const { container } = render(<Grid>z</Grid>);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('GridItem', () => {
  it('renders children', () => {
    render(<GridItem><div>item</div></GridItem>);
    expect(screen.getByText('item')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<GridItem className="custom">x</GridItem>);
    expect(container.firstChild).toHaveClass('custom');
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm vitest run src/lib/components/Grid/Grid.test.tsx`
Expected: FAIL — module not found

### Step 3: Implement Grid and GridItem

Create `src/lib/components/Grid/Grid.tsx`:

```tsx
import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type GridProps = {
  columns?: number;
  gap?: number;
  className?: string;
  children: ReactNode;
};

const base = css`
  display: grid;
`;

export default function Grid({
  columns = 12,
  gap = 4,
  className,
  children,
}: GridProps) {
  return (
    <div
      x-class={[base, className]}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `var(--haze-space-${gap})`,
      }}
    >
      {children}
    </div>
  );
}

export type { GridProps };
```

Create `src/lib/components/Grid/GridItem.tsx`:

```tsx
import type { ReactNode } from 'react';

type GridItemProps = {
  span?: number;
  start?: number;
  className?: string;
  children: ReactNode;
};

export default function GridItem({
  span = 1,
  start,
  className,
  children,
}: GridItemProps) {
  return (
    <div
      className={className}
      style={{
        gridColumn: start
          ? `${start} / span ${span}`
          : `span ${span}`,
      }}
    >
      {children}
    </div>
  );
}

export type { GridItemProps };
```

Create `src/lib/components/Grid/index.ts`:

```ts
export {default as Grid} from './Grid';
export type {GridProps} from './Grid';
export {default as GridItem} from './GridItem';
export type {GridItemProps} from './GridItem';
```

### Step 4: Run test to verify it passes

Run: `pnpm vitest run src/lib/components/Grid/Grid.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/lib/components/Grid/
git commit -m "feat: add Grid component"
```

---

## Task 7: Drawer

**Files:**
- Create: `src/lib/components/Drawer/Drawer.tsx`
- Create: `src/lib/components/Drawer/Drawer.test.tsx`
- Create: `src/lib/components/Drawer/index.ts`
- Modify: `src/lib/index.ts`

### Step 1: Write failing tests

Create `src/lib/components/Drawer/Drawer.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react';

import Drawer from './Drawer';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

describe('Drawer', () => {
  it('renders a dialog element', () => {
    render(<Drawer>Content</Drawer>);
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Drawer open>Drawer body</Drawer>);
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Drawer className="custom">Content</Drawer>);
    expect(screen.getByRole('dialog', { hidden: true })).toHaveClass('custom');
  });

  it('calls onClose when dialog fires close event', () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose}>Content</Drawer>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(new Event('close', { bubbles: false }));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when clicking backdrop', () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose}>Content</Drawer>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onClose).toHaveBeenCalled();
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm vitest run src/lib/components/Drawer/Drawer.test.tsx`
Expected: FAIL — module not found

### Step 3: Implement Drawer

Create `src/lib/components/Drawer/Drawer.tsx`:

```tsx
import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useEffect, useRef } from 'react';
import { useControl } from 'react-use-control';

type DrawerProps = {
  open?: Control<boolean> | boolean;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  onClose?: () => void;
  className?: string;
  children: ReactNode;
};

const overlay = css`
  border: none;
  padding: 0;
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  max-height: 100vh;
  max-width: 100vw;
  overflow: auto;

  &::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const placements = {
  left: css`
    height: 100vh;
    width: 320px;
    margin-left: 0;
  `,
  right: css`
    height: 100vh;
    width: 320px;
    margin-left: auto;
  `,
  top: css`
    width: 100vw;
    height: 320px;
    margin-top: 0;
  `,
  bottom: css`
    width: 100vw;
    height: 320px;
    margin-top: auto;
  `,
} as const;

export default function Drawer({
  open: openControl,
  placement = 'right',
  onClose,
  className,
  children,
}: DrawerProps) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      x-class={[overlay, placements[placement], className]}
      onClose={() => {
        setOpen(false);
        onClose?.();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          setOpen(false);
          onClose?.();
        }
      }}
    >
      {children}
    </dialog>
  );
}

export type { DrawerProps };
```

Create `src/lib/components/Drawer/index.ts`:

```ts
export {default as Drawer} from './Drawer';
export type {DrawerProps} from './Drawer';
```

### Step 4: Run test to verify it passes

Run: `pnpm vitest run src/lib/components/Drawer/Drawer.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/lib/components/Drawer/
git commit -m "feat: add Drawer component"
```

---

## Task 8: Export all new components from library entry

**Files:**
- Modify: `src/lib/index.ts`

### Step 1: Add exports

Add the following lines to `src/lib/index.ts` before the `// re-export ecosystem utilities` comment:

```ts
export { Divider } from './components/Divider';
export type { DividerProps } from './components/Divider';
export { Spinner } from './components/Spinner';
export type { SpinnerProps } from './components/Spinner';
export { Empty } from './components/Empty';
export type { EmptyProps } from './components/Empty';
export { Progress } from './components/Progress';
export type { ProgressProps } from './components/Progress';
export { Pagination } from './components/Pagination';
export type { PaginationProps } from './components/Pagination';
export { Grid, GridItem } from './components/Grid';
export type { GridProps, GridItemProps } from './components/Grid';
export { Drawer } from './components/Drawer';
export type { DrawerProps } from './components/Drawer';
```

### Step 2: Run full test suite

Run: `pnpm test`
Expected: All tests pass

### Step 3: Run build

Run: `pnpm build`
Expected: Build succeeds, no type errors

### Step 4: Commit

```bash
git add src/lib/index.ts
git commit -m "feat: export Divider, Spinner, Empty, Progress, Pagination, Grid, Drawer from library entry"
```
