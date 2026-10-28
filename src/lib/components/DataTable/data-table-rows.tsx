import type {
  Dispatch,
  MouseEvent,
  ReactNode,
  SetStateAction,
} from 'react';
import type {
  Header,
  Row,
  RowData,
  ReactTable,
} from '@tanstack/react-table';
import type { FixedCellSpec } from './data-table-shared';
import type { DataTableColumnMeta } from './features';
import type { CellNavigationModel, NavCell } from './use-cell-navigation';

import { css } from '@linaria/core';
import { Fragment } from 'react';

import { CheckboxCore } from '../Checkbox';
import { Empty } from '../Empty';
import { Input } from '../Input';
import { Skeleton } from '../Skeleton';
import { TableBody, TableCell } from '../Table';

import CellEditor from './CellEditor';
import {
  columnLabel,
  fixedCell,
  fixedCellSelected,
  fixedLeftEdge,
  fixedOffsetStyle,
  fixedRightEdge,
  SELECTION_NAV_ID,
} from './data-table-shared';
import { dataTableFeatures } from './features';

/*
 * Body-section rendering of the DataTable split: data rows (with the
 * selection cell, inline editors, tree expanders and expansion panels),
 * the loading skeleton, the empty state and the filter row — extracted
 * verbatim from `DataTable` as plain render functions over one view
 * object, so the reconciled element sequence is unchanged.
 */

/** Everything the body renders read — assembled by `DataTable` each
 *  commit. */
export type DataTableRowsView<TData extends RowData> = {
  table: ReactTable<typeof dataTableFeatures, TData>;
  selectable: boolean;
  leafHeaders: Header<typeof dataTableFeatures, TData>[];
  /** Selection-cell class: `checkCell` without a colgroup, the `nowrap`
   *  twin wherever one owns the width. */
  checkCellStyle: string;
  selectionFixedSpec: FixedCellSpec | undefined;
  fixedById: Map<string, FixedCellSpec>;
  /** `classNames.row` slot class. */
  rowClassName: string | undefined;
  /** Pre-guarded row click handler (clicks in interactive cell content
   *  already filtered out). */
  handleRowClick:
    | ((row: TData, event: MouseEvent<HTMLTableRowElement>) => void)
    | undefined;
  isNavCellActive: CellNavigationModel['isNavCellActive'];
  setActiveCell: Dispatch<SetStateAction<NavCell | null>>;
  handleNavKeyDown: CellNavigationModel['handleNavKeyDown'];
  editable: boolean;
  editingCell: NavCell | null;
  setEditingCell: Dispatch<SetStateAction<NavCell | null>>;
  onCellEdit:
    | ((
        rowId: string,
        columnId: string,
        nextValue: unknown,
        prevValue: unknown
      ) => void)
    | undefined;
  renderExpandedRow:
    | ((row: Row<typeof dataTableFeatures, TData>) => ReactNode)
    | undefined;
  /** useId instance seed for the expansion-panel row ids. */
  instanceId: string;
  /** Total rendered column count (leaf columns + selection). */
  columnCount: number;
  /** Custom empty-state node; defaults to the `Empty` component. */
  empty: ReactNode;
  filterPlaceholder: string;
};

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

const emptyCell = css`
  padding: 0;
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

/** One data row: the selection cell, the leaf cells (editors, tree
 *  indent, expanders) and the expansion panel row when open. Keyed
 *  fragment (not a bare fragment) — row identity across reorders
 *  (sorting, filtering) must reconcile by row id, not by position. */
export function renderDataTableRow<TData extends RowData>(
  row: Row<typeof dataTableFeatures, TData>,
  view: DataTableRowsView<TData>
): ReactNode {
  const {
    table,
    selectable,
    checkCellStyle,
    selectionFixedSpec,
    fixedById,
    rowClassName,
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
  } = view;

  // Expansion panel row id, referenced by the expander's `aria-controls`.
  // Row ids are consumer-defined, so stray whitespace is neutralized.
  const panelId = (rowId: string) =>
    `${instanceId}-${rowId.replace(/\s+/g, '-')}-panel`;

  return (
    // Keyed fragment (not a bare fragment) — row identity across reorders
    // (sorting, filtering) must reconcile by row id, not by position.
    <Fragment key={row.id}>
      <tr
        key={row.id}
        data-slot="row"
        x-class={[
          rowHover,
          row.getIsSelected() && rowSelected,
          handleRowClick && clickableRow,
          rowClassName,
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
}

/** One skeleton row: a `Skeleton` per rendered cell, selection included. */
export function renderSkeletonRow<TData extends RowData>(
  view: DataTableRowsView<TData>,
  rowIndex: number
): ReactNode {
  const {
    selectable,
    leafHeaders,
    checkCellStyle,
    selectionFixedSpec,
    fixedById,
    rowClassName,
  } = view;
  return (
    <tr key={`skeleton-${rowIndex}`} data-slot="row" x-class={[rowClassName]}>
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
}

/** The empty state: one full-width cell across every rendered column. */
export function renderEmptyRow<TData extends RowData>(
  view: DataTableRowsView<TData>
): ReactNode {
  const { columnCount, rowClassName, empty } = view;
  return (
    <tr data-slot="row" x-class={[rowClassName]}>
      <TableCell
        colSpan={columnCount}
        data-slot="empty-cell"
        x-class={[emptyCell]}
      >
        {empty ?? <Empty />}
      </TableCell>
    </tr>
  );
}

/** The filter row: rendered as the first body section directly below the
 *  header, one input per filterable leaf column (an empty cell keeps the
 *  columns aligned elsewhere). A dedicated tbody keeps the inputs out of
 *  the header's `columnheader` semantics; under `stickyHeader` it scrolls
 *  away with the body, and in virtualized mode it stays pinned with the
 *  header table above the scrolling rows. */
export function renderFilterBody<TData extends RowData>(
  view: DataTableRowsView<TData>
): ReactNode {
  const { selectable, leafHeaders, filterPlaceholder } = view;
  return (
    <TableBody>
      <tr data-slot="filter-row">
        {selectable && <TableCell data-slot="select-cell">{null}</TableCell>}
        {leafHeaders.map((header) => (
          <TableCell key={`filter-${header.id}`} data-slot="cell">
            {header.column.getCanFilter() ? (
              <Input
                size='sm'
                aria-label={`Filter ${columnLabel(header.column)}`}
                placeholder={filterPlaceholder}
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
  );
}
