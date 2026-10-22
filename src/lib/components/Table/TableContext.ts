import { createContext, useContext } from 'react';

/**
 * Semantic slot classes (AntD v6 `classNames` shape) for the Table
 * family: declared once on `<Table>` and distributed to every part
 * through context — the sub-components stay prop-light while one
 * record themes the whole table. Consumer classes are appended at the
 * end of each part's class list (able to override component defaults);
 * per-part `className` props remain for one-off tweaks and still land
 * after the slot class. Parts rendered outside a `<Table>` (bare
 * `<TableHead>` etc.) receive nothing.
 */
export type TableClassNames = {
  /** The scrolling wrapper `<div>` (`data-slot='table-container'`) `<Table>` renders. */
  wrapper?: string;
  /** Every `<TableHead>` (`<thead>`, `data-slot='header'`). */
  head?: string;
  /** Every `<TableBody>` (`<tbody>`, `data-slot='body'`). */
  body?: string;
  /** Every `<TableRow>` (`<tr>`, `data-slot='row'`). */
  row?: string;
  /** Every `<TableCell>` (`<td>`/`<th>`, `data-slot='cell'`). */
  cell?: string;
};

const TableClassNamesContext = createContext<TableClassNames | undefined>(
  undefined
);

export const TableClassNamesProvider = TableClassNamesContext.Provider;

/** The slot record declared on the nearest `<Table>` (or a table-shaped
 *  host like `DataTable`); `undefined` outside one. Decorative only —
 *  never throws, so bare sub-components keep rendering. */
export function useTableClassNames() {
  return useContext(TableClassNamesContext);
}
