import type { ReactNode, RefObject } from 'react';
import type { Row, RowData } from '@tanstack/react-table';
import type { VirtualListHandle } from '../VirtualList';
import type { DataTableSummary } from './DataTable';
import type { DataTableRowsView } from './data-table-rows';

import { TableBody } from '../Table';
import { baseStyle as tableBase } from '../Table/table-styles';
import { VirtualList } from '../VirtualList';

import {
  renderDataTableRow,
  renderEmptyRow,
  renderFilterBody,
  renderSkeletonRow,
} from './data-table-rows';
import {
  endSentinelClass,
  fixedLayout,
  scrollArea,
  stickyScrollArea,
  virtualArea,
  virtualRowTable,
} from './data-table-styles';
import { renderDataTableSummary } from './data-table-summary';
import { dataTableFeatures } from './features';

type DataTableRow<TData extends RowData> = Row<
  typeof dataTableFeatures,
  TData
>;

/** What the table body renders from — assembled by `DataTable` each
 *  commit. */
type DataTableBodyView<TData extends RowData> = {
  /** Builds the consumer-facing `<table>` around `content` — the element
   *  the native props (`...rest`) land on. The header table and the
   *  normal-mode table are the only ones; the row, skeleton, empty and
   *  summary tables of virtualized mode are internal. */
  nativeTable: (content: ReactNode) => ReactNode;
  /** Virtualized mode: the header table above a windowed list of per-row
   *  sibling tables, instead of one scrolling table. */
  virtual: boolean;
  /** The virtualized scroll region — the element the viewport is
   *  measured from. */
  virtualAreaRef: RefObject<HTMLDivElement | null>;
  /** Measured height of the virtualized viewport. */
  viewportHeight: number;
  /** The fixed row height of the window. */
  rowHeight: number;
  overscan: number | undefined;
  /** Custom-panel expansion is possible — taller panels switch the window
   *  to measured row heights. */
  expandable: boolean;
  virtualListRef: RefObject<VirtualListHandle | null>;
  /** The `onEndReached` prop. */
  onEndReached: (() => void) | undefined;
  endReachedThreshold: number | undefined;
  stickyHeader: boolean;
  /** The infinite-scroll sentinel's node — mounted only while rows can
   *  actually be reached. */
  endSentinelRef: RefObject<HTMLDivElement | null>;
  loading: boolean;
  /** The `pageSize` prop — it sizes the skeleton (defaulting to 5 rows). */
  pageSize: number | undefined;
  /** Data rows on this page. */
  rows: DataTableRow<TData>[];
  colgroup: ReactNode;
  header: ReactNode;
  /** Density step class, applied on every rendered table. */
  densityClass: string | undefined;
  /** Everything the row renderers read (data-table-rows.tsx). */
  rowsView: DataTableRowsView<TData>;
  /** The `filterable` prop — on, the header filter row renders as the
   *  first body section below the header. */
  filterable: boolean;
  /** The `summary` prop. */
  summary:
    | ((
        rows: Row<typeof dataTableFeatures, TData>[]
      ) => DataTableSummary<TData>[])
    | undefined;
  stickyFooter: boolean;
  /** `classNames.summary` — the `<tfoot>` slot class. */
  summaryClassName: string | undefined;
  /** `classNames.row` — the slot class of the summary rows. */
  rowClassName: string | undefined;
};

/**
 * ── Table body ────────────────────────────────────────────────────────
 * The scroll region and the `<table>`s inside it: one table in normal
 * mode; in virtualized mode the header table above a `VirtualList` of
 * per-row sibling tables (skeleton and empty tables in their place, the
 * summary as its own table below), all sharing one colgroup so their
 * fixed-layout columns line up. Extracted verbatim from `DataTable` —
 * behavior-neutral.
 */
