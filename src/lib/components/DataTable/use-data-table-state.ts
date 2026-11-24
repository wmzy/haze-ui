import type {
  ColumnOrderState,
  ColumnVisibilityState,
  ExpandedState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
import type { Control, ControlOrValue } from 'react-use-control';

import type { DataTableFiltersState } from './filters';

import { useControl, useThru, watch, isControl } from 'react-use-control';

/** The control props and change callbacks `useDataTableState` binds, named
 * after the table's props. A control binding is `undefined` when the prop
 * was not given; the callbacks are the observational props, and leaving one
 * out keeps its watch layer inert. */
type DataTableStateInputs = {
  sorting: ControlOrValue<SortingState> | undefined;
  rowSelection: ControlOrValue<RowSelectionState> | undefined;
  page: ControlOrValue<number> | undefined;
  expanded: ControlOrValue<ExpandedState> | undefined;
  columnVisibility: ControlOrValue<ColumnVisibilityState> | undefined;
  filters: ControlOrValue<DataTableFiltersState> | undefined;
  onSortChange: ((sorting: SortingState) => void) | undefined;
  onPageChange: ((page: number) => void) | undefined;
  onColumnOrderChange: ((order: ColumnOrderState) => void) | undefined;
  onFiltersChange: ((filters: DataTableFiltersState) => void) | undefined;
};

/**
 * ── Controllable state ────────────────────────────────────────────────
 * Binds every state a consumer can seed or drive — sorting, row selection,
 * the page, expansion, column visibility, column order and the header
 * filter menus — through `useControl`, so each one keeps the
 * `Control<T> | T` contract. Sorting, the page, column order and the
 * filters are observed from outside (server refetches, persistence), so
 * those four pass through a `watch` layer reporting every mutation
 * exactly once; selection, expansion and visibility only feed the table.
 */
export function useDataTableState({
  sorting: sortingControl,
  rowSelection: rowSelectionControl,
  page: pageControl,
  expanded: expandedControl,
  columnVisibility: columnVisibilityControl,
  filters: filtersControl,
  onSortChange,
  onPageChange,
  onColumnOrderChange,
  onFiltersChange,
}: DataTableStateInputs) {
  // Sorting and page states are threaded through a `watch` layer so every
  // mutation — header clicks (TanStack's onSortingChange), footer clicks
  // (the Pagination control) and programmatic updates — reports through
  // onSortChange / onPageChange exactly once, from outside the state
  // updater. Controlled controls keep their Control semantics; the layer
  // is inert while the callbacks are absent.
  const sortingControlled = isControl(sortingControl);
  const [sorting, setSorting] = useControl<SortingState>(
    useThru(
      sortingControlled ? sortingControl : undefined,
      watch((next) => onSortChange?.(next))
    ),
    sortingControlled ? [] : sortingControl ?? []
  );
  const [rowSelection, setRowSelection] = useControl<RowSelectionState>(
    rowSelectionControl,
    {}
  );
  const pageControlled = isControl(pageControl);
  const [page, setPage, pageCtrl] = useControl<number>(
    useThru(
      pageControlled ? pageControl : undefined,
      watch((next) => onPageChange?.(next))
    ),
    pageControlled ? 1 : pageControl ?? 1
  );
  const [expanded, setExpanded] = useControl<ExpandedState>(
    expandedControl,
    {}
  );
  const [columnVisibility, setColumnVisibility] =
    useControl<ColumnVisibilityState>(columnVisibilityControl, {});
  // Column order follows the same watch-layer contract: internal state
  // (TanStack's columnOrder — an empty array means the natural
  // column-def order), with every mutation reported through
  // onColumnOrderChange from outside the state updater.
  const [columnOrder, setColumnOrder] = useControl<ColumnOrderState>(
    useThru(undefined, watch((next) => onColumnOrderChange?.(next))),
    []
  );
  // Header filter menus follow the sorting/page watch-layer contract:
  // menu commits (Apply/Reset) and programmatic updates report through
  // onFiltersChange exactly once, from outside the state updater.
  const filtersControlled = isControl(filtersControl);
  const [filters, setFilters] = useControl<DataTableFiltersState>(
    useThru(
      // isControl narrows to Control<unknown> and cannot recover T here
      // (a Record value overlaps the Control shape, so the predicate
      // loses the generic) — re-assert the declared prop type.
      filtersControlled
        ? (filtersControl as Control<DataTableFiltersState>)
        : undefined,
      watch((next) => onFiltersChange?.(next))
    ),
    filtersControlled ? {} : filtersControl ?? {}
  );

  return {
    sorting,
    setSorting,
    rowSelection,
    setRowSelection,
    page,
    setPage,
    pageCtrl,
    expanded,
    setExpanded,
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    filters,
    setFilters,
  };
}

/** What `useDataTableState` hands back: the bound values, the setters the
 *  table engine writes through, and `pageCtrl` — the `Control<number>` the
 *  Pagination footer is driven with. */
export type DataTableState = ReturnType<typeof useDataTableState>;
