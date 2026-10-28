import type { Column, RowData } from '@tanstack/react-table';

import { css } from '@linaria/core';

import { dataTableFeatures } from './features';

/*
 * Constants, pure helpers and the shared chrome classes of the DataTable
 * render split (data-table-header.tsx / data-table-rows.tsx /
 * use-cell-navigation.ts): the fixed-column model, the selection-column
 * sizing and the sticky/fixed cell classes every body section applies.
 * Extracted verbatim from DataTable.tsx — the equal-specificity ordering
 * couples (fixedCell → fixedCellSelected → fixedHeadCell, and stickyHead's
 * `th` rule tying fixedHeadCell's `thead &` form) move together, so the
 * cascade is unchanged wherever these classes meet.
 */

/** Sticky-column presentation resolved for one rendered cell: which edge,
 * the CSS length to offset it by, and whether this is the innermost column
 * of a pinned run (the one carrying the scroll-hint shadow). */
export type FixedCellSpec = {
  side: 'left' | 'right';
  offset: string;
  edge: boolean;
};

/** Sums CSS length fragments into a single length expression. Fragments are
 * plain lengths (`'120px'`) or parenthesized expressions (the selection
 * column's token math), so anything non-trivial is wrapped in `calc()`. */
export function sumLengths(parts: string[]): string {
  if (parts.length === 0) return '0px';
  const [first] = parts;
  if (parts.length === 1 && first !== undefined && !first.includes('(')) {
    return first;
  }
  return `calc(${parts.join(' + ')})`;
}

/** Inline style carrying a fixed cell's sticky edge offset; the position,
 * background and z-index come from the fixed-cell classes. */
export function fixedOffsetStyle(spec: FixedCellSpec | undefined) {
  return spec
    ? {
        left: spec.side === 'left' ? spec.offset : undefined,
        right: spec.side === 'right' ? spec.offset : undefined,
      }
    : undefined;
}

/** Selection column width wherever a colgroup owns it: 2 × `--haze-space-3`
 * cell padding + one checkbox (`--haze-space-5`). The `calc` form keeps
 * token overrides live; the parenthesized twin is the fragment summed into
 * fixed-column offsets. */
export const SELECTION_COL_WIDTH =
  'calc(var(--haze-space-3) * 2 + var(--haze-space-5))';
export const SELECTION_WIDTH_PART =
  '(var(--haze-space-3) * 2 + var(--haze-space-5))';

/** Pseudo column id of the selection column inside the navigation model —
 * a string no accessor column can produce (ids derive from accessor keys). */
export const SELECTION_NAV_ID = '__selection__';

/** Human label for a column in generated UI (resize handles, filter inputs,
 * the visibility menu): the header string when one was given, else the
 * column id. */
export function columnLabel<TData extends RowData>(
  column: Column<typeof dataTableFeatures, TData>
): string {
  const header = column.columnDef.header;
  return typeof header === 'string' ? header : column.id;
}

const stickyHead = css`
  & th {
    position: sticky;
    top: 0;
    /* Above sticky fixed-column body cells (--haze-z-local-1): at equal
     * z-indexes the later-in-DOM body cells would paint over the header row. */
    z-index: var(--haze-z-local-2);
    background: var(--haze-color-bg);
    box-shadow: var(--haze-shadow-sm);
  }
`;

/* Selection column without a colgroup (normal mode, no declared widths):
 * the `width: 1%` shrink-to-fit trick under auto layout. */
const checkCell = css`
  width: 1%;
  white-space: nowrap;
`;

/* Selection column under a colgroup — always in virtual mode, and in normal
 * mode once any column declares a width. The `<col>` owns the sizing
 * (`SELECTION_COL_WIDTH`), the cell keeps only `nowrap`. */
const checkCellCol = css`
  white-space: nowrap;
`;

/* Sticky fixed columns (normal mode). Opaque background so scrolled cells
 * slide beneath. The row hover/selected backgrounds live on the `tr` and
 * would be covered by the cell's own background, so they are re-created on
 * the cell itself. */
const fixedCell = css`
  position: sticky;
  z-index: var(--haze-z-local-1);
  background: var(--haze-color-bg);

  tr:hover & {
    background: var(--haze-color-bg-subtle);
  }
`;

/* Selected-row background for fixed cells — defined after `fixedCell` and
 * at equal-or-higher specificity (plus the `:hover` form), so it wins over
 * the plain and hovered backgrounds above. */
const fixedCellSelected = css`
  tr &,
  tr:hover & {
    background: var(--haze-color-primary-subtle);
  }
`;

/* A fixed cell inside a sticky header is the scroll corner — it must
 * outrank both the header row (--haze-z-local-2) and fixed body cells
 * (--haze-z-local-1). A bare class would lose to `.stickyHead th`'s
 * class+type specificity, so the `thead &` form ties it and wins by later
 * definition — the `fixedCellSelected` order precedent below. */
const fixedHeadCell = css`
  thead & {
    z-index: var(--haze-z-local-3);
  }
`;

/* Scroll-hint shadow on the inner edge of the outermost pinned column;
 * `clip-path` confines it to that edge. Body cells only — the header row's
 * own shadow must not be replaced. */
const fixedLeftEdge = css`
  clip-path: inset(0 -8px 0 0);
  box-shadow: 6px 0 8px -6px var(--haze-color-border);
`;

const fixedRightEdge = css`
  clip-path: inset(0 0 0 -8px);
  box-shadow: -6px 0 8px -6px var(--haze-color-border);
`;

export {
  checkCell,
  checkCellCol,
  fixedCell,
  fixedCellSelected,
  fixedHeadCell,
  fixedLeftEdge,
  fixedRightEdge,
  stickyHead,
};
