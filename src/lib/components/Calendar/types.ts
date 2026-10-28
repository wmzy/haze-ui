/** Calendar's public types — split from Calendar.tsx (wave-6) so the
 * component file stays an orchestration file. Bodies moved verbatim. */
import type {
  ComponentPropsWithoutRef,
  ReactNode,
  Ref,
} from 'react';
import type { ControlOrValue } from 'react-use-control';

/** Granularity Calendar picks at. Each mode serializes its `value` and
 * `onSelect` payload to a plain string: `"YYYY-MM-DD"` (date), an ISO
 * 8601 week `"YYYY-Www"` (week), `"YYYY-MM"` (month), `"YYYY-Qn"` with
 * n 1–4 (quarter) or `"YYYY"` (year). */
export type CalendarPickerMode = 'date' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Extra render position appended inside picker cells (day numbers, month
 * / quarter / year labels) — schedule dots, badges, custom chrome. Called
 * with the cell's representative civil date (`day` 1 for the
 * month/quarter/year cells) and the picker mode the cell renders in, so
 * one callback can decorate a date grid and the header drill-down grids
 * differently.
 */
export type CalendarCellRender = (
  date: { year: number; month: number; day: number },
  mode: CalendarPickerMode
) => ReactNode;

/** Which grid the date-mode panel currently shows: the day grid itself,
 * the quick-select month grid, or the decade year grid drilled from the
 * header's year title or the quick-select toolbar. */
export type HeaderPanelView = 'days' | 'months' | 'years';

/**
 * Semantic slot classes (AntD v6 `classNames` shape): keys mirror the
 * data-slot each part carries (`today-button`-style kebab slots surface
 * as camelCase keys). Consumer classes are appended at the end of each
 * part's class list (able to override component defaults) and compose
 * with the root `className`; slots not rendered by the current
 * `picker`/view (drill-down toolbars, quarter grid, dual-month panels,
 * …) are ignored.
 */
export type CalendarClassNames = {
  /** The root wrapper `<div>` (`data-slot='calendar'`). */
  root?: string;
  /** The navigation header (`data-slot='header'`) — every mode's main
   * header and the dual-month second pane's header. */
  header?: string;
  /** Every title node (`data-slot='title'`) — the header's drill-down
   * month/year titles, the drill toolbars' decade/year titles and the
   * dual-month pane titles, spans and buttons alike. */
  title?: string;
  /** Every ‹ previous button (`data-slot='prev'`). */
  prev?: string;
  /** Every › next button (`data-slot='next'`). */
  next?: string;
  /** The header's trailing actions cluster (`data-slot='actions'`) —
   * Today button + next in the mode pickers. */
  actions?: string;
  /** The header's Today button (`data-slot='today-button'`). */
  todayButton?: string;
  /** Toolbar of a drill-down view (`data-slot='toolbar'`) — the
   * quick-select month grid's year stepper and the decade grid's
   * decade stepper. */
  toolbar?: string;
  /** One month pane's day grid (`data-slot='month'`, `role='grid'`). */
  month?: string;
  /** The weekday header row (`data-slot='weekday-row'`, `role='row'`). */
  weekdayRow?: string;
  /** One weekday column header (`data-slot='weekday'`). */
  weekday?: string;
  /** The week-number column header and row cells
   * (`data-slot='week-number'`). */
  weekNumber?: string;
  /** One day cell button (`data-slot='day'`). */
  day?: string;
  /** Dual-month layout: the panes wrapper (`data-slot='months'`). */
  months?: string;
  /** Dual-month layout: one pane wrapper (`data-slot='month-panel'`). */
  monthPanel?: string;
  /** A month-cell grid (`data-slot='month-grid'`) — the quick-select
   * month grid and the month picker mode's grid. */
  monthGrid?: string;
  /** One month cell button (`data-slot='month-cell'`). */
  monthCell?: string;
  /** The quarter picker mode's grid (`data-slot='quarter-grid'`). */
  quarterGrid?: string;
  /** One quarter cell button (`data-slot='quarter-cell'`). */
  quarterCell?: string;
  /** A year-cell grid (`data-slot='year-grid'`) — the decade drill-down
   * and the year picker mode's grid. */
  yearGrid?: string;
  /** One year cell button (`data-slot='year-cell'`). */
  yearCell?: string;
};

