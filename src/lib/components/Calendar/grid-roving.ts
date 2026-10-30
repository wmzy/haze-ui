/* Calendar grid keyboard roving — extracted verbatim from Calendar.tsx
 * (wave-6): the shared WAI-ARIA grid pattern walker (useGridRoving,
 * module-private) behind both packaged wrappers (useGridKeyboard over
 * the 7-column day grid, useSelectorGridKeyboard over the 3/4-column
 * period grids) plus the button-list helpers they share. Pure DOM
 * logic, no css. */
import type {
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
} from 'react';

import {
  addMonths,
  formatDate,
  getDaysInMonth,
} from '../../utils/date-math';
import { getDirection } from '../../utils/direction';
import { nextEnabledIndex } from '../../utils/skip-walker';

/** Day buttons of the rendered grid in DOM order (outside months and
 * disabled days included — `focusFrom` skips the disabled ones). */
export function dayButtons(grid: HTMLElement | null): HTMLButtonElement[] {
  return Array.from(
    grid?.querySelectorAll<HTMLButtonElement>('button') ?? []
  );
}

/**
 * Move focus by `delta` slots on the 7-column grid, skipping disabled
 * days in the direction of travel and stopping at the grid's edges (the
 * month boundary is a real boundary — outside-month cells are rendered
 * on both sides of it).
 */
function focusFrom(
  buttons: HTMLButtonElement[],
  from: number,
  delta: number
): number | null {
  return nextEnabledIndex(
    buttons.length,
    (index) => buttons[index]!.disabled,
    from,
    delta
  );
}

/**
 * Shared grid keyboard roving (WAI-ARIA grid pattern) behind both the
 * day grid and the selector grids: ←/→ move one cell, ↑/↓ one row of
 * `columns` cells (7 on the day grid = one week), Home/End jump to the
 * row's first/last cell — all skipping disabled cells in the direction
 * of travel (`focusFrom`) — and PageUp/PageDown hand to `onPageKey`
 * (the day grid's month hop keeping the focused day, the selector
 * grids' period/decade step keeping the focused cell). Enter/Space
 * pick via the button's native activation. Under `dir="rtl"` the
 * horizontal arrows mirror (← moves forward), read from the DOM at
 * event time so the keys follow the mirrored grid.
 */
function useGridRoving(
  gridRef: RefObject<HTMLDivElement | null>,
  columns: number,
  onPageKey: (
    delta: number,
    current: number,
    buttons: HTMLButtonElement[]
  ) => void
) {
  return (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const grid = gridRef.current;
    if (!grid) return;
    const buttons = dayButtons(grid);
    if (buttons.length === 0) return;
    const current = buttons.indexOf(
      (event.target as HTMLElement).closest('button')!
    );

    const forward =
      getDirection(grid) === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = forward === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
    const move = (delta: number) => {
      const index = focusFrom(buttons, current < 0 ? 0 : current, delta);
      if (index !== null) {
        event.preventDefault();
        buttons[index]!.focus();
      }
    };

    switch (event.key) {
      case forward:
        move(1);
        return;
      case backward:
        move(-1);
        return;
      case 'ArrowDown':
        move(columns);
        return;
      case 'ArrowUp':
        move(-columns);
        return;
      case 'Home': {
        const rowStart = current < 0 ? 0 : current - (current % columns);
        const index = focusFrom(buttons, rowStart - 1, 1);
        if (index !== null) {
          event.preventDefault();
          buttons[index]!.focus();
        }
        return;
      }
      case 'End': {
        const rowEnd =
          current < 0
            ? columns - 1
            : Math.min(
                current - (current % columns) + columns - 1,
                buttons.length - 1
              );
        const index = focusFrom(buttons, rowEnd + 1, -1);
        if (index !== null) {
          event.preventDefault();
          buttons[index]!.focus();
        }
        return;
      }
      case 'PageUp':
      case 'PageDown': {
        event.preventDefault();
        onPageKey(
          event.key === 'PageDown' ? 1 : -1,
          current,
          buttons
        );
        return;
      }
    }
  };
}

/**
 * Date-grid keyboard roving: `useGridRoving` over the 7-column day
 * grid. PageUp/PageDown switch the month view keeping the same day
 * (clamped to the target month's length, the first day when nothing
 * was focused) — `pendingFocusRef` hands the target date string to the
 * effect that re-focuses after the view commits.
 */
export function useGridKeyboard(
  gridRef: RefObject<HTMLDivElement | null>,
  view: { year: number; month: number },
  setView: (next: { year: number; month: number }) => void,
  pendingFocusRef: RefObject<string | null>
) {
  return useGridRoving(gridRef, 7, (delta, current, buttons) => {
    const next = addMonths(view.year, view.month, delta);
    const fromDay = current >= 0 ? Number(buttons[current]!.textContent) : 1;
    const day = Math.min(
      Math.max(fromDay, 1),
      getDaysInMonth(next.year, next.month)
    );
    setView(next);
    pendingFocusRef.current = formatDate(next.year, next.month, day);
  });
}

/**
 * Selector-grid keyboard roving (WAI-ARIA grid pattern over a
 * `columns`-column cell grid — the quick-select month view and the
 * month/quarter/year picker modes): `useGridRoving` with the period
 * (year or decade) step as the PageUp/Down handler — the focused cell
 * rides `pendingCellIndexRef` to the effect that re-focuses after the
 * view commits.
 */
export function useSelectorGridKeyboard(
  gridRef: RefObject<HTMLDivElement | null>,
  columns: number,
  step: (delta: number) => void,
  pendingCellIndexRef: RefObject<number | null>
) {
  return useGridRoving(gridRef, columns, (delta, current) => {
    pendingCellIndexRef.current = current < 0 ? 0 : current;
    step(delta);
  });
}
