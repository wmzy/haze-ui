# New Components Design Spec

**Date:** 2026-05-27
**Status:** Approved
**Scope:** 7 new components for haze-ui component library

## Goal

Add commonly-used components found in popular React UI libraries (MUI, Ant Design, Mantine, shadcn/ui, Chakra UI) that are currently missing from haze-ui.

## Components

All components strictly follow haze-ui conventions:
- `export default function ComponentName`
- Linaria `css` tagged templates, token variables only (no hardcoded values)
- `x-class` for class application, `className` as last array element
- `type` not `interface`, `import type` for type-only imports
- Co-located tests with `@testing-library/react` + `userEvent`
- Barrel export via `index.ts`

### 1. Pagination

**Files:** `Pagination/Pagination.tsx`, `Pagination/Pagination.test.tsx`, `Pagination/index.ts`

**Props:**
- `page?: Control<number> | number` — current page, controllable via `useControl`
- `total: number` — total items
- `pageSize?: number` — items per page (default: 10)
- `size?: 'sm' | 'md' | 'lg'` (default: 'md')
- `className?: string`
- Extends `Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'>`

**Behavior:**
- Calculates total pages from `total / pageSize`
- Renders: prev button, page numbers (with ellipsis for large counts), next button
- Disables prev/next at boundaries
- Root element: `<nav>`

### 2. Progress

**Files:** `Progress/Progress.tsx`, `Progress/Progress.test.tsx`, `Progress/index.ts`

**Props:**
- `value?: number` — progress percentage 0-100 (default: 0)
- `variant?: 'bar' | 'circle'` (default: 'bar')
- `size?: 'sm' | 'md' | 'lg'` (default: 'md')
- `color?: 'primary' | 'success' | 'warning' | 'danger'` (default: 'primary')
- `className?: string`
- Standalone props, no HTML extension

**Behavior:**
- `bar` variant: outer div + inner div with width percentage
- `circle` variant: SVG with `stroke-dasharray` / `stroke-dashoffset`
- Root element: `<div>`

### 3. Spinner

**Files:** `Spinner/Spinner.tsx`, `Spinner/Spinner.test.tsx`, `Spinner/index.ts`

**Props:**
- `size?: 'sm' | 'md' | 'lg'` (default: 'md')
- `className?: string`
- Standalone props

**Behavior:**
- SVG circle with rotating animation via Linaria `@keyframes`
- Root element: `<span>`
- `role="status"`, `aria-label="Loading"`

### 4. Drawer

**Files:** `Drawer/Drawer.tsx`, `Drawer/Drawer.test.tsx`, `Drawer/index.ts`

**Props:**
- `open?: Control<boolean> | boolean` — controllable via `useControl`
- `placement?: 'left' | 'right' | 'top' | 'bottom'` (default: 'right')
- `onClose?: () => void`
- `className?: string`
- `children: ReactNode`
- Standalone props

**Behavior:**
- Uses `<dialog>` element (same pattern as Dialog component)
- Backdrop click calls `onClose`
- Slide-in animation from placement direction
- Root element: `<dialog>`

### 5. Grid

**Files:**
- `Grid/Grid.tsx`
- `Grid/GridItem.tsx`
- `Grid/Grid.test.tsx`
- `Grid/index.ts`

**Props (Grid):**
- `columns?: number` — grid columns (default: 12)
- `gap?: number` — gap in space tokens (default: 4)
- `className?: string`
- `children: ReactNode`
- Standalone props

**Props (GridItem):**
- `span?: number` — column span (default: 1)
- `start?: number` — grid-column-start
- `className?: string`
- `children: ReactNode`
- Standalone props

**Behavior:**
- CSS Grid implementation
- Root element: `<div>`

### 6. Divider

**Files:** `Divider/Divider.tsx`, `Divider/Divider.test.tsx`, `Divider/index.ts`

**Props:**
- `orientation?: 'horizontal' | 'vertical'` (default: 'horizontal')
- `className?: string`
- Standalone props

**Behavior:**
- Horizontal: `<hr>` with full-width border-bottom
- Vertical: `<div>` with border-left, fixed height
- Root element: `<hr>` (horizontal) or `<div>` (vertical)

### 7. Empty

**Files:** `Empty/Empty.tsx`, `Empty/Empty.test.tsx`, `Empty/index.ts`

**Props:**
- `description?: string` — empty state text (default: 'No data')
- `image?: ReactNode` — custom illustration
- `className?: string`
- `children?: ReactNode` — optional action area
- Standalone props

**Behavior:**
- Default: built-in SVG illustration + description text
- Custom `image` prop overrides default SVG
- `children` rendered below as action area
- Root element: `<div>`

## Implementation Order

1. Divider (simplest, no dependencies)
2. Spinner (simple, standalone)
3. Empty (simple, standalone)
4. Progress (medium, variant system)
5. Pagination (medium, stateful with useControl)
6. Grid (medium, compound component with GridItem)
7. Drawer (complex, dialog pattern with useControl)

## Testing

Each component test covers:
1. Renders correctly
2. Applies className
3. Forwards native attributes
4. Component-specific behavior (variants, state changes, interactions)
5. Accessibility attributes (role, aria-label)

## Exports

Each component added to `src/lib/index.ts` with named component export and type export.
