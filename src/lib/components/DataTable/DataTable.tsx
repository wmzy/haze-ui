import type {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  MouseEvent,
  PointerEventHandler,
  ReactNode,
  Ref,
} from 'react';
import type { Control, ControlOrValue } from 'react-use-control';
import type {
  Column,
  ColumnDef,
  ColumnOrderState,
  ColumnVisibilityState,
  ExpandedState,
  Header,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';

import type { DataTableCellEditorProps, DataTableColumnMeta } from './features';
import type { VirtualListHandle } from '../VirtualList';

import type { DataTableFiltersState } from './filters';

import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTable } from '@tanstack/react-table';
import { css } from '@linaria/core';
import { useControl, useThru, watch, isControl } from 'react-use-control';

import { getDirection, useDirection } from '../../utils/direction';
import { sortableHandle, useSortableHandle } from '../../utils/sortable-handle';

import { CheckboxCore } from '../Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { Empty } from '../Empty';
import { Input } from '../Input';
import { useStrings } from '../LocaleProvider';
import { Pagination } from '../Pagination';
import { Skeleton } from '../Skeleton';
import { TableBody, TableCell, TableHead } from '../Table';

import { TableClassNamesProvider } from '../Table/TableContext';
import { VisuallyHidden } from '../VisuallyHidden';
import { VirtualList } from '../VirtualList';

import CellEditor from './CellEditor';
import ColumnFilterTrigger from './column-filter';
import { dataTableFeatures } from './features';
import { applyColumnFilters } from './filters';

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

/** The lazily loaded drag kit behind `columnReorderable` — see
 * `column-reorder.tsx`. Typed through the dynamic import so DataTable's
 * static import graph never touches `@dnd-kit`. */
type ColumnReorderKit = typeof import('./column-reorder');

/** Moves one entry of an array to another index (the `@dnd-kit` helper,
 * inlined so this dnd-free module need not depend on it). */
function arrayMove<T>(array: readonly T[], from: number, to: number): T[] {
  const next = array.slice();
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return next;
  next.splice(to, 0, moved);
  return next;
}

/** The reorder grip inside a header cell: a focusable button carrying the
 * keyboard reorder model — Alt+ArrowLeft/ArrowRight move the column one
 * slot, mirrored under RTL (read from the DOM at event time, the resize
 * handle's contract). Pointer dragging arms through the SortableItem
 * wrapper once the lazily loaded column-reorder kit arrives: the grip
 * consumes its activator seam, which is null until then, so the keyboard
 * model works even before (or without) that chunk. */
function ReorderGrip({
  columnId,
  label,
  onMove,
}: {
  columnId: string;
  label: string;
  onMove: (forward: boolean) => void;
}) {
  const handle = useSortableHandle();
  return (
    <button
      type='button'
      data-slot='reorder-grip'
      data-reorder-handle={columnId}
      onPointerDown={
        handle?.listeners?.onPointerDown as
          | PointerEventHandler<HTMLButtonElement>
          | undefined
      }
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.defaultPrevented) return;
        if (!event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        onMove(
          (event.key === 'ArrowRight') !==
            (getDirection(event.currentTarget) === 'rtl')
        );
      }}
      aria-label={`Reorder ${label}`}
      aria-keyshortcuts='Alt+ArrowLeft Alt+ArrowRight'
      x-class={[sortableHandle, reorderGripClass]}
    >
      <span aria-hidden='true'>⠿</span>
    </button>
  );
}

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

/** Human label for a column in generated UI (resize handles, filter inputs,
 * the visibility menu): the header string when one was given, else the
 * column id. */
function columnLabel<TData extends RowData>(
  column: Column<typeof dataTableFeatures, TData>
): string {
  const header = column.columnDef.header;
  return typeof header === 'string' ? header : column.id;
}

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

/** Sticky-column presentation resolved for one rendered cell: which edge,
 * the CSS length to offset it by, and whether this is the innermost column
 * of a pinned run (the one carrying the scroll-hint shadow). */
type FixedCellSpec = {
  side: 'left' | 'right';
  offset: string;
  edge: boolean;
};

/** One tbody cell in the roving-tabindex navigation model, keyed by row id
 * and column id (the selection column uses `SELECTION_NAV_ID`). */
type NavCell = { rowId: string; columnId: string };

/** Sums CSS length fragments into a single length expression. Fragments are
 * plain lengths (`'120px'`) or parenthesized expressions (the selection
 * column's token math), so anything non-trivial is wrapped in `calc()`. */
function sumLengths(parts: string[]): string {
  if (parts.length === 0) return '0px';
  const [first] = parts;
  if (parts.length === 1 && first !== undefined && !first.includes('(')) {
    return first;
  }
  return `calc(${parts.join(' + ')})`;
}

/** Inline style carrying a fixed cell's sticky edge offset; the position,
 * background and z-index come from the fixed-cell classes. */
function fixedOffsetStyle(spec: FixedCellSpec | undefined) {
  return spec
    ? {
        left: spec.side === 'left' ? spec.offset : undefined,
        right: spec.side === 'right' ? spec.offset : undefined,
      }
    : undefined;
}

/** Selection column width wherever a colgroup owns it: 2 × `--haze-space-3`
 * cell padding + one checkbox (`--haze-space-5`). The `calc` form keeps
 * token overrides live; the parenthesized twin is the fragment summed into
 * fixed-column offsets. */
const SELECTION_COL_WIDTH =
  'calc(var(--haze-space-3) * 2 + var(--haze-space-5))';
const SELECTION_WIDTH_PART =
  '(var(--haze-space-3) * 2 + var(--haze-space-5))';

/** Default `virtualized` row height per density step: 2 × the step's block
 * cell padding + one `--haze-text-sm` (14px) line box + the 1px row
 * border — sm 2×4, md 2×8, lg 2×12. */
