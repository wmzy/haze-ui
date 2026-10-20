import type { ReactNode } from 'react';

import { horizontalListSortingStrategy } from '../../utils/sortable-shared';
import { SortableItem, SortableRegion } from '../../utils/sortable';

/**
 * The lazily loaded drag wiring behind DataTable's `columnReorderable` —
 * the Chart/recharts contract inverted: DataTable is a base component, so
 * its static import graph must stay free of the `@dnd-kit` runtime (the
 * dist-esm contract's peer import rules); the table imports this module
 * dynamically the first time column reordering is actually enabled. Only
 * the pointer-drag mechanics live here — the reorder grips (focusable
 * buttons with their Alt+Arrow keyboard model) render from DataTable.tsx
 * with no dnd dependency at all, so keyboard reordering works even before
 * this chunk arrives and nothing about the table changes for consumers
 * that never opt in.
 *
 * Reaches @dnd-kit only through the utils sortable modules — never
 * directly — so no dist file outside the contract's allowlist grows an
 * engine import. Not part of the public barrel.
 */

type ColumnReorderRegionProps = {
  /** Visible leaf column ids in current order — one sortable item each. */
  ids: string[];
  /** Index move resolved from a completed pointer drag. */
  onMove: (from: number, to: number) => void;
  children: ReactNode;
};

/** DndContext + SortableContext around the table root. Renders no DOM of
 * its own except dnd-kit's screen-reader live regions, which land inside
 * the DataTable root div — outside the `<table>`, where a stray `<div>`
 * would be invalid markup (the SortableTabList precedent keeps them out
 * of its tablist for the same reason). */
export function ColumnReorderRegion({
  ids,
  onMove,
  children,
}: ColumnReorderRegionProps) {
  return (
    <SortableRegion
      ids={ids}
      strategy={horizontalListSortingStrategy}
      onMove={onMove}
    >
      {children}
    </SortableRegion>
  );
}

export { SortableItem as ColumnReorderItem };
