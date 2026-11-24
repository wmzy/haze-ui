import type { ReactNode } from 'react';
import type { Row, RowData } from '@tanstack/react-table';

import type { Direction } from '../../utils/direction';

import type { DataTableColumnDef } from './DataTable';
import type { DataTableState } from './use-data-table-state';

import { useMemo } from 'react';
import { useTable } from '@tanstack/react-table';

import { dataTableFeatures } from './features';
import { applyColumnFilters } from './filters';

/** Per-column feature switches resolved from the table-level props. */
type ColumnFlags = {
  sortable: boolean;
  resizable: boolean;
  filterable: boolean;
};

/** Resolves the effective per-column feature switches: an explicit native
 * TanStack field wins, then the column `meta` override, then the table-level
 * default. Also defaults the filter function to the registered
 * `includesString` (inert while no filter value is set) and, when resizing
 * is on, feeds a declared numeric `meta.width` into the native `size` so
 * drag deltas and keyboard nudges start from the rendered width. Recurses
 * into grouped columns. */
function resolveColumn<TData extends RowData>(
  column: DataTableColumnDef<TData>,
  flags: ColumnFlags
): DataTableColumnDef<TData> {
  const resolved: DataTableColumnDef<TData> = {
    ...column,
    enableSorting:
      column.enableSorting ?? column.meta?.sortable ?? flags.sortable,
    enableResizing: column.enableResizing ?? column.meta?.resizable ?? true,
    enableHiding: column.enableHiding ?? column.meta?.hideable !== false,
    enableColumnFilter:
      column.enableColumnFilter ?? column.meta?.filterable ?? flags.filterable,
    filterFn: column.filterFn ?? 'includesString',
    size:
      flags.resizable && typeof column.meta?.width === 'number'
        ? column.meta.width
        : column.size,
  };
  if ('columns' in resolved && resolved.columns) {
    return {
      ...resolved,
      columns: resolved.columns.map((child) => resolveColumn(child, flags)),
    };
  }
  return resolved;
}

type DataTableEngineOptions<TData extends RowData> = {
  /** Column definitions as given — resolved to the effective per-column
   *  feature switches inside. */
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  /** Table-level defaults of the per-column switches (`meta` and the
   *  native TanStack field win per column). */
  sortable: boolean;
  resizable: boolean;
  filterable: boolean;
  /** Rows per page; `undefined` renders one page holding every row. */
  pageSize: number | undefined;
  /** Server-driven mode: sorting and pagination leave the local engine. */
  manual: boolean;
  getRowId: ((row: TData, index: number) => string) | undefined;
  getRowCanExpand:
    | ((row: Row<typeof dataTableFeatures, TData>) => boolean)
    | undefined;
  renderExpandedRow:
    | ((row: Row<typeof dataTableFeatures, TData>) => ReactNode)
    | undefined;
  /** The field tree children are read from. */
  subRowsKey: string;
  /** Declared writing direction — TanStack resolves the resize drag math
   *  as a render-time option. */
  dir: Direction;
  /** The bound controllable state (use-data-table-state.ts) the engine
   *  reads and writes through. */
  state: DataTableState;
};

/**
 * ── The table engine ──────────────────────────────────────────────────
 * The TanStack table instance and everything it is fed: the column defs
 * resolved to their effective feature switches, the data pipeline (the
 * header filter menus run before the engine; `manual` mode renders `data`
 * exactly as received), the expansion flavor (custom panels vs. tree data)
 * and the adapters between the table's state (1-based page, watch-layered
 * setters) and TanStack's options.
 */
