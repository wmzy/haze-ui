import type { Header, HeaderGroup, RowData } from '@tanstack/react-table';
import type { RefObject } from 'react';

import type { ColumnReorderKit } from './data-table-header';
import type { DataTableState } from './use-data-table-state';

import { useEffect, useRef, useState } from 'react';

import { dataTableFeatures } from './features';

/** Moves one entry of an array to another index (the `@dnd-kit` helper,
 * inlined so this dnd-free module need not depend on it). */
function arrayMove<T>(array: readonly T[], from: number, to: number): T[] {
  const next = array.slice();
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return next;
  next.splice(to, 0, moved);
  return next;
}

/**
 * ── Column reordering ─────────────────────────────────────────────────
 * The reorder model behind `columnReorderable`: which leaf columns form
 * the reordering set, the lazy drag kit (loaded the first time the mode is
 * active), the move that writes TanStack's `columnOrder` and the focus
 * restore keyboard moves rely on. The grips themselves render dnd-free
 * from data-table-header.tsx.
 */
export function useColumnReorder<TData extends RowData>({
  columnReorderable,
  headerGroups,
  leafHeaders,
  setColumnOrder,
  rootRef,
}: {
  /** The `columnReorderable` prop. */
  columnReorderable: boolean;
  /** Header groups of the current table — more than one means grouped
   *  (nested) headers, which have no single slot to move. */
  headerGroups: HeaderGroup<typeof dataTableFeatures, TData>[];
  /** Leaf headers in their current order — the reordering set. */
  leafHeaders: Header<typeof dataTableFeatures, TData>[];
  setColumnOrder: DataTableState['setColumnOrder'];
  rootRef: RefObject<HTMLDivElement | null>;
}) {
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
  // engine-import rules. The grips themselves render dnd-free from
  // data-table-header.tsx: only pointer dragging waits for the kit.
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

  return { reorderActive, reorderKit, leafIds, moveColumn, reorderFocusRef };
}
