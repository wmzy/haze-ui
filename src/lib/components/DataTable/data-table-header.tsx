import type {
  KeyboardEvent,
  PointerEventHandler,
  Ref,
  RefObject,
  ReactNode,
} from 'react';
import type {
  Header,
  HeaderGroup,
  RowData,
  ReactTable,
} from '@tanstack/react-table';
import type { FixedCellSpec } from './data-table-shared';
import type { DataTableFiltersState } from './filters';

import { css } from '@linaria/core';

import { getDirection, inlineAxisKeys } from '../../utils/direction';
import { sortableHandle, useSortableHandle } from '../../utils/sortable-handle';

import { CheckboxCore } from '../Checkbox';
import { TableCell, TableHead } from '../Table';

import ColumnFilterTrigger from './column-filter';
import {
  columnLabel,
  fixedCell,
  fixedHeadCell,
  fixedOffsetStyle,
  stickyHead,
} from './data-table-shared';
import { dataTableFeatures } from './features';

/** The lazily loaded drag kit behind `columnReorderable` — see
 * `column-reorder.tsx`. Typed through the dynamic import so the static
 * import graph of every module in this directory never touches
 * `@dnd-kit`. */
export type ColumnReorderKit = typeof import('./column-reorder');

/** Everything the header render reads — assembled by `DataTable` each
 * commit and handed to `renderDataTableHeader` as one view object (a
 * plain render function, not a component: the `<tr>`/`<th>` sequence it
 * returns keeps reconciling in the parent's tree exactly as before the
 * extraction). */
export type DataTableHeaderView<TData extends RowData> = {
  table: ReactTable<typeof dataTableFeatures, TData>;
  headerGroups: HeaderGroup<typeof dataTableFeatures, TData>[];
  selectable: boolean;
  sticky: boolean;
  /** Selection-cell class: `checkCell` without a colgroup, the `nowrap`
   *  twin wherever one owns the width. */
  checkCellStyle: string;
  selectionFixedSpec: FixedCellSpec | undefined;
  fixedById: Map<string, FixedCellSpec>;
  /** Ref to the select-all checkbox wrapper (the indeterminate DOM
   *  property lands on the input after every commit). */
  selectAllRef: Ref<HTMLSpanElement>;
  selectAllLabel: string;
  resizable: boolean;
  /** Keyboard nudge for one resize handle: ±px off the committed size,
   *  clamped to the column's min/max. */
  nudgeColumnSize: (
    header: Header<typeof dataTableFeatures, TData>,
    delta: number
  ) => void;
  filters: DataTableFiltersState;
  setColumnFilter: (columnId: string, values: unknown[]) => void;
  reorderActive: boolean;
  reorderKit: ColumnReorderKit | null;
  /** Visible leaf ids in current order — the reordering set. */
  leafIds: string[];
  moveColumn: (from: number, to: number) => void;
  /** Keyboard reorders re-land focus on the travelling grip through this
   *  ref (consumed by an effect in `DataTable`). */
  reorderFocusRef: RefObject<string | null>;
};

/** The reorder grip inside a header cell: a focusable button carrying the
 * keyboard reorder model — Alt+ArrowLeft/ArrowRight move the column one
 * slot, mirrored under RTL (read from the DOM at event time, the resize
 * handle's contract). Pointer dragging arms through the SortableItem
 * wrapper once the lazily loaded column-reorder kit arrives: the grip
 * consumes its activator seam, which is null until then, so the keyboard
 * model works even before (or without) that chunk. */
// eslint-disable-next-line react-refresh/only-export-components -- renderDataTableHeader 是非组件导出、ReorderGrip 是文件内组件；本文件只被 DataTable.tsx 单点消费，无独立 fast-refresh 边界（Card/TagGroup/Schedule 同款 suppression）。
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
        // Forward = towards the inline end: the arrows mirror under
        // RTL, read from the DOM at event time (inlineAxisKeys).
        const { next: nextKey } = inlineAxisKeys(
          'horizontal',
          getDirection(event.currentTarget)
        );
        onMove(event.key === nextKey);
      }}
      aria-label={`Reorder ${label}`}
      aria-keyshortcuts='Alt+ArrowLeft Alt+ArrowRight'
      x-class={[sortableHandle, reorderGripClass]}
    >
      <span aria-hidden='true'>⠿</span>
    </button>
  );
}

/* Resizable header cells anchor the absolutely positioned drag handle.
 * `position: relative` only wins where the header cell is neither sticky
 * nor fixed — under `stickyHeader` the `.stickyHead th` rule (class + type
 * specificity) keeps `position: sticky`, and on a fixed column the
 * later-defined `fixedCell` rule below keeps it too; sticky positioning
 * anchors the handle exactly as well, being a positioned box either way. */
const resizableHead = css`
  position: relative;
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

/** The `<thead>`: grouped or flat header rows, the select-all cell, sort
 * buttons, filter triggers, resize handles and reorder grips. Extracted
 * verbatim from `DataTable` — behavior-neutral. */
export function renderDataTableHeader<TData extends RowData>(
  view: DataTableHeaderView<TData>
): ReactNode {
  const {
    table,
    headerGroups,
    selectable,
    sticky,
    checkCellStyle,
    selectionFixedSpec,
    fixedById,
    selectAllRef,
    selectAllLabel,
    resizable,
    nudgeColumnSize,
    filters,
    setColumnFilter,
    reorderActive,
    reorderKit,
    leafIds,
    moveColumn,
    reorderFocusRef,
  } = view;

  return (
    <TableHead className={sticky ? stickyHead : undefined}>
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
                  aria-label={selectAllLabel}
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
                      // direction (inlineAxisKeys, same contract as
                      // Calendar).
                      const { next: nextKey } = inlineAxisKeys(
                        'horizontal',
                        getDirection(event.currentTarget)
                      );
                      const grow = event.key === nextKey;
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
}
