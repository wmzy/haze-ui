import type { ReactNode } from 'react';
import type { RowData, ReactTable } from '@tanstack/react-table';

import { CheckboxCore } from '../Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../DropdownMenu';

import { columnLabel } from './data-table-shared';
import { columnsTrigger, footerMenu, toggleRow } from './data-table-styles';
import { dataTableFeatures } from './features';

/**
 * ── Column-settings menu ──────────────────────────────────────────────
 * Every hideable leaf column, hidden ones included (so they can come
 * back). The checkbox inputs carry `menuitemcheckbox` — the role a `menu`
 * must own — while the wrapping labels stay generic, so the structure is
 * both axe-valid and operable (Space toggles, Tab walks). `undefined` while
 * `columnToggle` is off. Extracted verbatim from `DataTable` —
 * behavior-neutral.
 */
export function renderColumnSettings<TData extends RowData>({
  table,
  columnToggle,
  inFooter,
  label,
}: {
  table: ReactTable<typeof dataTableFeatures, TData>;
  /** The `columnToggle` prop. */
  columnToggle: boolean;
  /** Paginating tables render the menu inside the pagination row, where
   *  its wrapper takes the free space so the trigger pins to the start
   *  edge and Pagination keeps the end edge. */
  inFooter: boolean;
  /** The trigger's label (`strings.columns`). */
  label: string;
}): ReactNode {
  if (!columnToggle) return undefined;
  return (
    <DropdownMenu className={inFooter ? footerMenu : undefined}>
      <DropdownMenuTrigger x-class={[columnsTrigger]}>
        {label}
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
  );
}
