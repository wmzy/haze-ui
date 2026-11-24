import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { RowData, ReactTable } from '@tanstack/react-table';

import type { DataTableClassNames } from './DataTable';

import { Pagination } from '../Pagination';
import { VisuallyHidden } from '../VisuallyHidden';

import { renderColumnSettings } from './column-settings';
import { footer, toolbar } from './data-table-styles';
import { dataTableFeatures } from './features';

/** Keyboard model description for the sr-only hint (English default —
 * like the generated cell/row labels, not routed through locale packs).
 * The edit sentence is appended only while `editable`. */
const KEYBOARD_HINT =
  'Use the arrow keys to move between cells. Home and End go to the start or end of the row; PageUp and PageDown go to the first or last row.';
const KEYBOARD_HINT_EDIT =
  ' Press Enter or F2 to edit the focused cell; Escape cancels and returns to navigation.';
const KEYBOARD_HINT_REORDER =
  ' Focus a column reorder grip and press Alt with the left or right arrow key to move its column.';

/** What the pagination row is driven with — `undefined` while the table
 *  renders every row at once (no `pageSize`). */
type PaginationView = {
  page: ControlOrValue<number>;
  pageSize: number;
  manual: boolean;
  pageCount: number | undefined;
  /** Rows the local page math counts — the header-filtered data. */
  dataLength: number;
};

/** What the chrome renders from — assembled by `DataTable` each commit. */
type DataTableChromeView<TData extends RowData> = {
  /** The id the root wrapper's `aria-describedby` names. */
  hintId: string;
  reorderActive: boolean;
  editable: boolean;
  /** The `classNames` prop — its `toolbar` and `footer` slots land here. */
  classNames: DataTableClassNames | undefined;
  /** The `toolbar` prop. */
  toolbar: ReactNode;
  table: ReactTable<typeof dataTableFeatures, TData>;
  /** The `columnToggle` prop. */
  columnToggle: boolean;
  /** The column-settings trigger's label (`strings.columns`). */
  columnsLabel: string;
  pagination: PaginationView | undefined;
};

/** The sr-only keyboard model hint the root's `aria-describedby` points
 *  at — the reorder sentence joins while column reordering is active and
 *  the edit sentence while `editable`. */
function renderKeyboardHint({
  id,
  reorderActive,
  editable,
}: {
  id: string;
  reorderActive: boolean;
  editable: boolean;
}): ReactNode {
  return (
    <VisuallyHidden id={id}>
      {KEYBOARD_HINT +
        (reorderActive ? KEYBOARD_HINT_REORDER : '') +
        (editable ? KEYBOARD_HINT_EDIT : '')}
    </VisuallyHidden>
  );
}

/** The toolbar strip above the table's inline-end corner: custom actions
 *  (the `toolbar` slot) plus, when not paginating, the column-settings
 *  trigger. Wrap keeps long toolbars from overflowing narrow tables; it
 *  renders nothing while neither contributes content. */
function renderToolbar({
  className,
  slot,
  menu,
}: {
  className: string | undefined;
  slot: ReactNode;
  /** The column-settings menu while it belongs to the strip — `undefined`
   *  while paginating (it moves into the footer row) or switched off. */
  menu: ReactNode;
}): ReactNode {
  if (slot == null && menu === undefined) return null;
  return (
    <div data-slot="toolbar" x-class={[toolbar, className]}>
      {slot}
      {menu !== undefined ? menu : null}
    </div>
  );
}

/** The pagination row under the table: the column-settings menu (its
 *  wrapper takes the free space, so Pagination keeps the inline-end edge)
 *  and the `Pagination` control. */
function renderPagination({
  className,
  menu,
  page,
  pageSize,
  manual,
  pageCount,
  dataLength,
}: {
  className: string | undefined;
  menu: ReactNode;
} & PaginationView): ReactNode {
  return (
    <div data-slot="pagination" x-class={[footer, className]}>
      {menu}
      {/* Manual mode: the server owns the row total, so the footer's
       * page math must come from `pageCount` (fed as
       * pageCount × pageSize items — Pagination derives pages from
       * `total`). Locally the total follows the header filter menus
       * (`tableData`), so pages shrink with the filtered rows. */}
      <Pagination
        page={page}
        total={
          manual && pageCount !== undefined
            ? Math.max(0, pageCount) * pageSize
            : dataLength
        }
        pageSize={pageSize}
        size='sm'
      />
    </div>
  );
}

/**
 * ── The chrome around the table body ──────────────────────────────────
 * The sr-only keyboard model hint, the toolbar strip above the scroll
 * region and the pagination row below it, around the body given as
 * `children`. The column-settings menu lives in the strip while the
 * table renders every row at once and moves into the pagination row
 * (inline end) once it paginates. Extracted verbatim from `DataTable` —
 * behavior-neutral.
 */
export function renderDataTableChrome<TData extends RowData>(
  {
    hintId,
    reorderActive,
    editable,
    classNames,
    toolbar: toolbarSlot,
    table,
    columnToggle,
    columnsLabel,
    pagination,
  }: DataTableChromeView<TData>,
  children: ReactNode
): ReactNode {
  // Column-settings menu (column-settings.tsx). While paginating it moves
  // into the footer row, where its wrapper takes the free space so the
  // trigger pins to the start edge and Pagination keeps the end edge.
  const columnMenu = renderColumnSettings({
    table,
    columnToggle,
    inFooter: pagination !== undefined,
    label: columnsLabel,
  });

  return (
    <>
      {renderKeyboardHint({ id: hintId, reorderActive, editable })}
      {renderToolbar({
        className: classNames?.toolbar,
        slot: toolbarSlot,
        menu: pagination === undefined ? columnMenu : undefined,
      })}
      {children}
      {pagination !== undefined &&
        renderPagination({
          className: classNames?.footer,
          menu: columnMenu,
          ...pagination,
        })}
    </>
  );
}
