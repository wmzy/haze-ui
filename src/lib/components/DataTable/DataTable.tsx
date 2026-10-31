import type {
  ComponentPropsWithoutRef,
  MouseEvent,
  ReactNode,
  Ref,
} from 'react';
import type { Control, ControlOrValue } from 'react-use-control';
import type {
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
import type { ColumnReorderKit } from './data-table-header';
import type { DataTableRowsView } from './data-table-rows';
import type { FixedCellSpec } from './data-table-shared';
import type { NavCell } from './use-cell-navigation';

import type { VirtualListHandle } from '../VirtualList';

import type { DataTableFiltersState } from './filters';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTable } from '@tanstack/react-table';
import { css } from '@linaria/core';
import { useControl, useThru, watch, isControl } from 'react-use-control';


import { useDirection } from '../../utils/direction';
import { mergeRefs } from '../../utils/refs';

import { CheckboxCore } from '../Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { useStrings } from '../LocaleProvider';
import { Pagination } from '../Pagination';
import { TableBody, TableCell } from '../Table';

import { TableClassNamesProvider } from '../Table/TableContext';
import { baseStyle as tableBase } from '../Table/table-styles';
import { VisuallyHidden } from '../VisuallyHidden';
import { VirtualList } from '../VirtualList';

import { renderDataTableHeader } from './data-table-header';
import {
  renderDataTableRow,
  renderEmptyRow,
  renderFilterBody,
  renderSkeletonRow,
} from './data-table-rows';
import {
  checkCell,
  checkCellCol,
  columnLabel,
  SELECTION_COL_WIDTH,
  SELECTION_NAV_ID,
  SELECTION_WIDTH_PART,
  sumLengths,
} from './data-table-shared';
import { dataTableFeatures } from './features';
import { applyColumnFilters } from './filters';
import { useCellNavigation } from './use-cell-navigation';

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

/** Moves one entry of an array to another index (the `@dnd-kit` helper,
 * inlined so this dnd-free module need not depend on it). */
function arrayMove<T>(array: readonly T[], from: number, to: number): T[] {
  const next = array.slice();
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return next;
  next.splice(to, 0, moved);
  return next;
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

/** Default `virtualized` row height per density step: 2 × the step's block
 * cell padding + one `--haze-text-sm` (14px) line box + the 1px row
 * border — sm 2×4, md 2×8, lg 2×12. */
const VIRTUAL_ROW_HEIGHTS = { sm: 23, md: 34, lg: 39 } as const;

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

/* Zero-footprint sentinel after the body — an IntersectionObserver target
 * only. 1px tall so engines that skip zero-area targets still report it. */
const endSentinelClass = css`
  height: 1px;
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
  const [editingCell, setEditingCell] = useState<NavCell | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // The consumer ref and the internal rootRef both land on the wrapper
  // through mergeRefs.
  const setRootRef = mergeRefs(rootRef, ref);
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

  // eslint-disable-next-line react-hooks/refs -- the ref objects are forwarded into the render function for event-time access only (select-all input lookup, reorder focus restore), the same contract a JSX ref prop carries.
  const header = renderDataTableHeader({
    table,
    headerGroups,
    selectable,
    sticky: stickyHeader,
    checkCellStyle,
    selectionFixedSpec,
    fixedById,
    selectAllRef,
    selectAllLabel: strings.selectAll,
    resizable,
    nudgeColumnSize,
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
    checkCellStyle,
    selectionFixedSpec,
    fixedById,
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

  const renderRow = (row: (typeof rows)[number]) =>
    renderDataTableRow(row, rowsView);

  const skeletonRows = Array.from(
    { length: pageSize ?? 5 },
    (_, rowIndex) => renderSkeletonRow(rowsView, rowIndex)
  );

  const emptyRow = renderEmptyRow(rowsView);

  // Filter row: rendered as the first body section directly below the
  // header (see data-table-rows.tsx) — only while `filterable` is on.
  const filterBody = filterable ? renderFilterBody(rowsView) : undefined;

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
        {strings.columns}
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
