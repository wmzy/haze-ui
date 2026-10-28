import type {
  Dispatch,
  KeyboardEvent,
  RefObject,
  SetStateAction,
} from 'react';

import { useCallback, useState } from 'react';

import { getDirection } from '../../utils/direction';
import { usePendingFocus } from '../../utils/use-pending-focus';

/** One tbody cell in the roving-tabindex navigation model, keyed by row id
 *  and column id (the selection column uses `SELECTION_NAV_ID`). */
export type NavCell = { rowId: string; columnId: string };

/** The navigation model `useCellNavigation` reports back to the renderer. */
export type CellNavigationModel = {
  /** Roving-tabindex stop test: `true` for the active cell, or for the
   *  first rendered cell while no cell is active yet. */
  isNavCellActive: (rowId: string, columnId: string) => boolean;
  /** The cell keymap: arrows/Home/End/PageUp/PageDown move the stop,
   *  Enter/F2 enter edit mode on editable cells. Bound to every data and
   *  selection cell's `onKeyDown`. */
  handleNavKeyDown: (
    event: KeyboardEvent<HTMLElement>,
    cell: NavCell,
    canEditTarget: boolean
  ) => void;
  /** Roving-tabindex cursor setter — the renderer reports focus landing on
   *  a cell through it. */
  setActiveCell: Dispatch<SetStateAction<NavCell | null>>;
};

/**
 * ── Cell keyboard navigation (roving tabindex) ────────────────────────
 * Every tbody cell participates: exactly one carries tabindex=0 (the
 * active cell, or the first rendered cell before any interaction), the
 * rest -1. Arrow keys move the active cell, Enter/F2 enter edit mode on
 * editable cells, and Tab is never intercepted — interactive cell content
 * and the resize handles keep their own independent tab stops.
 *
 * Focus requests for a target outside the virtualized window resolve
 * through the shared pending-focus loop (`usePendingFocus`): the row is
 * scrolled in through `scrollToIndex` and focused by the retry effect
 * once it mounts — the same contract as Tree's keyboard focus moves.
 */
export function useCellNavigation({
  navRowIds,
  navColumnIds,
  rootRef,
  virtual,
  scrollToIndex,
  setEditingCell,
}: {
  /** Rendered row ids in body order (the whole model in normal mode, the
   *  window slice's superset the table reasons about in virtual mode). */
  navRowIds: string[];
  /** Navigable column ids: the selection pseudo-column first (when
   *  present), then the leaf columns in order. */
  navColumnIds: string[];
  /** Root element the rendered cells live under — `[data-nav-row]` owners
   *  are looked up inside it. */
  rootRef: RefObject<HTMLDivElement | null>;
  /** Virtualized mode: unresolved focus targets scroll here first. */
  virtual: boolean;
  scrollToIndex: (index: number) => void;
  /** Enter/F2 commit: begins edit mode on the active cell. */
  setEditingCell: Dispatch<SetStateAction<NavCell | null>>;
}): CellNavigationModel {
  // Roving-tabindex cursor: the single tbody cell carrying tabindex=0.
  // Purely internal UI state (like hover tracking) keyed by row/column id,
  // so it survives reorders and the virtualized window; null defers to the
  // first rendered cell until the first focus/keypress.
  const [activeCell, setActiveCell] = useState<NavCell | null>(null);

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

  const findNavCell = useCallback(
    (cell: NavCell) => {
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
    },
    [rootRef]
  );

  // Virtualized targets mount one commit after scrollToIndex — the retry
  // loop focuses them as soon as they appear, then clears the request.
  const pendingFocus = usePendingFocus((cell: NavCell) => {
    const target = findNavCell(cell);
    if (!target) return false;
    target.focus();
    return true;
  });

  // Focus a navigation target: cells inside the rendered tree (normal mode,
  // or within the virtualized window) focus directly; a virtualized target
  // outside the window is scrolled in through VirtualList's scrollToIndex
  // and focused by the pending-focus loop once its row mounts.
  const focusNavCell = (cell: NavCell) => {
    if (pendingFocus.attemptNow(cell)) return;
    if (!virtual) return;
    const index = navRowIds.indexOf(cell.rowId);
    if (index >= 0) {
      scrollToIndex(index);
      pendingFocus.request(cell);
    }
  };

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

  return { isNavCellActive, handleNavKeyDown, setActiveCell };
}
