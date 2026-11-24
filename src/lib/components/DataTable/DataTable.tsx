import type {
  ComponentPropsWithoutRef,
  MouseEvent,
  ReactNode,
  Ref,
} from 'react';
import type { ControlOrValue } from 'react-use-control';
import type {
  ColumnDef,
  ColumnOrderState,
  ColumnVisibilityState,
  ExpandedState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';

import type { DataTableCellEditorProps, DataTableColumnMeta } from './features';
import type { DataTableRowsView } from './data-table-rows';
import type { NavCell } from './use-cell-navigation';

import type { VirtualListHandle } from '../VirtualList';

import type { DataTableFiltersState } from './filters';

import { useId, useRef, useState } from 'react';

import { useDirection } from '../../utils/direction';
import { useMergedRefs } from '../../utils/refs';

import { useStrings } from '../LocaleProvider';

import { TableClassNamesProvider } from '../Table/TableContext';
import { baseStyle as tableBase } from '../Table/table-styles';

import { resolveColumnLayout } from './column-layout';
import { renderDataTableBody } from './data-table-body';
import { renderDataTableChrome } from './data-table-chrome';
import { renderDataTableHeader } from './data-table-header';
import { fixedLayout, root, sizeLg, sizeSm } from './data-table-styles';
import { SELECTION_NAV_ID } from './data-table-shared';
import { dataTableFeatures } from './features';
import { useCellNavigation } from './use-cell-navigation';
import { useColumnReorder } from './use-column-reorder';
import { useDataTableEngine } from './use-data-table-engine';
import { useDataTableState } from './use-data-table-state';
import { useEndSentinel } from './use-end-sentinel';
import { useSelectAll } from './use-select-all';
import { useVirtualWindow } from './use-virtual-window';

/** Windowing configuration for the table body, reusing `VirtualList`. */
type DataTableVirtualized =
  | boolean
  | {
      /** Fixed row height in px — must match the rendered row (custom cell
       * padding or multi-line content need this form). */
      rowHeight: number;
      /** Extra rows kept mounted above/below the visible window.
       * Defaults to `VirtualList`'s `5`. */
      overscan?: number;
    };

/** Column definition accepted by DataTable — a TanStack Table column def
 * bound to DataTable's feature set and column meta. The native `size`
 * field doubles as a static px width hint (read as the colgroup width
 * fallback after `meta.width`) and seeds the resize math when `resizable`
 * is on. The `meta` extension adds `filterFn`, the custom predicate of
 * the header filter menu, typed against this table's row data (the
 * feature-registered meta carries only the TData-independent fields). */
type DataTableColumnDef<TData extends RowData> = ColumnDef<
  typeof dataTableFeatures,
  TData
> & {
  size?: number;
  meta?: {
    /**
     * Replaces the default membership check of the header filter menu
     * (`meta.filters`): a row passes the column's filter when this
     * returns true for the selected values array. Receives the row's
     * original data, the selected option values and the current cell
     * value. The default keeps rows whose cell value equals a selected
     * one (`values.includes(rowValue)`).
     */
    filterFn?: (
      row: TData,
      filterValue: unknown[],
      rowValue: unknown
    ) => boolean;
  };
};

/** One cell of a summary row: a static string or number (`undefined`
 * renders an empty cell — `dataTableAvg` of no numeric values), or a
 * function of the summarized rows (the place `dataTableSum` & co. plug
 * in). */
type DataTableSummaryCell<TData extends RowData = RowData> =
  | string
  | number
  | undefined
  | ((rows: Row<typeof dataTableFeatures, TData>[]) => ReactNode);

/** One `<tfoot>` row produced by the `summary` callback: an optional
 * accessible label for the whole row (rendered as its `aria-label`) and
 * one cell per leaf column, in column order. */
type DataTableSummary<TData extends RowData = RowData> = {
  label?: string;
  cells: DataTableSummaryCell<TData>[];
};

/**
 * Semantic slot classes (AntD v6 `classNames` shape) for DataTable:
 * declared once on the root and distributed to the structural parts —
 * the wrapper, the toolbar strip and the pagination footer on their
 * own `<div>`s, the header/body/row/cell slots through the same
 * context the Table primitives read (every `<th>`/`<td>` the table
 * renders — header, body, selection, skeleton, empty, filter and
 * summary cells alike). Slot classes are appended at the end of each
 * part's class list; per-part `className` stays on the root and still
 * lands after the `wrapper` slot.
 */
type DataTableClassNames = {
  /** The root wrapper (`data-slot='data-table'`). */
  wrapper?: string;
  /** The header `<thead>` (rendered through `TableHead`). */
  header?: string;
  /** The toolbar strip above the table (`data-slot='toolbar'`) — only
   *  rendered while the `toolbar` slot or `columnToggle` (without
   *  `pageSize`) contributes something. */
  toolbar?: string;
  /** The pagination footer row (`data-slot='pagination'`) — only
   *  rendered while `pageSize` is set. */
  footer?: string;
  /** Every body `<tbody>` (rendered through `TableBody`) — data,
   *  skeleton, empty and filter bodies alike. */
  body?: string;
  /** Every data row `<tr>` — body rows plus the skeleton and empty
   *  placeholder rows and the summary rows (header rows keep the
   *  `header` slot's domain). */
  row?: string;
  /** Every cell `<th>`/`<td>` — header, body (incl. selection),
   *  skeleton, empty, filter and summary cells alike. */
  cell?: string;
  /** The summary `<tfoot>` (`data-slot='summary'`) — only rendered
   *  while `summary` returns rows. */
  summary?: string;
}

type DataTableProps<TData extends RowData> = {
  /** Column definitions: accessors, headers and cell templates. */
  columns: DataTableColumnDef<TData>[];
  /** Row data — one item per row. */
  data: TData[];
  /** Enable click-to-sort headers. Defaults to `false`; per-column
   * `meta.sortable` (or native `enableSorting`) overrides per column. */
  sortable?: boolean;
  /** Render a leading checkbox column bound to `rowSelection`. */
  selectable?: boolean;
  /** Selection state keyed by row id (TanStack `RowSelectionState`). */
  rowSelection?: ControlOrValue<RowSelectionState>;
  /** Sort state (TanStack `SortingState`). */
  sorting?: ControlOrValue<SortingState>;
  /** Rows per page. Setting this enables the pagination footer. */
  pageSize?: number;
  /** Current page, 1-based, when paginating. */
  page?: ControlOrValue<number>;
  /**
   * Server-driven mode: sorting and pagination stop being computed
   * locally. TanStack's `manualSorting` / `manualPagination` under the
   * hood — the table renders `data` exactly as received (no reordering,
   * no page slicing), so the consumer fetches each page pre-sorted and
   * pre-sliced. Sort-header clicks still toggle the `sorting` state (and
   * `aria-sort`), and the footer still tracks the `page` state; the
   * consumer observes both through the `onSortChange` / `onPageChange`
   * callbacks (or the `sorting` / `page` controls) and refetches. Pass
   * `pageCount` so the footer knows the server-side page total — without
   * it the footer falls back to `data.length`, i.e. one full page.
   * Composes with `rowSelection`, `loading`, `virtualized` and the
   * skeleton exactly as in local mode.
   */
  manual?: boolean;
  /**
   * Total number of pages, overriding the footer's page math in `manual`
   * mode (locally derived from `data.length` otherwise). Only meaningful
   * together with `pageSize`.
   */
  pageCount?: number;
  /**
   * Fires with the next 1-based page whenever the page changes — footer
   * clicks and programmatic updates alike, in local and `manual` mode.
   * The `manual`-mode refetch trigger; pairs with `pageCount`.
   */
  onPageChange?: (page: number) => void;
  /**
   * Fires with the next TanStack `SortingState` whenever sorting changes
   * — header clicks (including multi-sort) and programmatic updates
   * alike, in local and `manual` mode. In `manual` mode this is the
   * server refetch trigger; the table itself keeps rendering `data`
   * untouched.
   */
  onSortChange?: (sorting: SortingState) => void;
  /** Render skeleton rows instead of data. */
  loading?: boolean;
  /** Keep the header visible while the table body scrolls. */
  stickyHeader?: boolean;
  /**
   * Window the table body so only rows near the viewport stay mounted,
   * reusing the library's `VirtualList`. `true` uses the default row
   * height; an object pins it explicitly (plus an optional `overscan`,
   * default 5).
   *
   * The default height follows the `size` density step — `34px` at `md`,
   * the natural single-line row of the default cell styles: 2 ×
   * `--haze-space-2` padding (16px) + a 14px (`--haze-text-sm`) line box +
   * the 1px row border. `sm` tightens it to `23px`, `lg` loosens it to
   * `39px`.
   *
   * Limitations and tradeoffs (evaluated against keeping `<tr>`s in one
   * shared table): `VirtualList` positions rows through absolutely
   * positioned `div` wrappers, and `position: absolute` blockifies
   * `display: table-row` — so rows cannot stay in the header's table.
   * Instead each row renders as a complete sibling `<table><tbody><tr>`
   * inside the wrapper. Rows remain legal, axe-clean table structures
   * with row/cell roles. One shared `<colgroup>` — the selection column
   * plus every leaf column's `meta.width` (falling back to the native
   * `size`) — is mirrored into the header table and every row table, and
   * `table-layout: fixed` honors it identically in each sibling: columns
   * with a width are fixed at it, columns without one split the remaining
   * space equally. That mirrored sequence is the alignment contract
   * between the sibling tables — no column-width measurement pass.
   * Consequences:
   * - Fixed row height only — dynamic or wrapping row heights are not
   *   supported; content taller than `rowHeight` overlaps the next row.
   * - Column widths are declarative (`meta.width` / `size`), never
   *   content-driven: columns without a width share the remainder equally
   *   instead of auto-sizing to content.
   * - `meta.fixed` is ignored in this mode — each row is its own table
   *   inside its own absolutely positioned wrapper, so there is no shared
   *   horizontal scrollport for cells to stick against.
   * - The header sits outside the scroll window (always visible) — the
   *   `stickyHeader` behavior is implied.
   * - The root must be height-bounded by the consumer (e.g. a
   *   `className` setting `height`/`max-height`, or a sized flex
   *   parent); unbounded, the viewport degenerates to a single row.
   * - Sorting, selection, pagination and `getRowId` semantics are
   *   unchanged — the window always shows the post-sort, post-page slice.
   */
  virtualized?: DataTableVirtualized;
  /** Stable row identity; also keys the `rowSelection` state. Defaults to
   * the row's index. */
  getRowId?: (row: TData, index: number) => string;
  /** Row click handler. Clicks originating in interactive cell content
   * (checkboxes, buttons, links) are ignored. */
  onRowClick?: (row: TData, event: MouseEvent<HTMLTableRowElement>) => void;
  /** Custom empty-state node; defaults to the `Empty` component. */
  empty?: ReactNode;
  /**
   * Enable column resizing: every leaf header cell (except those switched
   * off per column) grows a drag handle on its inline-end edge. Dragging
   * commits widths live (TanStack `columnResizeMode: 'onChange'`); the
   * handle is a focusable `separator` widget — ArrowLeft/ArrowRight nudge
   * the width by 5px (mirrored under RTL, read from the DOM at event
   * time), double-click resets the column to its declared width.
   * Per-column `meta.resizable` (or native `enableResizing`) overrides per
   * column. Defaults to `false` — no handles, no colgroup change.
   */
  resizable?: boolean;
  /**
   * Expanded-row state (TanStack `ExpandedState`: `true` for all, or a map
   * keyed by row id). Drives both expansion flavors: custom panels
   * (`getRowCanExpand` + `renderExpandedRow`) and tree data (`subRows`).
   */
  expanded?: ControlOrValue<ExpandedState>;
  /**
   * Decides which rows offer an expander button in the first content
   * column. Without it, providing `renderExpandedRow` alone makes every
   * row expandable. Explicit expansion props win over tree data: when
   * either this or `renderExpandedRow` is given, `subRows` fields are
   * ignored and rows never nest.
   */
  getRowCanExpand?: (row: Row<typeof dataTableFeatures, TData>) => boolean;
  /**
   * Renders the expansion panel: a full-width row (`colSpan` across every
   * visible column) directly below each expanded row. Called with the
   * TanStack row (`.original` carries the data). Providing it (or
   * `getRowCanExpand`) switches the table to custom-panel expansion and
   * disables tree mode.
   */
  renderExpandedRow?: (row: Row<typeof dataTableFeatures, TData>) => ReactNode;
  /**
   * The field DataTable reads tree children from, when rows carry nested
   * data — `'subRows'` by default. Tree mode turns on by itself when some
   * top-level row holds a non-empty array there: parent rows grow expander
   * buttons in the first content column, expanded children render as
   * indented rows (one `--haze-space-4` per depth level) in document
   * order, and the `expanded` state keeps its TanStack semantics (keyed by
   * row id — sub-row ids default to `parentId.index`, so pass `getRowId`
   * for stable ids). Works with sorting, filtering, selection, pagination
   * and `virtualized` (the expanded row model already yields the flat
   * display order the window slices). Explicit `getRowCanExpand` /
   * `renderExpandedRow` take priority — with either present, `subRows`
   * data is not read at all.
   */
  subRowsKey?: string;
  /**
   * Column visibility state (TanStack `ColumnVisibilityState`): a map keyed by
   * column id, `true` (or absent) meaning visible. Hidden columns drop
   * from header, body and colgroup.
   */
  columnVisibility?: ControlOrValue<ColumnVisibilityState>;
  /**
   * Render the column-settings trigger opening a `DropdownMenu` of
   * checkboxes — one per hideable column (`meta.hideable: false` pins a
   * column out of the menu). With `pageSize` the trigger sits in the
   * pagination row (pagination keeps the end edge); without it a toolbar
   * row appears above the table's inline-end corner. Defaults to `false`.
   */
  columnToggle?: boolean;
  /**
   * Render a filter row directly below the header: one `Input` per
   * filterable column, typing filters rows through TanStack's
   * case-insensitive `includesString` (empty input clears the filter).
   * Per-column `meta.filterable` (or native `enableColumnFilter`)
   * overrides per column; a columnDef `filterFn` replaces the default
   * filter function. Defaults to `false`.
   */
  filterable?: boolean;
  /**
   * Column filter menus: any column declaring `meta.filters` (a list of
   * `{ text, value }` options) grows a funnel trigger in its header cell
   * opening a floating panel with one checkbox per option, plus
   * Apply/Reset. The state maps column id → selected option values; it
   * composes with the `filterable` text row, sorting and pagination
   * (menus filter first, then the text filters, then sorting, then the
   * page slice), and `dataTableToCsv` mirrors it through its `filters`
   * option. A row passes when `meta.filterFn` returns true for the
   * selection — the default keeps rows whose cell value equals a
   * selected one. Controllable exactly like `sorting`/`page`: pass a
   * value or `Control` to seed or drive it, observe every mutation
   * through `onFiltersChange`. In `manual` mode the table renders `data`
   * as received (the refetch trigger is yours, like sorting); row ids
   * derive from the filtered array, so combine with `getRowId` when
   * filtering and selecting together.
   */
  filters?: ControlOrValue<DataTableFiltersState>;
  /**
   * Fires with the next column-filter state whenever a menu commits —
   * Apply and Reset clicks alike, and programmatic updates on a
   * controlled `filters`. In `manual` mode this is the server refetch
   * trigger.
   */
  onFiltersChange?: (filters: DataTableFiltersState) => void;
  /**
   * Renders summary rows in a `<tfoot>` below the body: one row per entry,
   * one cell per leaf column (`cells[i]` aligns with column `i`; the
   * selection column, when present, renders an empty cell first). Cell
   * functions receive the rows being summarized — every row of the
   * filtered data (all pages, tree sub-rows included), so totals stay
   * stable across pagination; `label` names the row accessibly. Skipped
   * while `loading` or when no rows render. When `virtualized`, the
   * summary renders in its own table below the scrolling window — pinned
   * by construction, `stickyFooter` is unnecessary there.
   */
  summary?: (
    rows: Row<typeof dataTableFeatures, TData>[]
  ) => DataTableSummary<TData>[];
  /**
   * Keep the summary footer visible while the body scrolls vertically —
   * the tfoot cells stick to the bottom of the scroll area (needs a
   * height-bounded table: `stickyHeader`'s scroll area or a consumer
   * `max-height`). No effect when `virtualized` (already pinned) or
   * without `summary`. Defaults to `false`.
   */
  stickyFooter?: boolean;
  /**
   * Enable inline cell editing: cells become focusable and enter edit mode
   * on double-click or Enter; the built-in editors (an `InputCore`) save
   * on Enter or blur and cancel on Escape. The editor kind is chosen per
   * column through `meta.editor` (`'text'` by default, `'number'` parses
   * the draft — reporting `null` when cleared — a function renders a
   * custom editor, `false` opts the column out). DataTable never mutates
   * `data`: committed values are reported through `onCellEdit`, and the
   * cell keeps rendering the current value until the consumer updates the
   * data. Note `onRowClick` still fires for the clicks of a double-click.
   */
  editable?: boolean;
  /**
   * Reports a committed cell edit: the row id, the column id, the next
   * value and the previous one. Called after Enter/blur/custom-editor
   * saves, only when the value actually changed (`Object.is`). The
   * consumer owns the data — update it to make the edit visible.
   */
  onCellEdit?: (
    rowId: string,
    columnId: string,
    nextValue: unknown,
    prevValue: unknown
  ) => void;
  /**
   * Custom actions rendered in the toolbar strip at the table's inline-end
   * corner — the same container as the `columnToggle` trigger (flex row,
   * content first, trigger last). Renders above the table whether or not
   * `pageSize` is set; the strip only appears when this slot or
   * `columnToggle` contributes something (`null`/`undefined` render
   * nothing). Available in every mode — `loading` swaps the body for the
   * skeleton and leaves the strip untouched.
   */
  toolbar?: ReactNode;
  /**
   * Cell density across header, body and summary footer: `sm` tightens the
   * cell padding to `--haze-space-1/--haze-space-2`, `lg` loosens it to
   * `--haze-space-3/--haze-space-4`, `md` (the default) keeps the Table
   * primitives' `--haze-space-2/--haze-space-3`. Padding comes from spacing
   * tokens, so the global `compact` density class composes — it shrinks the
   * tokens these rules consume rather than fighting them (compact + `sm`
   * stacks). Font size stays `--haze-text-sm` in every step; when
   * `virtualized` without an explicit `rowHeight`, the default height
   * follows the step (23/34/39px).
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Enable column reordering: every leaf header cell grows a drag grip
   * (an inline-start ⠿ affordance) that can be dragged with the pointer —
   * via `@dnd-kit`, loaded lazily the first time this prop is on, so
   * tables that never opt in carry none of the drag runtime — or moved
   * with the keyboard: the grip is a focusable button (its own tab stop,
   * the resize-handle precedent) and Alt+ArrowLeft / Alt+ArrowRight move
   * the column one slot (mirrored under RTL). The order lives in
   * TanStack's `columnOrder` state and every reorder reports through
   * `onColumnOrderChange`. The selection column stays pinned out of the
   * reordering set, as do hidden columns (they simply have no grip);
   * tree-expandable rows keep their expander inside the first content
   * column, which reorders like any other. Composes with sorting,
   * resizing (grip inline-start, resize handle inline-end), fixed
   * columns, filtering and `virtualized` — the mirrored colgroup follows
   * the new order. Grouped (nested) headers disable reordering: the prop
   * is ignored and a dev-mode `console.warn` explains why, because a
   * group header spans several leaves and has no single slot to move.
   */
  columnReorderable?: boolean;
  /**
   * Reports the next column order — the ids of every visible leaf column,
   * in their new sequence — after a completed reorder, whether it came
   * from a pointer drag or the Alt+Arrow keys. Purely observational: the
   * order itself is owned by the table's internal state, so persisting a
   * preferred order means seeding `columns` in that sequence next mount.
   */
  onColumnOrderChange?: (order: ColumnOrderState) => void;
  /**
   * Infinite-scroll trigger: fires when the table's scroll position comes
   * within `endReachedThreshold` px of the last rendered row — the "load
   * the next page" signal. In `virtualized` mode this is VirtualList's
   * own end-reached channel (content shorter than the window fires
   * immediately, and the trigger re-arms after content grows); otherwise
   * a zero-footprint sentinel after the body is watched through an
   * IntersectionObserver rooted at the table's own scroll container when
   * it scrolls vertically (`stickyHeader`), falling back to the viewport —
   * which still respects consumer scroll containers, since intersection
   * is computed through every scrollable clipper between the sentinel
   * and the viewport. Coexists with `manual` pagination on purpose:
   * `onEndReached` keeps firing and the consumer decides whether to
   * append rows or let the pager turn pages.
   */
  onEndReached?: () => void;
  /**
   * Distance in px from the end of the content that arms `onEndReached`.
   * Defaults to `200`.
   */
  endReachedThreshold?: number;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape): keyed by
   * structural part (see {@link DataTableClassNames}). Not passing it
   * renders identical output.
   */
  classNames?: DataTableClassNames;
  className?: string;
  /** Forwarded to the root wrapper `<div>` (`data-slot='data-table'`)
   *  — the `...rest` spread keeps landing on the inner `<table>`. */
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'table'>, 'children' | 'summary'>;

export default function DataTable<TData extends RowData>({
  columns,
  data,
  sortable = false,
  selectable = false,
  rowSelection: rowSelectionControl,
  sorting: sortingControl,
  pageSize,
  page: pageControl,
  manual = false,
  pageCount,
  onPageChange,
  onSortChange,
  loading = false,
  stickyHeader = false,
  virtualized,
  getRowId,
  onRowClick,
  empty,
  resizable = false,
  expanded: expandedControl,
  getRowCanExpand,
  renderExpandedRow,
  subRowsKey = 'subRows',
  columnVisibility: columnVisibilityControl,
  columnToggle = false,
  filterable = false,
  filters: filtersControl,
  onFiltersChange,
  summary,
  stickyFooter = false,
  editable = false,
  onCellEdit,
  toolbar: toolbarSlot,
  size: density = 'md',
  columnReorderable = false,
  onColumnOrderChange,
  onEndReached,
  endReachedThreshold,
  classNames,
  className,
  ref,
  ...rest
}: DataTableProps<TData>) {
  const state = useDataTableState({
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
  });
  const { pageCtrl, filters, setColumnOrder } = state;
  // Which cell is being edited, if any — purely internal UI state, keyed by
  // row/column id so it survives reorders and the virtualized window.
  const [editingCell, setEditingCell] = useState<NavCell | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // The consumer ref and the internal rootRef both land on the wrapper
  // through the shared merge hook.
  const setRootRef = useMergedRefs(rootRef, ref);
  const virtualListRef = useRef<VirtualListHandle | null>(null);

  // Declared intent (LocaleProvider chain → document) for the drag math,
  // which TanStack resolves as a render-time option; keyboard nudges read
  // the DOM direction at event time instead.
  const dir = useDirection();
  const instanceId = useId();
  const strings = useStrings('dataTable');

  // Density class per size step — md keeps the Table primitives' padding.
  const densityClass =
    density === 'sm' ? sizeSm : density === 'lg' ? sizeLg : undefined;

  const { table, tableData, expandable, setColumnFilter } =
    useDataTableEngine({
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
    });

  const selectAllRef = useSelectAll(table);

  const virtualWindow = useVirtualWindow({ virtualized, density });
  const { virtual } = virtualWindow;

  const headerGroups = table.getHeaderGroups();
  const leafHeaders = table.getLeafHeaders();
  const columnCount = leafHeaders.length + (selectable ? 1 : 0);
  const rows = table.getRowModel().rows;

  // ── Column reordering ────────────────────────────────────────────────
  const {
    reorderActive,
    reorderKit,
    leafIds,
    moveColumn,
    reorderFocusRef,
  } = useColumnReorder({
    columnReorderable,
    headerGroups,
    leafHeaders,
    setColumnOrder,
    rootRef,
  });

  const endSentinelRef = useEndSentinel({
    virtual,
    onEndReached,
    endReachedThreshold,
    stickyHeader,
    loading,
    rowCount: rows.length,
  });

  const layout = resolveColumnLayout({
    table,
    leafHeaders,
    selectable,
    resizable,
    virtual,
  });

  // ── Cell keyboard navigation (roving tabindex) ────────────────────────
  // The roving model, the cell keymap and the virtualized pending-focus
  // loop live in use-cell-navigation.ts; the ids the model resolves
  // against are assembled here.
  const navColumnIds = [
    ...(selectable ? [SELECTION_NAV_ID] : []),
    ...leafHeaders.map((header) => header.column.id),
  ];
  const navRowIds = rows.map((row) => row.id);

  const { isNavCellActive, handleNavKeyDown, setActiveCell } =
    useCellNavigation({
      navRowIds,
      navColumnIds,
      rootRef,
      virtual,
      scrollToIndex: (index) => virtualListRef.current?.scrollToIndex(index),
      setEditingCell,
    });

  const handleRowClick = onRowClick
    ? (row: TData, event: MouseEvent<HTMLTableRowElement>) => {
        // Interactive content inside the cell owns the click.
        if (
          event.target instanceof Element &&
          event.target.closest('button, input, select, textarea, a')
        ) {
          return;
        }
        onRowClick(row, event);
      }
    : undefined;

  // The ref objects here are forwarded into the render function for
  // event-time access only (select-all input lookup, reorder focus
  // restore), the same contract a JSX ref prop carries.
  const header = renderDataTableHeader({
    table,
    headerGroups,
    selectable,
    sticky: stickyHeader,
    checkCellStyle: layout.checkCellStyle,
    selectionFixedSpec: layout.selectionFixedSpec,
    fixedById: layout.fixedById,
    selectAllRef,
    selectAllLabel: strings.selectAll,
    resizable,
    nudgeColumnSize: layout.nudgeColumnSize,
    filters,
    setColumnFilter,
    reorderActive,
    reorderKit,
    leafIds,
    moveColumn,
    reorderFocusRef,
  });

  // Body-section rendering (data rows, skeleton, empty state, filter row)
  // lives in data-table-rows.tsx; everything it reads is assembled into one
  // view object here.
  const rowsView: DataTableRowsView<TData> = {
    table,
    selectable,
    leafHeaders,
    checkCellStyle: layout.checkCellStyle,
    selectionFixedSpec: layout.selectionFixedSpec,
    fixedById: layout.fixedById,
    rowClassName: classNames?.row,
    handleRowClick,
    isNavCellActive,
    setActiveCell,
    handleNavKeyDown,
    editable,
    editingCell,
    setEditingCell,
    onCellEdit,
    renderExpandedRow,
    instanceId,
    columnCount,
    empty,
    filterPlaceholder: strings.filterPlaceholder,
  };

  const keyboardHintId = `${instanceId}-keyboard-nav`;

  // The consumer-facing `<table>`: the one element per mode the native
  // props land on through `...rest` — the header table in virtualized
  // mode, the whole table otherwise. The row, skeleton, empty and summary
  // tables of virtualized mode are internal (data-table-body.tsx).
  const nativeTable = (content: ReactNode) => (
    <table
      data-slot="table"
      x-class={[tableBase, densityClass, virtual && fixedLayout]}
      {...rest}
    >
      {content}
    </table>
  );

  // eslint-disable-next-line react-hooks/refs -- the ref objects are forwarded into the render function for JSX ref props and event-time access only (viewport measuring, scroll-to-index, the end-reached observer), the same contract a JSX ref prop carries.
  const body = renderDataTableBody({
    nativeTable,
    ...virtualWindow,
    expandable,
    virtualListRef,
    onEndReached,
    endReachedThreshold,
    stickyHeader,
    endSentinelRef,
    loading,
    pageSize,
    rows,
    colgroup: layout.colgroup,
    header,
    densityClass,
    rowsView,
    // The header filter row and the summary footer render inside the
    // body's tables (data-table-body.tsx).
    filterable,
    summary,
    stickyFooter,
    summaryClassName: classNames?.summary,
    rowClassName: classNames?.row,
  });

  // The table's content, optionally wrapped in the drag region once the
  // reorder kit has loaded. The region renders no DOM of its own except
  // dnd-kit's screen-reader live regions, which land here — inside the
  // root div but outside the `<table>`, where a stray `<div>` would be
  // invalid markup (SortableTabList keeps them out of its tablist for
  // the same reason). The chrome around the body (keyboard hint, toolbar
  // strip, pagination row) lives in data-table-chrome.tsx.
  const tableContent = renderDataTableChrome(
    {
      hintId: keyboardHintId,
      reorderActive,
      editable,
      classNames,
      toolbar: toolbarSlot,
      table,
      columnToggle,
      columnsLabel: strings.columns,
      pagination:
        pageSize === undefined
          ? undefined
          : {
              page: pageCtrl,
              pageSize,
              manual,
              pageCount,
              dataLength: tableData.length,
            },
    },
    body
  );

  return (
    <TableClassNamesProvider
      value={{
        head: classNames?.header,
        body: classNames?.body,
        cell: classNames?.cell,
      }}
    >
    <div
      ref={setRootRef}
      data-slot="data-table"
      aria-describedby={keyboardHintId}
      x-class={[root, classNames?.wrapper, className]}
    >
      {reorderKit !== null && reorderActive ? (
        <reorderKit.ColumnReorderRegion ids={leafIds} onMove={moveColumn}>
          {tableContent}
        </reorderKit.ColumnReorderRegion>
      ) : (
        tableContent
      )}
    </div>
    </TableClassNamesProvider>
  );
}

export type {
  DataTableProps,
  DataTableClassNames,
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableVirtualized,
  DataTableSummary,
  DataTableSummaryCell,
  DataTableCellEditorProps,
};

export type { DataTableFiltersState } from './filters';