export function useDataTableEngine<TData extends RowData>({
  columns,
  data,
  sortable,
  resizable,
  filterable,
  pageSize,
  manual,
  getRowId,
  getRowCanExpand,
  renderExpandedRow,
  subRowsKey,
  dir,
  state,
}: DataTableEngineOptions<TData>) {
  const {
    sorting,
    setSorting,
    rowSelection,
    setRowSelection,
    page,
    setPage,
    expanded,
    setExpanded,
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    filters,
    setFilters,
  } = state;

  // Without `pageSize` the table renders one page holding every row, so
  // the paginated row model never slices anything — Infinity (not
  // `data.length`) because expanded tree children can outnumber the roots.
  const resolvedPageSize = pageSize ?? Number.POSITIVE_INFINITY;

  // Custom-panel expansion is possible only when the consumer opts in; it
  // also switches the virtualized window to measured (dynamic) row
  // heights, since panels are taller than the fixed row height. Tree
  // expansion keeps the fixed window — children are ordinary rows.
  const expandable =
    getRowCanExpand !== undefined || renderExpandedRow !== undefined;

  // Tree data: when no explicit expansion prop is given and some top-level
  // row carries children under `subRowsKey`, TanStack's `getSubRows` is
  // wired and the default `getRowCanExpand` (rows with sub-rows) takes
  // over — expanders, indented children and the `expanded` state all flow
  // from there. Explicit props keep the custom-panel flavor and leave
  // nested data unread (zero-change default for existing consumers).
  const treeMode =
    getRowCanExpand === undefined &&
    renderExpandedRow === undefined &&
    data.some((row) => {
      const children = (row as Record<string, unknown>)[subRowsKey];
      return Array.isArray(children) && children.length > 0;
    });

  const tableColumns = useMemo(
    () =>
      columns.map((column) =>
        resolveColumn(column, { sortable, resizable, filterable })
      ),
    [columns, sortable, resizable, filterable]
  );

  // Header filter menus run before the table engine: the filtered array
  // replaces `data`, so the text filter row (TanStack's own column
  // filters), sorting, pagination, the summary and the window all
  // compose on top of it — the "menus first" pipeline order. Inert
  // without active selections (the input array passes through as-is),
  // and skipped in `manual` mode, where `data` renders exactly as the
  // server sent it and the state flows out for a refetch instead.
  const menuFilteredData = useMemo(
    () => applyColumnFilters(data, columns, filters),
    [data, columns, filters]
  );
  const tableData = manual ? data : menuFilteredData;

  // Commits one column's menu selection: empty selections are dropped so
  // `{}` stays the canonical "no filters" state.
  const setColumnFilter = (columnId: string, values: unknown[]) => {
    setFilters((prev) =>
      values.length === 0
        ? Object.fromEntries(
            Object.entries(prev).filter(([key]) => key !== columnId)
          )
        : { ...prev, [columnId]: values }
    );
  };

  const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns,
    data: tableData,
    getRowId,
    getSubRows: treeMode
      ? (originalRow) =>
          (originalRow as Record<string, unknown>)[subRowsKey] as
            | readonly TData[]
            | undefined
      : undefined,
    state: {
      sorting,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize: resolvedPageSize },
      expanded,
      columnVisibility,
      columnOrder,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    // Server-driven mode: TanStack skips the local sort and the local
    // page slice — `data` renders exactly as received while the sorting
    // and page state keep flowing (the consumer refetches off
    // onSortChange / onPageChange). manualPagination also turns off
    // TanStack's data-change auto page reset, as a server table expects.
    manualSorting: manual,
    manualPagination: manual,
    // `renderExpandedRow` alone means "every row expands"; `getRowCanExpand`
    // refines which ones. Neither given falls through to TanStack's default
    // — "rows with subRows" — which is what drives tree mode.
    getRowCanExpand:
      getRowCanExpand ??
      (renderExpandedRow !== undefined ? () => true : undefined),
    enableColumnFilters: filterable,
    enableColumnResizing: resizable,
    columnResizeMode: 'onChange',
    columnResizeDirection: dir,
    // The registered column-sizing feature defaults every column def to
    // `size: 150`; re-overriding it with `undefined` keeps "no width
    // declared" distinguishable to `columnWidthCss` (an explicit object key
    // with an undefined value survives the option merge). TanStack's own
    // size math falls back to 150 through its `??` chain, so resizing
    // behavior is unaffected.
    defaultColumn: { size: undefined },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex: page - 1, pageSize: resolvedPageSize })
          : updater;
      setPage(Math.max(1, next.pageIndex + 1));
    },
  });

  return { table, tableData, expandable, setColumnFilter };
}
