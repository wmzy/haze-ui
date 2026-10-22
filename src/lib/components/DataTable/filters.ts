import type { RowData } from '@tanstack/react-table';

import type { DataTableColumnDef } from './DataTable';

/**
 * The header-filter state: selected option `value`s keyed by column id
 * (the id TanStack derives — explicit `id`, else the `accessorKey`). An
 * absent key or empty array means "no filter"; empty selections are
 * dropped from the state on commit so `{}` is the canonical "no
 * filters" value.
 */
type DataTableFiltersState = Record<string, unknown[]>;

/** The column id as TanStack derives it from a raw def: explicit `id`,
 * else the `accessorKey`; empty string for accessor-less display columns
 * (which never carry a header filter menu — there is no value to filter
 * on). */
function filterColumnId<TData extends RowData>(
  def: DataTableColumnDef<TData>
): string {
  if (def.id !== undefined) return def.id;
  if ('accessorKey' in def) return def.accessorKey as string;
  return '';
}

/** Leaf columns of a (possibly grouped) column list, in display order —
 * the same flattening the table renders (and `csv.ts` exports). */
function leafColumnDefs<TData extends RowData>(
  columns: DataTableColumnDef<TData>[]
): DataTableColumnDef<TData>[] {
  return columns.flatMap((column) => {
    if ('columns' in column && column.columns) {
      // Group children are typed as the TanStack union upstream; at this
      // boundary they are the same defs the consumer handed DataTable.
      return leafColumnDefs(column.columns as DataTableColumnDef<TData>[]);
    }
    return [column];
  });
}

/** One cell's raw value under a column def: the `accessorFn` (custom
 * formatting lives there), else the `accessorKey` field of the row. */
function columnValue<TData extends RowData>(
  def: DataTableColumnDef<TData>,
  row: TData
): unknown {
  if ('accessorFn' in def) return def.accessorFn(row, 0);
  if ('accessorKey' in def) {
    return (row as Record<string, unknown>)[def.accessorKey as string];
  }
  return undefined;
}

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
    leafColumnDefs(columns).map((def) => [filterColumnId(def), def])
  );
  // One predicate per actively filtered column, resolved once.
  const predicates = active
    .map(([id, values]) => {
      const def = byId.get(id);
      if (def?.meta?.filters === undefined) return null;
      return (row: TData) => {
        const rowValue = columnValue(def, row);
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