const VIRTUAL_ROW_HEIGHTS = { sm: 23, md: 34, lg: 39 } as const;

/** Pseudo column id of the selection column inside the navigation model —
 * a string no accessor column can produce (ids derive from accessor keys). */
const SELECTION_NAV_ID = '__selection__';

/** Keyboard model description for the sr-only hint (English default —
 * like the generated cell/row labels, not routed through locale packs).
 * The edit sentence is appended only while `editable`. */
const KEYBOARD_HINT =
  'Use the arrow keys to move between cells. Home and End go to the start or end of the row; PageUp and PageDown go to the first or last row.';
const KEYBOARD_HINT_EDIT =
  ' Press Enter or F2 to edit the focused cell; Escape cancels and returns to navigation.';
const KEYBOARD_HINT_REORDER =
  ' Focus a column reorder grip and press Alt with the left or right arrow key to move its column.';

const root = css`
  display: flex;
  flex-direction: column;
`;

const scrollArea = css`
  overflow-x: auto;
`;

/* Bounded by the consumer (height/max-height on the DataTable) — without a
 * bound the area never scrolls and the sticky header simply stays put. */
const stickyScrollArea = css`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

/* Virtualized body region: the header table above never scrolls vertically,
 * the VirtualList below owns the vertical scrollbar. `scrollbar-gutter`
 * reserves the scrollbar lane next to the header so its fixed-layout
 * columns line up with the rows inside the scroller (auto layout would
 * size each sibling table's columns independently and drift apart). */
const virtualArea = css`
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-gutter: stable;
`;

/* Shared by the header table and every virtualized row table: `table-layout:
 * fixed` honors the mirrored `<colgroup>` identically in each sibling — the
 * alignment contract between them. */
const fixedLayout = css`
  table-layout: fixed;
`;

/* Fills the VirtualList wrapper (which carries the exact `rowHeight`), so
 * the default middle vertical alignment of table cells absorbs any slack
 * between content and the fixed row height. */
const virtualRowTable = css`
  height: 100%;
`;

const tableBase = css`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
`;

const stickyHead = css`
  & th {
    position: sticky;
    top: 0;
    /* Above sticky fixed-column body cells (--haze-z-local-1): at equal
     * z-indexes the later-in-DOM body cells would paint over the header row. */
    z-index: var(--haze-z-local-2);
    background: var(--haze-color-bg);
    box-shadow: var(--haze-shadow-sm);
  }
`;

const sortButton = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: inherit;
  color: inherit;
  cursor: pointer;

  &:hover {
    color: var(--haze-color-primary);
  }

  &:focus-visible {
    outline: none;
    border-radius: var(--haze-radius-sm);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const sortIcon = css`
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
`;

const rowHover = css`
  &:hover {
    background: var(--haze-color-bg-subtle);
  }
`;

const rowSelected = css`
  &,
  &:hover {
    background: var(--haze-color-primary-subtle);
  }
`;

const clickableRow = css`
  cursor: pointer;
`;

/* Selection column without a colgroup (normal mode, no declared widths):
 * the `width: 1%` shrink-to-fit trick under auto layout. */
const checkCell = css`
  width: 1%;
  white-space: nowrap;
`;

/* Selection column under a colgroup — always in virtual mode, and in normal
 * mode once any column declares a width. The `<col>` owns the sizing
 * (`SELECTION_COL_WIDTH`), the cell keeps only `nowrap`. */
const checkCellCol = css`
  white-space: nowrap;
`;

/* Sticky fixed columns (normal mode). Opaque background so scrolled cells
 * slide beneath. The row hover/selected backgrounds live on the `tr` and
 * would be covered by the cell's own background, so they are re-created on
 * the cell itself. */
const fixedCell = css`
  position: sticky;
  z-index: var(--haze-z-local-1);
  background: var(--haze-color-bg);

  tr:hover & {
    background: var(--haze-color-bg-subtle);
  }
`;

/* Selected-row background for fixed cells — defined after `fixedCell` and
 * at equal-or-higher specificity (plus the `:hover` form), so it wins over
 * the plain and hovered backgrounds above. */
const fixedCellSelected = css`
  tr &,
  tr:hover & {
    background: var(--haze-color-primary-subtle);
  }
`;

/* A fixed cell inside a sticky header is the scroll corner — it must
 * outrank both the header row (--haze-z-local-2) and fixed body cells
 * (--haze-z-local-1). */
const fixedHeadCell = css`
  z-index: var(--haze-z-local-3);
`;

/* Scroll-hint shadow on the inner edge of the outermost pinned column;
 * `clip-path` confines it to that edge. Body cells only — the header row's
 * own shadow must not be replaced. */
const fixedLeftEdge = css`
  clip-path: inset(0 -8px 0 0);
  box-shadow: 6px 0 8px -6px var(--haze-color-border);
`;

const fixedRightEdge = css`
  clip-path: inset(0 0 0 -8px);
  box-shadow: -6px 0 8px -6px var(--haze-color-border);
`;

const emptyCell = css`
  padding: 0;
`;

const footer = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: var(--haze-space-3);
`;

/* Toolbar strip above the table's inline-end corner: custom actions (the
 * `toolbar` slot) plus, when not paginating, the column-settings trigger.
 * Wrap keeps long toolbars from overflowing narrow tables. */
const toolbar = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--haze-space-2);
  margin-bottom: var(--haze-space-3);
`;

/* The menu wrapper inside the pagination row: consumes the free space so
 * the trigger pins to the start edge and Pagination keeps the end edge. */
const footerMenu = css`
  margin-inline-end: auto;
