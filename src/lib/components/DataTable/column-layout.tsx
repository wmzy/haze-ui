import type { ReactNode } from 'react';
import type { Header, ReactTable, RowData } from '@tanstack/react-table';

import type { FixedCellSpec } from './data-table-shared';
import type { DataTableColumnMeta } from './features';

import { dataTableFeatures } from './features';
import {
  checkCell,
  checkCellCol,
  SELECTION_COL_WIDTH,
  SELECTION_WIDTH_PART,
  sumLengths,
} from './data-table-shared';

/** Resolves a column def's effective width: `meta.width` wins, then the
 * native TanStack `size` as a px fallback. Returns a CSS length string, or
 * undefined when neither is declared. Read off the resolved column def —
 * the sizing feature's `size: 150` default is neutralized through the
 * `defaultColumn` option, so "unspecified" stays distinguishable. */
function columnWidthCss(def: {
  meta?: DataTableColumnMeta;
  size?: number;
}): string | undefined {
  const width = def.meta?.width ?? def.size;
  return typeof width === 'number' ? `${width}px` : width;
}

/** The column layout of one commit — what the header, the body rows and
 * the scroll region render from. */
type ColumnLayout<TData extends RowData> = {
  /** The `<colgroup>` — the selection column plus every leaf column's
   *  width — or `undefined` when no width is declared and nothing needs
   *  one. */
  colgroup: ReactNode;
  /** Selection-cell class: `checkCell` without a colgroup, the `nowrap`
   *  twin wherever one owns the width. */
  checkCellStyle: string;
  /** Sticky spec of the selection cell — pinned only in normal mode, and
   *  only while leading fixed columns exist. */
  selectionFixedSpec: FixedCellSpec | undefined;
  /** Sticky specs of the fixed leaf columns keyed by column id — empty
   *  while virtualized. */
  fixedById: Map<string, FixedCellSpec>;
  /** Keyboard nudge for one resize handle: ±px off the committed size (or
   *  the resolved current one), clamped to the column's min/max size. */
  nudgeColumnSize: (
    header: Header<typeof dataTableFeatures, TData>,
    delta: number
  ) => void;
};

/**
 * ── Column layout ─────────────────────────────────────────────────────
 * Resolves what ties the columns of one commit together: the per-column
 * widths (a committed resize wins, then `meta.width`, then the native
 * `size`) and the `<colgroup>` built from them, the fixed-column sticky
 * offsets and the keyboard nudge of the resize handles.
 */
export function resolveColumnLayout<TData extends RowData>({
  table,
  leafHeaders,
  selectable,
  resizable,
  virtual,
}: {
  table: ReactTable<typeof dataTableFeatures, TData>;
  /** Leaf headers in their current order. */
  leafHeaders: Header<typeof dataTableFeatures, TData>[];
  selectable: boolean;
  resizable: boolean;
  /** Virtualized mode: rows are separate sibling tables — the colgroup
   *  is always emitted and fixed columns are off. */
  virtual: boolean;
}): ColumnLayout<TData> {
  const columnSizing = table.state.columnSizing;

  // Per-column widths: a committed resize wins, then `meta.width`, then the
  // native `size`. In normal mode a colgroup is only emitted once some
  // column declares a width (or resizing is on, so a resized `<col>` has a
  // home) — without one the rendering stays exactly as before; virtualized
  // mode always emits it, since the mirrored col sequence is how the header
  // table and the per-row sibling tables stay aligned.
  const leafWidths = leafHeaders.map((header) => {
    const resized = columnSizing[header.column.id];
    if (resized !== undefined) return `${resized}px`;
    return columnWidthCss(header.column.columnDef);
  });
  const hasColumnWidths = leafWidths.some((width) => width !== undefined);

  // Keyboard nudge for one resize handle: ±5px off the committed size (or
  // the resolved current one), clamped to the column's min/max size.
  const nudgeColumnSize = (
    header: Header<typeof dataTableFeatures, TData>,
    delta: number
  ) => {
    const def = header.column.columnDef;
    const min = def.minSize ?? 20;
    const max = def.maxSize ?? Number.MAX_SAFE_INTEGER;
    const current = columnSizing[header.column.id] ?? header.column.getSize();
    const next = Math.min(Math.max(Math.round(current + delta), min), max);
    table.setColumnSizing((old) => ({ ...old, [header.column.id]: next }));
  };

  // Fixed columns are a normal-mode feature; virtualized rows are separate
  // sibling tables with no shared horizontal scrollport to stick against.
  const leafFixed = leafHeaders.map(
    (header) => header.column.columnDef.meta?.fixed
  );
  const selectionFixedSpec: FixedCellSpec | undefined =
    !virtual && selectable && leafFixed.some((side) => side === 'left')
      ? { side: 'left', offset: '0px', edge: leafFixed[0] !== 'left' }
      : undefined;
  const fixedById = new Map<string, FixedCellSpec>();
  if (!virtual) {
    // Sticky offsets accumulate the widths of the preceding fixed columns
    // on the same side (the selection column seeds the left run). Pin
    // contiguous runs: a non-fixed column between pinned ones scrolls
    // under the block they form at the edge.
    const leftParts: string[] = selectionFixedSpec
      ? [SELECTION_WIDTH_PART]
      : [];
    leafHeaders.forEach((header, index) => {
      if (leafFixed[index] !== 'left') return;
      fixedById.set(header.column.id, {
        side: 'left',
        offset: sumLengths(leftParts),
        edge: leafFixed[index + 1] !== 'left',
      });
      const width = leafWidths[index];
      if (width) leftParts.push(width);
    });
    const rightParts: string[] = [];
    for (let index = leafHeaders.length - 1; index >= 0; index -= 1) {
      const header = leafHeaders[index];
      if (!header || leafFixed[index] !== 'right') continue;
      fixedById.set(header.column.id, {
        side: 'right',
        offset: sumLengths(rightParts),
        edge: leafFixed[index - 1] !== 'right',
      });
      const width = leafWidths[index];
      if (width) rightParts.push(width);
    }
  }

  const colgroup =
    virtual || hasColumnWidths || resizable ? (
      <colgroup data-slot="colgroup">
        {selectable && (
          <col data-slot="col" style={{ width: SELECTION_COL_WIDTH }} />
        )}
        {leafHeaders.map((header, index) => (
          <col
            key={header.id}
            data-slot="col"
            style={
              leafWidths[index] ? { width: leafWidths[index] } : undefined
            }
          />
        ))}
      </colgroup>
    ) : undefined;

  // The selection cell keeps only `nowrap` wherever a colgroup owns its
  // width; otherwise the 1% shrink-to-fit trick sizes it under auto layout.
  const checkCellStyle =
    virtual || hasColumnWidths || resizable ? checkCellCol : checkCell;

  return {
    colgroup,
    checkCellStyle,
    selectionFixedSpec,
    fixedById,
    nudgeColumnSize,
  };
}
