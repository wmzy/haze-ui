/* Calendar's grid renderers — extracted from Calendar.tsx (wave-6):
 * renderMonthPane (one month pane of the day grid) and the shared
 * period-grid walk (renderPeriodGrid + its month/year wrappers) behind
 * the drill-down views and the month/quarter/year picker modes. Pure
 * render functions: everything they read from Calendar's render scope
 * arrives through the explicit view objects (MonthPaneView /
 * PeriodGridView) instead of closures, and the classes come from the
 * family's single css module (styles.ts). */
import type {
  Dispatch,
  KeyboardEvent as ReactKeyboardEvent,
  Ref,
  RefObject,
  SetStateAction,
} from 'react';

import type { ISOWeek } from '../../utils/date-math';

import type {
  CalendarCellRender,
  CalendarClassNames,
  CalendarPickerMode,
} from './types';

import {
  buildMonthCells,
  formatDate,
  formatWeekValue,
  getISOWeek,
} from '../../utils/date-math';

import {
  cellContents,
  dayBtn,
  dayContent,
  dayInRange,
  dayOutside,
  daySelected,
  grid,
  quarterGrid,
  quickGrid,
  rowContents,
  weekday,
  weekNumber,
  weekNumberSelected,
} from './styles';

/** The day-grid render context renderMonthPane reads — everything the
 * pane JSX needs from Calendar's render scope except the per-pane view,
 * ref and keydown handler. Built once per Calendar render and shared by
 * every pane, so the extracted render stays a pure function of its
 * arguments. */
export type MonthPaneView = {
  /** First day of the week the cells are built against (always 1 in the
   * week mode — ISO weeks are Monday-first). */
  weekStart: number;
  /** Whether each week row leads with the week-number column. */
  showWeekColumn: boolean;
  /** Short weekday labels in grid order. */
  weekdayLabels: string[];
  /** "Month Year" formatter behind each pane's aria-label. */
  titleFormatter: Intl.DateTimeFormat;
  /** Week-column header label (the calendar.weekNumber string). */
  weekNumberLabel: string;
  /** Whether whole-ISO-week rows are picked (picker="week"). */
  weekMode: boolean;
  /** Parsed "YYYY-Www" value in the week mode, else null. */
  weekValue: ISOWeek | null;
  /** Consumer slot classes. */
  classNames?: CalendarClassNames;
  /** Selected "YYYY-MM-DD" value. */
  value: string;
  isRangeEndpoint: (dateStr: string) => boolean;
  isInRange: (dateStr: string) => boolean;
  cellRender?: CalendarCellRender;
  picker: CalendarPickerMode;
  isCellDisabled: (year: number, month: number, day: number) => boolean;
  pickModeValue: (next: string) => void;
  setValue: Dispatch<SetStateAction<string>>;
  onSelect?: (date: string) => void;
};

/** One month pane: weekday header row + chunked week rows. Shared by
 * the single- and dual-month layouts; `pane` is the pane's own view so
 * keyboard month hops anchor on the focused grid. In the week mode
 * every row of the (Monday-first) grid is one ISO week: the week
 * column is always shown, a day pick commits the row's
 * `"YYYY-Www"` value and the whole selected week renders selected. */
