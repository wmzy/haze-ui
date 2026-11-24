import type { ReactTable, RowData } from '@tanstack/react-table';

import { useEffect, useRef } from 'react';

import { dataTableFeatures } from './features';

/**
 * The select-all checkbox of the header's selection cell: the ref its
 * wrapper span carries, plus the commit-time sync of the input's
 * `indeterminate` DOM property — React has no such prop (it strips the
 * attribute), so it is set on the wrapped input after every commit.
 */
export function useSelectAll<TData extends RowData>(
  table: ReactTable<typeof dataTableFeatures, TData>
) {
  const selectAllRef = useRef<HTMLSpanElement>(null);
  const indeterminate =
    table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
  useEffect(() => {
    const input = selectAllRef.current?.querySelector('input');
    if (input) input.indeterminate = indeterminate;
  });
  return selectAllRef;
}