export function renderDataTableBody<TData extends RowData>(
  view: DataTableBodyView<TData>
): ReactNode {
  const {
    nativeTable,
    virtual,
    virtualAreaRef,
    viewportHeight,
    rowHeight,
    overscan,
    expandable,
    virtualListRef,
    onEndReached,
    endReachedThreshold,
    stickyHeader,
    endSentinelRef,
    loading,
    pageSize,
    rows,
    colgroup,
    header,
    densityClass,
    rowsView,
    filterable,
    summary,
    stickyFooter,
    summaryClassName,
    rowClassName,
  } = view;

  const renderRow = (row: DataTableRow<TData>) =>
    renderDataTableRow(row, rowsView);

  const skeletonRows = Array.from(
    { length: pageSize ?? 5 },
    (_, rowIndex) => renderSkeletonRow(rowsView, rowIndex)
  );

  const emptyRow = renderEmptyRow(rowsView);

  // Filter row: rendered as the first body section directly below the
  // header (see data-table-rows.tsx) — only while `filterable` is on.
  const filterBody = filterable ? renderFilterBody(rowsView) : undefined;

  // Summary footer (data-table-summary.tsx): the table's tfoot in normal
  // mode; in virtualized mode its own sibling table below the scrolling
  // window, sharing the same colgroup for column alignment.
  const { table, selectable, leafHeaders } = rowsView;
  const summaryTfoot = renderDataTableSummary({
    table,
    selectable,
    leafHeaders,
    summary,
    loading,
    rowCount: rows.length,
    stickyFooter,
    summaryClassName,
    rowClassName,
  });

  return virtual ? (
    <div ref={virtualAreaRef} data-slot="scroll-area" x-class={[virtualArea]}>
      {nativeTable(
        <>
          {colgroup}
          {header}
          {filterBody}
        </>
      )}
      {loading ? (
        <table data-slot="table" x-class={[tableBase, densityClass, fixedLayout]}>
          {colgroup}
          <TableBody>{skeletonRows}</TableBody>
        </table>
      ) : rows.length > 0 ? (
        <VirtualList
          ref={virtualListRef}
          items={rows}
          height={viewportHeight}
          itemHeight={rowHeight}
          // Infinite scroll rides VirtualList's own end-reached
          // channel in this mode; the threshold passes through with
          // its 200px default matching ours.
          onEndReached={onEndReached}
          endReachedThreshold={endReachedThreshold}
          // Expansion panels are taller than the fixed row height, so
          // switch the window to measured heights once expanding is
          // possible; plain rows measure back to `rowHeight`.
          estimatedItemHeight={expandable ? rowHeight : undefined}
          overscan={overscan}
          renderItem={(row) => (
            <table data-slot="table" x-class={[tableBase, densityClass, fixedLayout, virtualRowTable]}>
              {colgroup}
              <TableBody>{renderRow(row)}</TableBody>
            </table>
          )}
        />
      ) : (
        <table data-slot="table" x-class={[tableBase, densityClass, fixedLayout]}>
          {colgroup}
          <TableBody>{emptyRow}</TableBody>
        </table>
      )}
      {summaryTfoot !== undefined && (
        <table data-slot="table" x-class={[tableBase, densityClass, fixedLayout]}>
          {colgroup}
          {summaryTfoot}
        </table>
      )}
    </div>
  ) : (
    <div data-slot="scroll-area" x-class={[stickyHeader ? stickyScrollArea : scrollArea]}>
      {nativeTable(
        <>
          {colgroup}
          {header}
          {filterBody}
          <TableBody>
            {loading ? (
              skeletonRows
            ) : (
              <>
                {rows.map(renderRow)}
                {rows.length === 0 && emptyRow}
              </>
            )}
          </TableBody>
          {summaryTfoot}
        </>
      )}
      {/* End-of-rows sentinel for the IntersectionObserver — present
       * only while rows can actually be reached (no skeleton, no
       * empty state), so it never signals past a dead end. */}
      {onEndReached !== undefined && !loading && rows.length > 0 && (
        <div
          ref={endSentinelRef}
          data-slot="end-sentinel"
          aria-hidden="true"
          x-class={[endSentinelClass]}
        />
      )}
    </div>
  );
}