export function renderMonthPane(
  pane: { year: number; month: number },
  paneRef: RefObject<HTMLDivElement | null>,
  handleKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void,
  view: MonthPaneView
) {
  const {
    weekStart,
    showWeekColumn,
    weekdayLabels,
    titleFormatter,
    weekNumberLabel,
    weekMode,
    weekValue,
    classNames,
    value,
    isRangeEndpoint,
    isInRange,
    cellRender,
    picker,
    isCellDisabled,
    pickModeValue,
    setValue,
    onSelect,
  } = view;
  const cells = buildMonthCells(pane.year, pane.month, weekStart);
  // Chunk the flat 7-aligned cell list into week rows (display:
  // contents, so layout is unchanged) — `role="grid"` requires row →
  // columnheader / gridcell structure (ARIA 1.2, axe
  // aria-required-children).
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  const paneLabel = titleFormatter.format(new Date(pane.year, pane.month));

  return (
    <div
      ref={paneRef}
      data-slot='month'
      x-class={[grid, classNames?.month]}
      style={showWeekColumn ? { gridTemplateColumns: 'repeat(8, 1fr)' } : undefined}
      role='grid'
      aria-label={paneLabel}
      onKeyDown={handleKeyDown}
    >
      <div role='row' data-slot='weekday-row' x-class={[rowContents, classNames?.weekdayRow]}>
        {showWeekColumn && (
          <span role='columnheader' data-slot='week-number' x-class={[weekday, classNames?.weekNumber]}>
            {weekNumberLabel}
          </span>
        )}
        {weekdayLabels.map((label, i) => (
          <span key={i} role='columnheader' data-slot='weekday' x-class={[weekday, classNames?.weekday]}>
            {label}
          </span>
        ))}
      </div>
      {weeks.map((week, weekIndex) => {
        // The row's ISO week: with the week mode's Monday-first grid
        // the first cell is the week's Monday, so the whole row shares
        // one identity.
        const rowWeek = getISOWeek(
          week[0]!.year,
          week[0]!.month,
          week[0]!.day
        );
        const rowSelected =
          weekMode &&
          weekValue !== null &&
          weekValue.year === rowWeek.year &&
          weekValue.week === rowWeek.week;
        return (
          <div role='row' key={weekIndex} x-class={[rowContents]}>
            {showWeekColumn && (
              <span
                role='gridcell'
                data-slot='week-number'
                x-class={[weekNumber, rowSelected && weekNumberSelected, classNames?.weekNumber]}
              >
                {rowWeek.week}
              </span>
            )}
            {week.map((c) => {
              const dateStr = formatDate(c.year, c.month, c.day);
              const endpoint = isRangeEndpoint(dateStr);
              const selected = weekMode
                ? rowSelected
                : dateStr === value || endpoint;
              const extra = cellRender?.(
                { year: c.year, month: c.month, day: c.day },
                picker
              );
              return (
                <span
                  role='gridcell'
                  key={dateStr}
                  aria-selected={selected || isInRange(dateStr)}
                  x-class={[cellContents]}
                >
                  <button
                    type='button'
                    data-slot='day'
                    data-haze-day={dateStr}
                    x-class={[
                      dayBtn,
                      selected && daySelected,
                      !selected && isInRange(dateStr) && dayInRange,
                      c.outside && dayOutside,
                      classNames?.day,
                    ]}
                    disabled={isCellDisabled(c.year, c.month, c.day)}
                    onClick={() => {
                      if (weekMode) {
                        pickModeValue(
                          formatWeekValue(rowWeek.year, rowWeek.week)
                        );
                      } else {
                        setValue(dateStr);
                        onSelect?.(dateStr);
                      }
                    }}
                  >
                    {extra === undefined ? (
                      c.day
                    ) : (
                      <span x-class={[dayContent]}>
                        {c.day}
                        {extra}
                      </span>
                    )}
                  </button>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** The period-grid render context renderPeriodGrid (and its month/year
 * wrappers plus the quarter grid) reads — label strings, the short
 * month names, consumer slot classes and the per-cell render. */
export type PeriodGridView = {
  selectMonthLabel: string;
  selectYearLabel: string;
  selectQuarterLabel: string;
  monthNames: string[];
  classNames?: CalendarClassNames;
  cellRender?: CalendarCellRender;
};

/* Shared period-selector grid — the drill-down views' and the picker
 * modes' month/year grids are one 3×4 walk over twelve cells: months
 * of `anchor`'s year or years of `anchor`'s decade. Per-surface
 * behavior rides the projections: `isActive` paints the selected arm
 * (the value's own period in the picker modes, the viewed month/year
 * in the drill-down grids), `isDisabled` gates min/max/disabledDate
 * (absent on the drill-down month grid, which never disables), and
 * `onPick` commits the pick (or navigates, in the drill grids). Same
 * grid/gridcell semantics and roving keyboard as the day grid;
 * `cellRender` fires per cell with the mode it renders in. */
export function renderPeriodGrid(
  spec: {
    kind: 'month' | 'year';
    anchor: number;
    gridRef: Ref<HTMLDivElement>;
    onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
    isActive: (value: number) => boolean;
    isDisabled?: (value: number) => boolean;
    onPick: (value: number) => void;
  },
  view: PeriodGridView
) {
  const {
    monthNames,
    classNames,
    cellRender,
    selectMonthLabel,
    selectYearLabel,
  } = view;
  const month = spec.kind === 'month';
  return (
    <div
      ref={spec.gridRef}
      data-slot={month ? 'month-grid' : 'year-grid'}
      x-class={[quickGrid, month ? classNames?.monthGrid : classNames?.yearGrid]}
      role='grid'
      aria-label={month ? selectMonthLabel : selectYearLabel}
      onKeyDown={spec.onKeyDown}
    >
      {[0, 1, 2, 3].map((rowIndex) => (
        <div role='row' key={rowIndex} x-class={[rowContents]}>
          {[0, 1, 2].map((column) => {
            const value = month
              ? rowIndex * 3 + column
              : spec.anchor + rowIndex * 3 + column;
            const active = spec.isActive(value);
            const extra = cellRender?.(
              month
                ? { year: spec.anchor, month: value, day: 1 }
                : { year: value, month: 0, day: 1 },
              spec.kind
            );
            const label = month ? monthNames[value] : value;
            return (
              <span
                role='gridcell'
                key={value}
                aria-selected={active}
                x-class={[cellContents]}
              >
                <button
                  type='button'
                  data-slot={month ? 'month-cell' : 'year-cell'}
                  {...(month
                    ? { 'data-haze-month': value }
                    : { 'data-haze-year': value })}
                  x-class={[dayBtn, active && daySelected, month ? classNames?.monthCell : classNames?.yearCell]}
                  disabled={spec.isDisabled?.(value)}
                  onClick={() => spec.onPick(value)}
                >
                  {extra === undefined ? (
                    label
                  ) : (
                    <span x-class={[dayContent]}>
                      {label}
                      {extra}
                    </span>
                  )}
                </button>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** The month grid behind both the quick-select drill-down (months of
 *  `quickYear`, picking navigates the day view) and the
 *  `picker="month"` mode (months of `viewYear`, picking selects). */
export function renderMonthGrid(
  spec: {
    year: number;
    gridRef: Ref<HTMLDivElement>;
    onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
    isActive: (month: number) => boolean;
    isDisabled?: (month: number) => boolean;
    onPick: (month: number) => void;
  },
  view: PeriodGridView
) {
  return renderPeriodGrid(
    {
      kind: 'month',
      anchor: spec.year,
      gridRef: spec.gridRef,
      onKeyDown: spec.onKeyDown,
      isActive: spec.isActive,
      isDisabled: spec.isDisabled,
      onPick: spec.onPick,
    },
    view
  );
}

/** The year grid behind every decade surface — the date header's year
 *  drill-down and the quick-select toolbar's (picking navigates) and
 *  the `picker="year"` mode (picking selects): one 3×4 slice of the
 *  decade `decadeStart` opens. */
export function renderYearGrid(
  spec: {
    decadeStart: number;
    gridRef: Ref<HTMLDivElement>;
    onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
    isActive: (year: number) => boolean;
    isDisabled?: (year: number) => boolean;
    onPick: (year: number) => void;
  },
  view: PeriodGridView
) {
  return renderPeriodGrid(
    {
      kind: 'year',
      anchor: spec.decadeStart,
      gridRef: spec.gridRef,
      onKeyDown: spec.onKeyDown,
      isActive: spec.isActive,
      isDisabled: spec.isDisabled,
      onPick: spec.onPick,
    },
    view
  );
}

/** The `picker="quarter"` mode's grid: one row of four quarter cells
 *  (the month grid's cell chrome, one column per quarter). Extracted
 *  verbatim from Calendar.tsx (wave-6); per-cell behavior rides the
 *  projections like the period grids do. */
export function renderQuarterGrid(
  spec: {
    year: number;
    gridRef: Ref<HTMLDivElement>;
    onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
    isActive: (quarter: number) => boolean;
    isDisabled: (quarter: number) => boolean;
    onPick: (quarter: number) => void;
  },
  view: PeriodGridView
) {
  const { classNames, cellRender, selectQuarterLabel } = view;
  return (
    <div
      ref={spec.gridRef}
      data-slot='quarter-grid'
      x-class={[quarterGrid, classNames?.quarterGrid]}
      role='grid'
      aria-label={selectQuarterLabel}
      onKeyDown={spec.onKeyDown}
    >
      <div role='row' x-class={[rowContents]}>
        {[1, 2, 3, 4].map((quarter) => {
          const selected = spec.isActive(quarter);
          const extra = cellRender?.(
            { year: spec.year, month: quarter * 3 - 3, day: 1 },
            'quarter'
          );
          return (
            <span
              role='gridcell'
              key={quarter}
              aria-selected={selected}
              x-class={[cellContents]}
            >
              <button
                type='button'
                data-slot='quarter-cell'
                data-haze-quarter={quarter}
                x-class={[dayBtn, selected && daySelected, classNames?.quarterCell]}
                disabled={spec.isDisabled(quarter)}
                onClick={() => spec.onPick(quarter)}
              >
                {extra === undefined ? (
                  `Q${quarter}`
                ) : (
                  <span x-class={[dayContent]}>
                    Q{quarter}
                    {extra}
                  </span>
                )}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
