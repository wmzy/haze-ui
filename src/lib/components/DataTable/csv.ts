import type {
  ColumnVisibilityState,
  RowData,
} from '@tanstack/react-table';

import type { DataTableColumnDef } from './DataTable';
import type { DataTableFiltersState } from './filters';

import {
  cellValue,
  columnIdOf,
  leafColumnDefs,
} from './data-table-shared';
import { applyColumnFilters } from './filters';

/** Options for `dataTableToCsv`. */
type DataTableCsvOptions = {
  /**
   * Prepend a UTF-8 byte-order mark (`\uFEFF`), default `true`. Excel
   * sniffs the BOM to decode the file as UTF-8 — without it, CJK and
   * other non-ASCII cell values come up mojibake in Excel's legacy
   * default encoding. Turn it off when the consumer already handles
   * encoding (or feeds the string to a parser that chokes on it).
   */
  bom?: boolean;
  /**
   * The table's column-visibility state (the `columnVisibility` control's
   * value): columns hidden there are skipped, so the export mirrors what
   * the table renders.
   */
  columnVisibility?: ColumnVisibilityState;
  /**
   * The table's header-filter state (the `filters` control's value): rows
   * are filtered through the same engine the table uses before
   * serialization, so the export mirrors the filtered rows exactly —
   * pass the value straight from your control, like `columnVisibility`.
   */
  filters?: DataTableFiltersState;
};

/** A column exports when it carries data (an `accessorKey`/`accessorFn` —
 * display-only columns like action buttons have nothing to serialize),
 * is not marked `meta.excludeFromExport`, and is not hidden in the
 * `columnVisibility` state. */
function exportableColumn<TData extends RowData>(
  def: DataTableColumnDef<TData>,
  visibility: ColumnVisibilityState | undefined
): boolean {
  if (def.meta?.excludeFromExport) return false;
  // Display-only columns (group headers, action buttons) carry neither
  // accessor — there is nothing to serialize.
  if (!('accessorKey' in def) && !('accessorFn' in def)) return false;
  return visibility?.[columnIdOf(def)] !== false;
}

/** Cell text: `null`/`undefined` export as empty, `Date`s as ISO strings,
 * primitives through `String`, and anything structural (arrays, plain
 * objects) as JSON — format richer values with an `accessorFn`. */
function csvCellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  if (typeof value === 'function' || typeof value === 'symbol') return '';
  return JSON.stringify(value);
}

/** RFC 4180 escaping: a field containing a quote, comma or line break is
 * wrapped in quotes with its quotes doubled. */
function csvEscape(text: string): string {
  return /["\r\n,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Serializes rows and column defs to a CSV string (RFC 4180: CRLF row
 * separators, quoted fields around commas, quotes and embedded line
 * breaks). The header row uses each column's string `header`, falling
 * back to its id; grouped columns flatten to their leaves. Only exporting
 * columns contribute: display-only columns (no `accessorKey`/`accessorFn`)
 * are skipped, as are `meta.excludeFromExport` columns and columns hidden
 * in `options.columnVisibility`; `options.filters` drops rows through
 * the header filter menus' engine first. A UTF-8 BOM is prepended by
 * default so Excel decodes non-ASCII text correctly (`bom: false` drops
 * it).
 *
 * Pure string building — no DOM, no table instance — so it runs anywhere
 * the row data lives (client, worker, server) on the same `columns` array
 * handed to DataTable.
 */
function dataTableToCsv<TData extends RowData>(
  rows: TData[],
  columns: DataTableColumnDef<TData>[],
  options?: DataTableCsvOptions
): string {
  const leaves = leafColumnDefs(columns).filter((column) =>
    exportableColumn(column, options?.columnVisibility)
  );
  if (leaves.length === 0) return '';

  const header = leaves
    .map((column) =>
      csvEscape(
        csvCellText(
          typeof column.header === 'string'
            ? column.header
            : columnIdOf(column)
        )
      )
    )
    .join(',');

  const lines = applyColumnFilters(rows, columns, options?.filters).map(
    (row) =>
      leaves
        .map((column) => csvEscape(csvCellText(cellValue(column, row))))
        .join(',')
  );

  const bom = options?.bom === false ? '' : '\uFEFF';
  return `${bom}${[header, ...lines].join('\r\n')}`;
}

export { dataTableToCsv };
export type { DataTableCsvOptions };
