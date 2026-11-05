import type { RowData } from '@tanstack/react-table';

import type { DataTableColumnDef } from './DataTable';

import { cellValue, columnIdOf, leafColumnDefs } from './data-table-shared';

/**
 * The header-filter state: selected option `value`s keyed by column id
 * (the id TanStack derives — explicit `id`, else the `accessorKey`). An
 * absent key or empty array means "no filter"; empty selections are
 * dropped from the state on commit so `{}` is the canonical "no
 * filters" value.
 */
type DataTableFiltersState = Record<string, unknown[]>;

/**
 * Applies the header filter menus' selections to raw rows — the shared
 * engine behind the table's data pipeline (menus filter before sorting
 * and pagination) and `dataTableToCsv`'s `filters` option, so an export
 * mirrors exactly what the table renders. A column with no active
 * selection filters nothing; with one, a row passes when its
 * `meta.filterFn` returns true for the selected values array, defaulting
 * to a membership check on the cell value (`values.includes(rowValue)`,
 * SameValueZero — NaN-safe). Columns are combined with AND, options
 * within a column with the `filterFn`'s own semantics (OR by default).
 * Inert without active selections — the input array is returned as-is.
 */
function applyColumnFilters<TData extends RowData>(
  rows: TData[],
  columns: DataTableColumnDef<TData>[],
  filters: DataTableFiltersState | undefined
): TData[] {
  const active = Object.entries(filters ?? {}).filter(
    ([, values]) => Array.isArray(values) && values.length > 0
  );
  if (active.length === 0) return rows;

  const byId = new Map(
    leafColumnDefs(columns).map((def) => [columnIdOf(def), def])
  );
  // One predicate per actively filtered column, resolved once.
  const predicates = active
    .map(([id, values]) => {
      const def = byId.get(id);
      if (def?.meta?.filters === undefined) return null;
      return (row: TData) => {
        const rowValue = cellValue(def, row);
        return def.meta?.filterFn
          ? def.meta.filterFn(row, values, rowValue)
          : values.includes(rowValue);
      };
    })
    .filter((predicate): predicate is (row: TData) => boolean =>
      predicate !== null
    );
  if (predicates.length === 0) return rows;

  return rows.filter((row) => predicates.every((predicate) => predicate(row)));
}

export { applyColumnFilters };
export type { DataTableFiltersState };
