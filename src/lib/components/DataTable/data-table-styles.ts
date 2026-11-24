import { css } from '@linaria/core';

/*
 * The structural classes of the DataTable split. The units that apply them
 * (DataTable.tsx, data-table-body.tsx, data-table-chrome.tsx,
 * data-table-summary.tsx, column-settings.tsx) import from here instead of
 * each carrying its own css block: a sibling styles module per the
 * react-refresh boundary convention (Table `table-styles` precedent), and
 * one hashed class prefix instead of one per unit — extra prefixes are the
 * only thing a render split would otherwise add to the css family's size.
 *
 * The consts keep the order of the block they were extracted from. Nothing
 * depends on that order: `summaryFoot` and `stickyFoot` set disjoint
 * properties, and the density steps (`& > tfoot > tr > td`, 0,1,3) outrank
 * the summary footer's cell padding (`& td`, 0,1,1) by specificity. Nor is
 * there a selector here that ties in specificity with a selector of
 * another DataTable module on the same element, so the module's place in
 * the family's alphabetical per-module emission does not matter either.
 */

export const root = css`
  display: flex;
  flex-direction: column;
`;

export const scrollArea = css`
  overflow-x: auto;
`;

/* Bounded by the consumer (height/max-height on the DataTable) — without a
 * bound the area never scrolls and the sticky header simply stays put. */
export const stickyScrollArea = css`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

/* Virtualized body region: the header table above never scrolls vertically,
 * the VirtualList below owns the vertical scrollbar. `scrollbar-gutter`
 * reserves the scrollbar lane next to the header so its fixed-layout
 * columns line up with the rows inside the scroller (auto layout would
 * size each sibling table's columns independently and drift apart). */
export const virtualArea = css`
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-gutter: stable;
`;

/* Shared by the header table and every virtualized row table: `table-layout:
 * fixed` honors the mirrored `<colgroup>` identically in each sibling — the
 * alignment contract between them. */
export const fixedLayout = css`
  table-layout: fixed;
`;

/* Fills the VirtualList wrapper (which carries the exact `rowHeight`), so
 * the default middle vertical alignment of table cells absorbs any slack
 * between content and the fixed row height. */
export const virtualRowTable = css`
  height: 100%;
`;

export const footer = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: var(--haze-space-3);
`;

/* Toolbar strip above the table's inline-end corner: custom actions (the
 * `toolbar` slot) plus, when not paginating, the column-settings trigger.
 * Wrap keeps long toolbars from overflowing narrow tables. */
export const toolbar = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--haze-space-2);
  margin-bottom: var(--haze-space-3);
`;

/* The menu wrapper inside the pagination row: consumes the free space so
 * the trigger pins to the start edge and Pagination keeps the end edge. */
export const footerMenu = css`
  margin-inline-end: auto;
`;

export const columnsTrigger = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  padding: var(--haze-space-1) var(--haze-space-2);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);

  &:hover {
    border-color: var(--haze-color-border-hover);
    background: var(--haze-color-bg-subtle);
  }
`;

/* One visibility toggle row inside the menu. The label element is generic
 * to ARIA ownership, so the checkbox input below carries the
 * `menuitemcheckbox` role the menu requires. */
export const toggleRow = css`
  display: flex;
  align-items: center;
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-sm);
  cursor: pointer;
  font-size: var(--haze-text-sm);

  &:hover {
    background: var(--haze-color-bg-subtle);
  }
`;

/* Zero-footprint sentinel after the body — an IntersectionObserver target
 * only. 1px tall so engines that skip zero-area targets still report it. */
export const endSentinelClass = css`
  height: 1px;
`;

/* Summary footer: mirrors the body cell metrics with a heavier top rule
 * and the header's text weight. */
export const summaryFoot = css`
  & td {
    padding: var(--haze-space-2) var(--haze-space-3);
    border-top: 2px solid var(--haze-color-border);
    color: var(--haze-color-text);
    font-weight: var(--haze-weight-semibold);
    white-space: nowrap;
  }
`;

/* Sticky summary footer: cells stick to the bottom of the scroll area,
 * mirroring the sticky header's elevation and stacking. */
export const stickyFoot = css`
  & td {
    position: sticky;
    bottom: 0;
    z-index: var(--haze-z-local-2);
    background: var(--haze-color-bg);
    box-shadow: var(--haze-shadow-sm);
  }
`;

/* Density steps, applied on every rendered table (header, body/row and
 * summary tables alike). The child-combinator chain outranks the Table
 * primitives' own cell padding regardless of per-component css emission
 * order, the :not()s keep the expansion panel and empty-state cells'
 * own padding, and spacing tokens (not literals) keep the global compact
 * density class composing — compact shrinks the tokens these rules read,
 * so compact and size stack instead of colliding. md is the Table
 * primitives' own padding — no class, no override. */
export const sizeSm = css`
  & > thead > tr > th,
  & > tbody > tr > td:not([data-slot='panel-cell']):not([data-slot='empty-cell']),
  & > tfoot > tr > td {
    padding: var(--haze-space-1) var(--haze-space-2);
  }
`;

export const sizeLg = css`
  & > thead > tr > th,
  & > tbody > tr > td:not([data-slot='panel-cell']):not([data-slot='empty-cell']),
  & > tfoot > tr > td {
    padding: var(--haze-space-3) var(--haze-space-4);
  }
`;
