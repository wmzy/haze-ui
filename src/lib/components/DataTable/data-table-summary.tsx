import type { ReactNode } from 'react';
import type {
  Header,
  Row,
  RowData,
  ReactTable,
} from '@tanstack/react-table';
import type { DataTableSummary } from './DataTable';

import { TableCell } from '../Table';

import { dataTableFeatures } from './features';
import { stickyFoot, summaryFoot } from './data-table-styles';

/** What the summary footer renders from — assembled by the body renderer
 *  (data-table-body.tsx). */
type DataTableSummaryView<TData extends RowData> = {
  table: ReactTable<typeof dataTableFeatures, TData>;
  selectable: boolean;
  /** Leaf headers in their current order — one cell per leaf column. */
  leafHeaders: Header<typeof dataTableFeatures, TData>[];
  /** The `summary` prop. */
  summary:
    | ((
        rows: Row<typeof dataTableFeatures, TData>[]
      ) => DataTableSummary<TData>[])
    | undefined;
  loading: boolean;
  /** Data rows on this page — the footer is skipped without any. */
  rowCount: number;
  stickyFooter: boolean;
  /** `classNames.summary` — the `<tfoot>` slot class. */
  summaryClassName: string | undefined;
  /** `classNames.row` — the slot class of every summary row. */
  rowClassName: string | undefined;
};

/**
 * ── Summary footer ────────────────────────────────────────────────────
 * The `<tfoot>` the `summary` callback produces, or `undefined` while
 * `loading`, without data rows or when nothing is summarized. Extracted
 * verbatim from `DataTable` — behavior-neutral.
 */
export function renderDataTableSummary<TData extends RowData>(
  view: DataTableSummaryView<TData>
): ReactNode {
  const {
    table,
    selectable,
    leafHeaders,
    summary,
    loading,
    rowCount,
    stickyFooter,
    summaryClassName,
    rowClassName,
  } = view;

  // Summary footer: the callback summarizes the filtered data (every row,
  // all pages, tree sub-rows included) — never the skeleton or empty state.
  // Rendered as the table's tfoot in normal mode; in virtualized mode as
  // its own sibling table below the scrolling window (outside the virtual
  // area by construction), sharing the same colgroup for column alignment.
  const summaryRowsArguments = table.getFilteredRowModel().flatRows;
  const summaryRows =
    summary !== undefined && !loading && rowCount > 0
      ? summary(summaryRowsArguments)
      : undefined;
  return summaryRows !== undefined && summaryRows.length > 0 ? (
    <tfoot
      data-slot="summary"
      x-class={[summaryFoot, stickyFooter && stickyFoot, summaryClassName]}
    >
      {summaryRows.map((summaryRow, rowIndex) => (
        <tr
          key={`summary-${rowIndex}`}
          data-slot="row"
          x-class={[rowClassName]}
          aria-label={summaryRow.label}
        >
          {selectable && <TableCell data-slot="select-cell">{null}</TableCell>}
          {leafHeaders.map((header, cellIndex) => {
            const cell = summaryRow.cells[cellIndex];
            return (
              <TableCell key={header.id} data-slot="cell">
                {typeof cell === 'function'
                  ? cell(summaryRowsArguments)
                  : cell}
              </TableCell>
            );
          })}
        </tr>
      ))}
    </tfoot>
  ) : undefined;
}