export type CalendarProps = {
  /**
   * Granularity the calendar picks at. `"date"` (default) renders the
   * day grid; `"week"` the same day grid with whole-ISO-week row
   * selection (rows run Monday–Sunday, the week-number column is always
   * shown and `weekStartsOn` is ignored — ISO weeks are Monday-first by
   * definition); `"month"` a 3×4 month grid over one year; `"quarter"`
   * a 4-quarter grid over one year; `"year"` a 12-year grid stepped a
   * decade at a time. Values follow each mode's serialization (see
   * {@link CalendarPickerMode}); `months`, `showWeekNumbers`,
   * `weekStartsOn` and the range props apply to the day grid only.
   * @default 'date'
   */
  picker?: CalendarPickerMode;
  /**
   * Selected value as a plain string whose format follows `picker`:
   * "YYYY-MM-DD" (date, the default), an ISO week "YYYY-Www" (week),
   * "YYYY-MM" (month), "YYYY-Qn" (quarter) or "YYYY" (year). Empty
   * string means nothing selected.
   */
  value?: ControlOrValue<string>;
  /**
   * Earliest selectable date ("YYYY-MM-DD"). In the month/quarter/year
   * modes a cell is disabled only when its whole period lies before
   * `min` (the period's last day < `min`).
   */
  min?: string;
  /**
   * Latest selectable date ("YYYY-MM-DD"). In the month/quarter/year
   * modes a cell is disabled only when its whole period lies after
   * `max` (the period's first day > `max`).
   */
  max?: string;
  /**
   * Disables individual cells by predicate, alongside `min`/`max` (a
   * cell is disabled when either hits). Called with the cell's
   * representative date as a local-midnight `Date`: the day itself in
   * the date mode, day 1 of the month in the month mode, day 1 of the
   * quarter's first month in the quarter mode, January 1 in the year
   * mode. Disabled cells render natively disabled (inert to clicks,
   * skipped by keyboard roving).
   */
  disabledDate?: (date: Date) => boolean;
  /** BCP 47 locale used for month and weekday formatting. */
  locale?: string;
  /** Explicit first day of the week: 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  /**
   * Render a leading ISO 8601 week-number column on every month grid
   * (labeled "Wk" / localized via the `calendar.weekNumber` string).
   * @default false
   */
  showWeekNumbers?: boolean;
  /**
   * Number of adjacent month grids rendered side by side. Both grids
   * share one navigation state: prev/next, the Today button and the
   * month quick-select move every grid together, and each grid keeps
   * its own keyboard roving.
   * @default 1
   */
  months?: 1 | 2;
  /**
   * Start of a highlighted date range ("YYYY-MM-DD"), drawn as a filled
   * endpoint on its day. Purely presentational — range picking logic
   * stays with the caller (see DateRangePicker's dual-month panel).
   */
  rangeStart?: string;
  /**
   * End of a highlighted date range ("YYYY-MM-DD"); together with
   * `rangeStart` fills every day in between with a subtle background.
   */
  rangeEnd?: string;
  /**
   * Called with the picked value — "YYYY-MM-DD" (date), an ISO week
   * "YYYY-Www" (week), "YYYY-MM" (month), "YYYY-Qn" (quarter) or "YYYY"
   * (year), matching `picker`. Still fires alongside the controllable
   * `value` for callers that prefer event-style wiring.
   */
  onSelect?: (date: string) => void;
  /**
   * Appends a custom render inside every picker cell — day numbers,
   * month/quarter/year labels and the header drill-down grids alike
   * (schedule dots, badges). Receives the cell's representative civil
   * date (`day` 1 for month/quarter/year cells) and the mode the cell
   * renders in. Opt-in: without it the cells render exactly as before.
   */
  cellRender?: CalendarCellRender;
  /** Slot classes (see {@link CalendarClassNames}); each key lands on
   * the parts carrying the matching data-slot, after the component
   * defaults. */
  classNames?: CalendarClassNames;
  /**
   * Forwarded to the root wrapper `<div>` (`data-slot='calendar'`) —
   * the element tests and `ref.current.focus()` reach.
   */
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onSelect'>;