`;

const columnsTrigger = css`
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
const toggleRow = css`
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

/* Resizable header cells anchor the absolutely positioned drag handle.
 * `position: relative` only wins where the header is not sticky — under
 * `stickyHeader` the `.stickyHead th` rule (class + type specificity)
 * keeps `position: sticky`, which anchors the handle just as well. */
const resizableHead = css`
  position: relative;
`;

/* Drag handle straddling the header cell's inline-end edge: a focusable
 * `separator` widget (ARIA authoring pattern). */
const resizeHandle = css`
  position: absolute;
  top: 0;
  bottom: 0;
  inset-inline-end: -3px;
  width: 6px;
  z-index: var(--haze-z-local-1);
  cursor: col-resize;
  touch-action: none;
  border-radius: var(--haze-radius-sm);

  &::after {
    content: '';
    position: absolute;
    top: 25%;
    bottom: 25%;
    inset-inline-end: 2.5px;
    width: 1px;
    background: var(--haze-color-border);
  }

  &:hover::after,
  &:focus-visible::after {
    top: 0;
    bottom: 0;
    background: var(--haze-color-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/* Reorder grip at the header cell's inline-start edge: a focusable
 * button with its own tab stop (the resize-handle precedent) carrying an
 * aria-hidden glyph — the accessible name is the English aria-label, like
 * the resize handles' "Resize …". 24×24 keeps the WCAG 2.5.8 target
 * floor. */
const reorderGripClass = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--haze-space-6);
  height: var(--haze-space-6);
  margin-inline-end: var(--haze-space-1);
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: var(--haze-text-xs);
  line-height: 1;
  color: var(--haze-color-text-muted);
  vertical-align: middle;
  border-radius: var(--haze-radius-sm);

  &:hover {
    color: var(--haze-color-primary);
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/* The sortable wrapper span around a grip, present once the drag kit has
 * loaded: inline and middle-aligned so wrapping the grip changes no
 * header metrics between the pre- and post-load renders. */
const reorderItemClass = css`
  display: inline-flex;
  vertical-align: middle;
`;

/* Zero-footprint sentinel after the body — an IntersectionObserver target
 * only. 1px tall so engines that skip zero-area targets still report it. */
const endSentinelClass = css`
  height: 1px;
`;

const expander = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--haze-space-5);
  height: var(--haze-space-5);
  margin-inline-end: var(--haze-space-1);
  padding: 0;
  border: none;
  background: none;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
  vertical-align: middle;
  cursor: pointer;
  border-radius: var(--haze-radius-sm);

  &:hover {
    color: var(--haze-color-text);
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const expanderIcon = css`
  transition: transform var(--haze-duration-fast) var(--haze-ease);

  [aria-expanded='true'] & {
    transform: rotate(90deg);
  }
`;

/* Expansion panel cell: spans every rendered column on its own row. */
const panelCell = css`
  padding: var(--haze-space-3);
  background: var(--haze-color-bg-subtle);
`;

/* Tree indentation: an inline-block spacer in the first content cell,
 * one `--haze-space-4` per depth level (inline style carries the depth
 * multiple). aria-hidden — purely presentational shifting. */
const treeIndent = css`
  display: inline-block;
  vertical-align: middle;
`;

/* Summary footer: mirrors the body cell metrics with a heavier top rule
 * and the header's text weight. */
const summaryFoot = css`
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
const stickyFoot = css`
  & td {
    position: sticky;
    bottom: 0;
    z-index: var(--haze-z-local-2);
    background: var(--haze-color-bg);
    box-shadow: var(--haze-shadow-sm);
  }
`;

/* Editable cell, at rest: hints at the affordance. The focus ring itself
 * lives on the shared navigable-cell class below — every tbody cell is a
 * roving-tabindex stop, editable or not. */
const editableCell = css`
  cursor: text;
`;

/* Navigable cell focus ring: inset so it stays inside the cell borders
 * under sticky headers and fixed columns. Every tbody data/selection cell
 * carries it (the resize handles and interactive cell content keep their
 * own rings). */
const navCell = css`
  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--haze-color-focus-ring);
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
const sizeSm = css`
  & > thead > tr > th,
  & > tbody > tr > td:not([data-slot='panel-cell']):not([data-slot='empty-cell']),
  & > tfoot > tr > td {
    padding: var(--haze-space-1) var(--haze-space-2);
  }
`;

const sizeLg = css`
  & > thead > tr > th,
  & > tbody > tr > td:not([data-slot='panel-cell']):not([data-slot='empty-cell']),
  & > tfoot > tr > td {
    padding: var(--haze-space-3) var(--haze-space-4);
  }
`;

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
  // Which cell is being edited, if any — purely internal UI state, keyed by
  // row/column id so it survives reorders and the virtualized window.
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  // Roving-tabindex cursor: the single tbody cell carrying tabindex=0.
  // Purely internal UI state (like hover tracking) keyed by row/column id,
  // so it survives reorders and the virtualized window; null defers to the
  // first rendered cell until the first focus/keypress.
  const [activeCell, setActiveCell] = useState<NavCell | null>(null);
  // Focus request for a virtualized navigation target whose row is outside
  // the window — satisfied (and cleared) by the pending-focus effect once
  // scrollToIndex mounts the row.
  const pendingFocusRef = useRef<NavCell | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // The consumer ref and the internal rootRef both land on the wrapper:
  // a callback fans the node out to each target.
  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);
  const virtualListRef = useRef<VirtualListHandle | null>(null);

  // Declared intent (LocaleProvider chain → document) for the drag math,
  // which TanStack resolves as a render-time option; keyboard nudges read
  // the DOM direction at event time instead.
  const dir = useDirection();
  const instanceId = useId();
  const strings = useStrings('dataTable');

  const virtual = virtualized === true || typeof virtualized === 'object';
  const rowHeight =
    typeof virtualized === 'object'
      ? virtualized.rowHeight
      : VIRTUAL_ROW_HEIGHTS[density];
  const overscan =
    typeof virtualized === 'object' ? virtualized.overscan : undefined;

  // Density class per size step — md keeps the Table primitives' padding.
  const densityClass =
    density === 'sm' ? sizeSm : density === 'lg' ? sizeLg : undefined;

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

  // React has no `indeterminate` prop (it strips the attribute), so the DOM
  // property is set on the wrapped input after every commit.
  const selectAllRef = useRef<HTMLSpanElement>(null);
  const indeterminate =
    table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
  useEffect(() => {
    const input = selectAllRef.current?.querySelector('input');
    if (input) input.indeterminate = indeterminate;
  });

  // Virtualized viewport height: measured from the consumer-bounded region
  // minus the pinned header. Floors keep every observation identical, so
  // the ResizeObserver settles instead of looping; unbounded roots bottom
  // out at one row instead of growing recursively.
  const virtualAreaRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  useEffect(() => {
    if (!virtual) return;
    const area = virtualAreaRef.current;
    const thead = area?.querySelector('thead');
    if (!area || !thead) return;
    const measure = () => {
      const areaHeight = Math.floor(area.getBoundingClientRect().height);
      const headerHeight = Math.floor(thead.getBoundingClientRect().height);
      setViewportHeight(Math.max(rowHeight, areaHeight - headerHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    observer.observe(thead);
    return () => observer.disconnect();
  }, [virtual, rowHeight]);

  const headerGroups = table.getHeaderGroups();
  const leafHeaders = table.getLeafHeaders();
  const columnCount = leafHeaders.length + (selectable ? 1 : 0);
  const rows = table.getRowModel().rows;
  const columnSizing = table.state.columnSizing;

  // ── Column reordering ────────────────────────────────────────────────
  // Nested (grouped) headers have no single slot to move — a group spans
  // several leaves — so reordering switches itself off with a dev warning.
  const reorderActive = columnReorderable && headerGroups.length === 1;
  useEffect(() => {
    if (!columnReorderable || headerGroups.length <= 1) return;
    console.warn(
      'DataTable: columnReorderable does not support grouped (nested) headers — rendering without column reordering.'
    );
  }, [columnReorderable, headerGroups.length]);

  // The drag wiring loads lazily the first time reordering is active, so
  // DataTable's static import graph (and every consumer that never opts
  // in) stays free of the @dnd-kit runtime — the dist-esm contract's
  // engine-import rules. The grips themselves render dnd-free from this
  // module: only pointer dragging waits for the kit.
  const [reorderKit, setReorderKit] = useState<ColumnReorderKit | null>(null);
  useEffect(() => {
    if (!reorderActive) return;
    let cancelled = false;
    void import('./column-reorder').then(
      (kit) => {
        if (!cancelled) setReorderKit(kit);
      },
      // A failed chunk load only costs the pointer drag — the grips and
      // their Alt+Arrow model never depended on it.
      () => undefined
    );
    return () => {
      cancelled = true;
    };
  }, [reorderActive]);

  // Visible leaf ids in current order — the reordering set. The selection
  // column is not a leaf (no grip, never moves), hidden columns are simply
  // absent, and tree/custom expansion lives inside the first content
  // column, which reorders like any other.
  const leafIds = leafHeaders.map((header) => header.column.id);

  const moveColumn = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || to >= leafIds.length) return;
    setColumnOrder(arrayMove(leafIds, from, to));
  };

  // A keyboard move should not strand focus when the cell (and its grip)
  // travel under the keyed reconciliation — re-land it on the same grip
  // if the browser dropped it. Only the keyboard path marks the request;
  // pointer drags keep dnd-kit's own focus restoration.
  const reorderFocusRef = useRef<string | null>(null);
  useEffect(() => {
    const columnId = reorderFocusRef.current;
    if (!columnId) return;
    reorderFocusRef.current = null;
    const grip = rootRef.current?.querySelector(
      `[data-reorder-handle="${CSS.escape(columnId)}"]`
    );
    if (grip instanceof HTMLElement && document.activeElement !== grip) {
      grip.focus();
    }
  });

  // ── Infinite scroll (non-virtualized) ───────────────────────────────
  // A sentinel after the body, watched through an IntersectionObserver.
  // Rooted at the component's own vertical scroller when it has one
  // (sticky mode), else at the viewport — which still honors consumer
  // scroll containers, since intersection is computed through every
  // scrollable clipper above the sentinel. The rootMargin pre-arms the
  // trigger by the threshold, matching VirtualList's end-reached
  // semantics; re-observing after content growth re-delivers the initial
  // notification, which is what chains short pages into the next load.
  const endSentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (virtual || onEndReached === undefined) return;
    const sentinel = endSentinelRef.current;
    if (!sentinel) return;
    const root = stickyHeader
      ? sentinel.closest<HTMLElement>('[data-slot="scroll-area"]')
      : null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onEndReached();
      },
      { root, rootMargin: `${endReachedThreshold ?? 200}px 0px` }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [virtual, onEndReached, endReachedThreshold, stickyHeader, loading, rows.length]);

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

  // ── Cell keyboard navigation (roving tabindex) ────────────────────────
  // Every tbody cell participates: exactly one carries tabindex=0 (the
  // active cell, or the first rendered cell before any interaction), the
  // rest -1. Arrow keys move the active cell, Enter/F2 enter edit mode on
  // editable cells, and Tab is never intercepted — interactive cell content
  // and the resize handles keep their own independent tab stops.
  const navColumnIds = [
    ...(selectable ? [SELECTION_NAV_ID] : []),
    ...leafHeaders.map((header) => header.column.id),
  ];
  const navRowIds = rows.map((row) => row.id);

  // The active cell must still resolve against the current model — hidden
  // columns and swapped pages quietly invalidate it, falling back to the
  // first rendered cell.
  const activeNavCell =
    activeCell !== null &&
    navRowIds.includes(activeCell.rowId) &&
    navColumnIds.includes(activeCell.columnId)
      ? activeCell
      : null;
  const firstNavRowId = navRowIds[0];
  const firstNavColumnId = navColumnIds[0];
  const isNavCellActive = (rowId: string, columnId: string) =>
    activeNavCell !== null
      ? activeNavCell.rowId === rowId && activeNavCell.columnId === columnId
      : rowId === firstNavRowId && columnId === firstNavColumnId;

  const findNavCell = (cell: NavCell) => {
    const candidates = rootRef.current?.querySelectorAll<HTMLElement>(
      '[data-nav-row]'
    );
    if (!candidates) return undefined;
    for (const candidate of candidates) {
      if (
        candidate.dataset.navRow === cell.rowId &&
        candidate.dataset.navCol === cell.columnId
      ) {
        return candidate;
      }
    }
    return undefined;
  };

  // Focus a navigation target: cells inside the rendered tree (normal mode,
  // or within the virtualized window) focus directly; a virtualized target
  // outside the window is scrolled in through VirtualList's scrollToIndex
  // and focused by the pending-focus effect once its row mounts.
  const focusNavCell = (cell: NavCell) => {
    const target = findNavCell(cell);
    if (target) {
      target.focus();
      return;
    }
    if (!virtual) return;
    const index = navRowIds.indexOf(cell.rowId);
    if (index >= 0) {
      virtualListRef.current?.scrollToIndex(index);
      pendingFocusRef.current = cell;
    }
  };

  // Virtualized targets mount one commit after scrollToIndex — focus them
  // as soon as they appear, then clear the request.
  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending) return;
    const target = findNavCell(pending);
    if (target) {
      pendingFocusRef.current = null;
      target.focus();
    }
  });

  const handleNavKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    cell: NavCell,
    canEditTarget: boolean
  ) => {
    if (event.defaultPrevented) return;
    // Modified keys stay with the browser (page shortcuts).
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    // Inner widgets (editors, expanders, checkboxes) own their keys.
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === 'F2') {
      if (!canEditTarget) return;
      event.preventDefault();
      setActiveCell(cell);
      setEditingCell(cell);
      return;
    }
    const rowIndex = navRowIds.indexOf(cell.rowId);
    const columnIndex = navColumnIds.indexOf(cell.columnId);
    if (rowIndex < 0 || columnIndex < 0) return;
    const lastRowIndex = navRowIds.length - 1;
    const lastColumnIndex = navColumnIds.length - 1;
    const at = (r: number, c: number): NavCell | undefined => {
      const rowId = navRowIds[r];
      const columnId = navColumnIds[c];
      return rowId !== undefined && columnId !== undefined
        ? { rowId, columnId }
        : undefined;
    };
    // Horizontal moves wrap through rows — right off the last column lands
    // on the next row's first cell and vice versa — while vertical moves
    // stop at the grid edges: the header is not part of the roving set.
    const horizontal = (dir: 1 | -1): NavCell | undefined => {
      let c = columnIndex + dir;
      let r = rowIndex;
      if (c > lastColumnIndex) {
        if (r >= lastRowIndex) return undefined;
        c = 0;
        r += 1;
      } else if (c < 0) {
        if (r <= 0) return undefined;
        c = lastColumnIndex;
        r -= 1;
      }
      return at(r, c);
    };
    let next: NavCell | undefined;
    switch (event.key) {
      case 'ArrowUp':
        next = rowIndex > 0 ? at(rowIndex - 1, columnIndex) : undefined;
        break;
      case 'ArrowDown':
        next = rowIndex < lastRowIndex ? at(rowIndex + 1, columnIndex) : undefined;
        break;
      case 'ArrowLeft':
        // Horizontal keys mirror under RTL, read from the DOM at event
        // time (same contract as the resize handles).
        next = horizontal(getDirection(event.currentTarget) === 'rtl' ? 1 : -1);
        break;
      case 'ArrowRight':
        next = horizontal(getDirection(event.currentTarget) === 'rtl' ? -1 : 1);
        break;
      case 'Home':
        next = at(rowIndex, 0);
        break;
      case 'End':
        next = at(rowIndex, lastColumnIndex);
        break;
      case 'PageUp':
        next = rowIndex > 0 ? at(0, columnIndex) : undefined;
        break;
      case 'PageDown':
        next =
          rowIndex < lastRowIndex ? at(lastRowIndex, columnIndex) : undefined;
        break;
      default:
        return;
    }
    if (
      next === undefined ||
      (next.rowId === cell.rowId && next.columnId === cell.columnId)
    ) {
      return;
    }
    event.preventDefault();
    setActiveCell(next);
    focusNavCell(next);
  };

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

  const header = (
    <TableHead className={stickyHeader ? stickyHead : undefined}>
      {headerGroups.map((headerGroup, groupIndex) => (
        <tr key={headerGroup.id} data-slot="row">
          {selectable && groupIndex === 0 && (
            <TableCell
              as='th'
              data-slot="select-cell"
              x-class={[
                checkCellStyle,
                selectionFixedSpec && fixedCell,
                selectionFixedSpec && fixedHeadCell,
              ]}
              rowSpan={
                headerGroups.length > 1 ? headerGroups.length : undefined
              }
              style={fixedOffsetStyle(selectionFixedSpec)}
            >
              <span ref={selectAllRef}>
                <CheckboxCore
                  checked={table.getIsAllRowsSelected()}
                  onChange={(checked) => table.toggleAllRowsSelected(checked)}
                  aria-label={strings.selectAll}
                />
              </span>
            </TableCell>
          )}
          {headerGroup.headers.map((header) => {
            if (header.rowSpan === 0) return null;
            if (header.isPlaceholder) {
              return (
                <TableCell
                  as='th'
                  key={header.placeholderId ?? header.id}
                  data-slot="cell"
                >
                  {null}
                </TableCell>
              );
            }
            const sorted = header.column.getIsSorted();
            // Fixed columns are honored on leaf headers — a group header
            // spanning several columns has no single edge to stick to.
            const fixedSpec =
              header.subHeaders.length === 0
                ? fixedById.get(header.column.id)
                : undefined;
            const canResize =
              resizable &&
              header.subHeaders.length === 0 &&
              header.column.getCanResize();
            // Reorder grip on leaf columns while reordering is active. The
            // drag wrapper (a sortable item) appears once the lazily loaded
            // kit arrives — until then the bare grip still carries the
            // Alt+Arrow keyboard model.
            const reorderGrip =
              reorderActive && header.subHeaders.length === 0 ? (
                <ReorderGrip
                  columnId={header.column.id}
                  label={columnLabel(header.column)}
                  onMove={(forward) => {
                    const from = leafIds.indexOf(header.column.id);
                    const to = forward ? from + 1 : from - 1;
                    if (from < 0) return;
                    reorderFocusRef.current = header.column.id;
                    moveColumn(from, to);
                  }}
                />
              ) : null;
            const reorderGripSlot =
              reorderGrip !== null && reorderKit !== null ? (
                <reorderKit.ColumnReorderItem
                  id={header.column.id}
                  className={reorderItemClass}
                >
                  {reorderGrip}
                </reorderKit.ColumnReorderItem>
              ) : (
                reorderGrip
              );
            // Filter menu on leaf columns declaring predefined options —
            // a group header spans several columns and has no single
            // value to filter on.
            const filterOptions =
              header.subHeaders.length === 0
                ? header.column.columnDef.meta?.filters
                : undefined;
            return (
              <TableCell
                as='th'
                key={header.id}
                data-slot="cell"
                colSpan={header.colSpan > 1 ? header.colSpan : undefined}
                rowSpan={header.rowSpan > 1 ? header.rowSpan : undefined}
                x-class={[
                  fixedSpec && fixedCell,
                  fixedSpec && fixedHeadCell,
                  canResize && resizableHead,
                ]}
                style={fixedOffsetStyle(fixedSpec)}
                aria-sort={
                  sorted === 'asc'
                    ? 'ascending'
                    : sorted === 'desc'
                      ? 'descending'
                      : undefined
                }
              >
                {reorderGripSlot}
                {header.column.getCanSort() ? (
                  <button
                    type='button'
                    data-slot="sort-button"
                    x-class={[sortButton]}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <table.FlexRender header={header} />
                    <span data-slot="icon" x-class={[sortIcon]} aria-hidden='true'>
                      {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
                    </span>
                  </button>
                ) : (
                  <table.FlexRender header={header} />
                )}
                {filterOptions !== undefined && filterOptions.length > 0 && (
                  <ColumnFilterTrigger
                    label={columnLabel(header.column)}
                    options={filterOptions}
                    selected={filters[header.column.id] ?? []}
                    onChange={(values) =>
                      setColumnFilter(header.column.id, values)
                    }
                  />
                )}
                {canResize && (
                  <div
                    role='separator'
                    data-slot="resize-handle"
                    aria-orientation='vertical'
                    aria-label={`Resize ${columnLabel(header.column)}`}
                    tabIndex={0}
                    x-class={[resizeHandle]}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      header.getResizeHandler()(event);
                    }}
                    onDoubleClick={() => header.column.resetSize()}
                    onKeyDown={(event) => {
                      if (
                        event.key !== 'ArrowLeft' &&
                        event.key !== 'ArrowRight'
                      ) {
                        return;
                      }
                      event.preventDefault();
                      // Arrows mirror under RTL, read from the DOM at
                      // event time so the keys follow the painted
                      // direction (same contract as Calendar).
                      const rtl = getDirection(event.currentTarget) === 'rtl';
                      const grow = (event.key === 'ArrowRight') !== rtl;
                      nudgeColumnSize(header, grow ? 5 : -5);
                    }}
                  />
                )}
              </TableCell>
            );
          })}
        </tr>
      ))}
    </TableHead>
  );

  // Expansion panel row id, referenced by the expander's `aria-controls`.
  // Row ids are consumer-defined, so stray whitespace is neutralized.
  const panelId = (rowId: string) =>
    `${instanceId}-${rowId.replace(/\s+/g, '-')}-panel`;

  const renderRow = (row: (typeof rows)[number]) => (
    // Keyed fragment (not a bare fragment) — row identity across reorders
    // (sorting, filtering) must reconcile by row id, not by position.
    <Fragment key={row.id}>
      <tr
        key={row.id}
        data-slot="row"
        x-class={[
          rowHover,
          row.getIsSelected() && rowSelected,
          onRowClick && clickableRow,
          classNames?.row,
        ]}
        onClick={
          handleRowClick
            ? (event) => handleRowClick(row.original, event)
            : undefined
        }
      >
        {selectable && (
          <TableCell
            data-slot="select-cell"
            data-nav-row={row.id}
            data-nav-col={SELECTION_NAV_ID}
            x-class={[
              checkCellStyle,
              selectionFixedSpec && fixedCell,
              selectionFixedSpec?.edge && fixedLeftEdge,
              row.getIsSelected() && fixedCellSelected,
              navCell,
            ]}
            style={fixedOffsetStyle(selectionFixedSpec)}
            tabIndex={isNavCellActive(row.id, SELECTION_NAV_ID) ? 0 : -1}
            onFocus={(event) => {
              if (event.target !== event.currentTarget) return;
              setActiveCell({ rowId: row.id, columnId: SELECTION_NAV_ID });
            }}
            onKeyDown={(event) =>
              handleNavKeyDown(
                event,
                { rowId: row.id, columnId: SELECTION_NAV_ID },
                false
              )
            }
          >
            <CheckboxCore
              checked={row.getIsSelected()}
              onChange={(checked) => row.toggleSelected(checked)}
              aria-label={`Select row ${row.id}`}
            />
          </TableCell>
        )}
        {row.getVisibleCells().map((cell, cellIndex) => {
          const fixedSpec = fixedById.get(cell.column.id);
          // Editing is resolved per leaf column: the table-level switch
          // gates it, `meta.editor` picks the kind (`'text'` default,
          // `false` opts out).
          const editor: DataTableColumnMeta['editor'] = editable
            ? (cell.column.columnDef.meta?.editor ?? 'text')
            : false;
          const canEdit = editor !== false;
          const isEditing =
            editingCell !== null &&
            editingCell.rowId === row.id &&
            editingCell.columnId === cell.column.id;
          const commitEdit = (next: unknown) => {
            setEditingCell(null);
            const prev = cell.getValue();
            if (!Object.is(next, prev)) {
              onCellEdit?.(row.id, cell.column.id, next, prev);
            }
          };
          return (
            <TableCell
              key={cell.id}
              data-slot="cell"
              data-nav-row={row.id}
              data-nav-col={cell.column.id}
              x-class={[
                fixedSpec && fixedCell,
                fixedSpec?.edge &&
                  (fixedSpec.side === 'left' ? fixedLeftEdge : fixedRightEdge),
                row.getIsSelected() && fixedCellSelected,
                canEdit && editableCell,
                navCell,
              ]}
              style={fixedOffsetStyle(fixedSpec)}
              tabIndex={
                isNavCellActive(row.id, cell.column.id) ? 0 : -1
              }
              onFocus={(event) => {
                if (event.target !== event.currentTarget) return;
                setActiveCell({ rowId: row.id, columnId: cell.column.id });
              }}
              onDoubleClick={
                canEdit && !isEditing
                  ? () => {
                      setActiveCell({
                        rowId: row.id,
                        columnId: cell.column.id,
                      });
                      setEditingCell({
                        rowId: row.id,
                        columnId: cell.column.id,
                      });
                    }
                  : undefined
              }
              onKeyDown={(event) =>
                handleNavKeyDown(
                  event,
                  { rowId: row.id, columnId: cell.column.id },
                  canEdit && !isEditing
                )
              }
            >
              {isEditing && canEdit ? (
                typeof editor === 'function' ? (
                  editor({
                    value: cell.getValue(),
                    row,
                    column: cell.column,
                    onSave: commitEdit,
                    onCancel: () => setEditingCell(null),
                  })
                ) : (
                  <CellEditor
                    kind={editor === 'number' ? 'number' : 'text'}
                    value={cell.getValue()}
                    ariaLabel={`Edit ${columnLabel(cell.column)} in row ${row.id}`}
                    onSave={commitEdit}
                    onCancel={() => setEditingCell(null)}
                  />
                )
              ) : (
                <>
                  {cellIndex === 0 && row.depth > 0 && (
                    <span
                      aria-hidden='true'
                      x-class={[treeIndent]}
                      style={{ width: `calc(var(--haze-space-4) * ${row.depth})` }}
                    />
                  )}
                  {cellIndex === 0 && row.getCanExpand() && (
                    <button
                      type='button'
                      data-slot="expand-button"
                      x-class={[expander]}
                      aria-expanded={row.getIsExpanded()}
                      aria-controls={
                        renderExpandedRow !== undefined
                          ? panelId(row.id)
                          : undefined
                      }
                      aria-label={
                        row.getIsExpanded()
                          ? `Collapse row ${row.id}`
                          : `Expand row ${row.id}`
                      }
                      onClick={row.getToggleExpandedHandler()}
                    >
                      <span data-slot="icon" x-class={[expanderIcon]} aria-hidden='true'>
                        ▸
                      </span>
                    </button>
                  )}
                  <table.FlexRender cell={cell} />
                </>
              )}
            </TableCell>
          );
        })}
      </tr>
      {renderExpandedRow !== undefined &&
        row.getCanExpand() &&
        row.getIsExpanded() && (
          <tr key={`${row.id}-panel`} data-slot="panel-row">
            <TableCell
              colSpan={columnCount}
              data-slot="panel-cell"
              x-class={[panelCell]}
              id={panelId(row.id)}
            >
              {renderExpandedRow(row)}
            </TableCell>
          </tr>
        )}
    </Fragment>
  );

  const renderSkeletonRow = (rowIndex: number) => (
    <tr key={`skeleton-${rowIndex}`} data-slot="row" x-class={[classNames?.row]}>
      {selectable && (
        <TableCell
          data-slot="select-cell"
          x-class={[
            checkCellStyle,
            selectionFixedSpec && fixedCell,
            selectionFixedSpec?.edge && fixedLeftEdge,
          ]}
          style={fixedOffsetStyle(selectionFixedSpec)}
        >
          <Skeleton />
        </TableCell>
      )}
      {leafHeaders.map((header) => {
        const fixedSpec = fixedById.get(header.column.id);
        return (
          <TableCell
            key={header.id}
            data-slot="cell"
            x-class={[
              fixedSpec && fixedCell,
              fixedSpec?.edge &&
                (fixedSpec.side === 'left' ? fixedLeftEdge : fixedRightEdge),
            ]}
            style={fixedOffsetStyle(fixedSpec)}
          >
            <Skeleton />
          </TableCell>
        );
      })}
    </tr>
  );

  const skeletonRows = Array.from(
    { length: pageSize ?? 5 },
    (_, rowIndex) => renderSkeletonRow(rowIndex)
  );

  const emptyRow = (
    <tr data-slot="row" x-class={[classNames?.row]}>
      <TableCell
        colSpan={columnCount}
        data-slot="empty-cell"
        x-class={[emptyCell]}
      >
        {empty ?? <Empty />}
      </TableCell>
    </tr>
  );

  // Filter row: rendered as the first body section directly below the
  // header, one input per filterable leaf column (an empty cell keeps the
  // columns aligned elsewhere). A dedicated tbody keeps the inputs out of
  // the header's `columnheader` semantics; under `stickyHeader` it scrolls
  // away with the body, and in virtualized mode it stays pinned with the
  // header table above the scrolling rows.
  const filterBody = filterable ? (
    <TableBody>
      <tr data-slot="filter-row">
        {selectable && <TableCell data-slot="select-cell">{null}</TableCell>}
        {leafHeaders.map((header) => (
          <TableCell key={`filter-${header.id}`} data-slot="cell">
            {header.column.getCanFilter() ? (
              <Input
                size='sm'
                aria-label={`Filter ${columnLabel(header.column)}`}
                placeholder={strings.filterPlaceholder}
                value={(header.column.getFilterValue() as string | undefined) ?? ''}
                onChange={(event) =>
                  header.column.setFilterValue(event.target.value)
                }
              />
            ) : null}
          </TableCell>
        ))}
      </tr>
    </TableBody>
  ) : undefined;

  // Summary footer: the callback summarizes the filtered data (every row,
  // all pages, tree sub-rows included) — never the skeleton or empty state.
  // Rendered as the table's tfoot in normal mode; in virtualized mode as
  // its own sibling table below the scrolling window (outside the virtual
  // area by construction), sharing the same colgroup for column alignment.
  const summaryRowsArguments = table.getFilteredRowModel().flatRows;
  const summaryRows =
    summary !== undefined && !loading && rows.length > 0
      ? summary(summaryRowsArguments)
      : undefined;
  const summaryTfoot =
    summaryRows !== undefined && summaryRows.length > 0 ? (
      <tfoot
        data-slot="summary"
        x-class={[summaryFoot, stickyFooter && stickyFoot, classNames?.summary]}
      >
        {summaryRows.map((summaryRow, rowIndex) => (
          <tr
            key={`summary-${rowIndex}`}
            data-slot="row"
            x-class={[classNames?.row]}
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

  // Column-settings menu: every hideable leaf column, hidden ones included
  // (so they can come back). The checkbox inputs carry `menuitemcheckbox` —
  // the role a `menu` must own — while the wrapping labels stay generic, so
  // the structure is both axe-valid and operable (Space toggles, Tab walks).
  const columnMenu = columnToggle ? (
    <DropdownMenu className={pageSize !== undefined ? footerMenu : undefined}>
      <DropdownMenuTrigger x-class={[columnsTrigger]}>
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <label key={column.id} data-slot="column-toggle-item" x-class={[toggleRow]}>
              <CheckboxCore
                role='menuitemcheckbox'
                aria-checked={column.getIsVisible()}
                checked={column.getIsVisible()}
                onChange={() => column.toggleVisibility()}
                aria-label={`Show ${columnLabel(column)}`}
              />
              <span data-slot="label">{columnLabel(column)}</span>
            </label>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : undefined;

  // The toolbar strip renders above the table whenever the slot or the
  // column-toggle trigger contributes something; while paginating the
  // trigger moves into the footer row, so the strip carries the slot alone.
  const showToolbar =
    toolbarSlot != null || (columnMenu !== undefined && pageSize === undefined);
  const keyboardHintId = `${instanceId}-keyboard-nav`;

  // The table's content, optionally wrapped in the drag region once the
  // reorder kit has loaded. The region renders no DOM of its own except
  // dnd-kit's screen-reader live regions, which land here — inside the
  // root div but outside the `<table>`, where a stray `<div>` would be
  // invalid markup (SortableTabList keeps them out of its tablist for
  // the same reason).
  const tableContent = (
    <>
      <VisuallyHidden id={keyboardHintId}>
        {KEYBOARD_HINT +
          (reorderActive ? KEYBOARD_HINT_REORDER : '') +
          (editable ? KEYBOARD_HINT_EDIT : '')}
      </VisuallyHidden>
      {showToolbar && (
        <div data-slot="toolbar" x-class={[toolbar, classNames?.toolbar]}>
          {toolbarSlot}
          {columnMenu !== undefined && pageSize === undefined
            ? columnMenu
            : null}
        </div>
      )}
      {virtual ? (
        <div ref={virtualAreaRef} data-slot="scroll-area" x-class={[virtualArea]}>
          <table data-slot="table" x-class={[tableBase, densityClass, fixedLayout]} {...rest}>
            {colgroup}
            {header}
            {filterBody}
          </table>
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
          <table data-slot="table" x-class={[tableBase, densityClass]} {...rest}>
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
          </table>
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
      )}
      {pageSize !== undefined && (
        <div data-slot="pagination" x-class={[footer, classNames?.footer]}>
          {columnMenu}
          {/* Manual mode: the server owns the row total, so the footer's
           * page math must come from `pageCount` (fed as
           * pageCount × pageSize items — Pagination derives pages from
           * `total`). Locally the total follows the header filter menus
           * (`tableData`), so pages shrink with the filtered rows. */}
          <Pagination
            page={pageCtrl}
            total={
              manual && pageCount !== undefined
                ? Math.max(0, pageCount) * pageSize
                : tableData.length
            }
            pageSize={pageSize}
            size='sm'
          />
        </div>
      )}
    </>
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
