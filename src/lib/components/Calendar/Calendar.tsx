import type {
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react';

import type { CalendarProps, HeaderPanelView } from './types';

import type { MonthPaneView, PeriodGridView } from './grids';

import { useControl } from 'react-use-control';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  addMonths,
  formatDate,
  formatMonthValue,
  formatQuarterValue,
  formatYearValue,
  getDaysInMonth,
  getISOWeekStartDate,
  getWeekdayLabels,
  parseCivilDate,
  parseMonthValue,
  parseQuarterValue,
  parseWeekValue,
  parseYearValue,
  resolveWeekStart,
} from '../../utils/date-math';
import { mergeRefs } from '../../utils/refs';
import { useStrings } from '../LocaleProvider';

import { dayButtons, useGridKeyboard, useSelectorGridKeyboard } from './grid-roving';
import { renderMonthGrid, renderMonthPane, renderQuarterGrid, renderYearGrid } from './grids';
import {
  calendarWrapper,
  header,
  headerBtn,
  headerTitle,
  headerTitles,
  headerTrailing,
  monthPanel,
  monthPanels,
  paneHeader,
  quickSelect,
  quickToolbar,
  titleBtn,
} from './styles';

export type {
  CalendarCellRender,
  CalendarClassNames,
  CalendarPickerMode,
  CalendarProps,
} from './types';

/** First year of the decade `year` belongs to — the anchor of the year
 * grids' decade layout and the base of a year's offset within it. */
function decadeStart(year: number): number {
  return Math.floor(year / 10) * 10;
}

export default function Calendar({
  picker = 'date',
  value: valueControl,
  min,
  max,
  disabledDate,
  locale,
  weekStartsOn,
  showWeekNumbers = false,
  months = 1,
  rangeStart,
  rangeEnd,
  onSelect,
  cellRender,
  classNames,
  className,
  ref,
  ...rest
}: CalendarProps) {
  const [value, setValue] = useControl(valueControl, '');
  const strings = useStrings('calendar');
  const gridRef = useRef<HTMLDivElement>(null);
  const secondGridRef = useRef<HTMLDivElement>(null);
  // Wrapper-scoped ref: pending-focus dates may land in either month pane.
  const rootRef = useRef<HTMLDivElement>(null);
  // The consumer's ref rides the same root wrapper div (React 19
  // ref-as-prop, merged with the internal focus-scope handle above).
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [rootRef, ref]
  );
  // Day ("YYYY-MM-DD") to focus once the next view renders (PageUp/Down
  // month hops and quick-select month picks — the cells do not exist
  // until the state commits).
  const pendingFocusRef = useRef<string | null>(null);
  // Quick-select view: month button index (0 = January … 11 = December,
  // DOM order) to focus once the selector renders (open handover and
  // year hops).
  const pendingQuickCellRef = useRef<number | null>(null);
  // Month/quarter/year modes: cell index to focus once the stepped
  // view (year or decade hop) commits.
  const pendingModeCellRef = useRef<number | null>(null);
  const modeGridRef = useRef<HTMLDivElement>(null);
  const monthTitleRef = useRef<HTMLButtonElement>(null);
  const yearTitleRef = useRef<HTMLButtonElement>(null);
  const quickGridRef = useRef<HTMLDivElement>(null);
  // Header drill-down: which grid the panel currently shows over the
  // day view — the day grid itself, the quick-select month grid or a
  // decade year grid. Internal view state (never a prop): drilling is
  // navigation, not a value change, so it stays fully decoupled from
  // the `picker` granularity the value serializes at. useControl keeps
  // the door open for a future control prop with zero wiring cost.
  const [panelView, setPanelView] = useControl<HeaderPanelView>(
    undefined,
    'days'
  );
  // Year the quick-select month grid (and its toolbar) is anchored at.
  const [quickYear, setQuickYear] = useState(0);
  // Anchor year of the decade year grid while it is open, and where a
  // year pick returns to ('days' when opened straight from the date
  // header's year title, 'months' when drilled from the quick-select
  // toolbar — antd parity).
  const [yearsAnchor, setYearsAnchor] = useState(0);
  const yearsReturnRef = useRef<'days' | 'months'>('days');
  // Month/quarter picker modes: the year title drills into the same
  // decade grid; picking a year returns to the mode grid anchored at it.
  const [modeYearsOpen, setModeYearsOpen] = useControl<boolean>(
    undefined,
    false
  );
  // Anchor year of the mode drill-down grid (stepping a decade moves
  // this, not the mode view's own year).
  const [modeYearsAnchor, setModeYearsAnchor] = useState(0);

  // Week mode: whole-ISO-week rows. Values are "YYYY-Www", so the
  // anchor is the week's Monday (see getISOWeekStartDate) — not a
  // January 1 normalization like the coarser modes.
  const weekMode = picker === 'week';
  const weekValue = weekMode ? parseWeekValue(value) : null;
  const weekAnchor = weekValue
    ? getISOWeekStartDate(weekValue.year, weekValue.week)
    : null;

  // Civil parse: `new Date(value)` would read the value as UTC midnight
  // and land west-of-UTC users on the previous day — showing February
  // for a '2026-03-01' value in America/New_York. Picker modes parse
  // their own serialization; only the year steers their view, so a
  // January anchor normalizes `initial` across modes.
  const modeValue =
    picker === 'month'
      ? parseMonthValue(value)
      : picker === 'quarter'
        ? parseQuarterValue(value)
        : picker === 'year'
          ? parseYearValue(value)
          : null;
  const initial =
    picker === 'date'
      ? (value && parseCivilDate(value)) ||
        (rangeStart && parseCivilDate(rangeStart)) ||
        new Date()
      : weekAnchor
        ? new Date(weekAnchor.year, weekAnchor.month, weekAnchor.day)
        : modeValue
          ? new Date(modeValue.year, 0, 1)
          : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  // ISO weeks run Monday–Sunday by definition, so the week grid is
  // always Monday-first — a Sunday-first row would straddle two ISO
  // weeks and make "the row's week" ambiguous.
  const weekStart = weekMode ? 1 : resolveWeekStart(locale, weekStartsOn);
  const weekdayLabels = getWeekdayLabels(locale, weekStart);
  const showWeekColumn = showWeekNumbers || weekMode;

  // Locale-only formatters (and the month-name list they shape) are
  // memoized apart from the view (Schedule's timeFormatters precedent):
  // month and year hops must not rebuild them.
  const localeTag = locale ?? 'default';
  const { titleFormatter, monthTitleFormatter, monthNames } = useMemo(() => {
    const monthNameFormatter = new Intl.DateTimeFormat(localeTag, {
      month: 'short',
    });
    return {
      titleFormatter: new Intl.DateTimeFormat(localeTag, {
        month: 'long',
        year: 'numeric',
      }),
      monthTitleFormatter: new Intl.DateTimeFormat(localeTag, {
        month: 'long',
      }),
      monthNames: Array.from({ length: 12 }, (_, month) =>
        monthNameFormatter.format(new Date(2026, month, 15))
      ),
    };
  }, [localeTag]);
  // Locale part order of the combined "Month Year" title decides the
  // header's title order (zh-CN renders the year first; en-US the
  // month), so the two drill-down titles read in the locale's own order.
  const yearTitleFirst = useMemo(() => {
    const titleParts = titleFormatter.formatToParts(
      new Date(viewYear, viewMonth, 15)
    );
    return (
      titleParts.findIndex((part) => part.type === 'year') <
      titleParts.findIndex((part) => part.type === 'month')
    );
  }, [titleFormatter, viewYear, viewMonth]);

  const setView = (next: { year: number; month: number }) => {
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  // Focus handover for keyboard month hops (Cascader's pendingFocus
  // pattern): the day exists only after the view commits. Also runs on
  // quick-select close so picking the already-viewed month (view state
  // unchanged, React bails out) still hands focus to day 1.
  useEffect(() => {
    if (panelView !== 'days') return;
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;
    rootRef.current
      ?.querySelector<HTMLButtonElement>(`[data-haze-day="${target}"]`)
      ?.focus();
  }, [viewYear, viewMonth, panelView]);

  // Focus handover for the header drill-down grids: the month or year
  // buttons exist only after the selector mounts (open), the year
  // stepper commits (PageUp/Down year hop keeping the focused month) or
  // the drill-down level swaps (year grid opened / closed). The
  // month/quarter mode drill rides the same ref and pending handover.
  useEffect(() => {
    if (panelView === 'days' && !modeYearsOpen) return;
    const index = pendingQuickCellRef.current;
    pendingQuickCellRef.current = null;
    const buttons = dayButtons(quickGridRef.current);
    if (buttons.length === 0) return;
    (buttons[index ?? 0] ?? buttons[0])!.focus();
  }, [panelView, quickYear, yearsAnchor, modeYearsOpen, modeYearsAnchor]);

  // Focus handover for the picker-mode grids: PageUp/Down period hops
  // replace every cell (year or decade shift), so the pending index is
  // re-resolved against the freshly committed grid. Closing the mode
  // drill-down re-focuses the value's cell the same way (the year pick
  // commits a new viewYear; a plain Esc does not change it, so
  // modeYearsOpen joins the deps).
  useEffect(() => {
    if (picker === 'date' || picker === 'week') return;
    if (modeYearsOpen) return;
    const index = pendingModeCellRef.current;
    pendingModeCellRef.current = null;
    if (index === null) return;
    const buttons = dayButtons(modeGridRef.current);
    (buttons[index] ?? buttons[0])?.focus();
  }, [picker, viewYear, modeYearsOpen]);

  const openMonthsView = () => {
    pendingQuickCellRef.current = viewMonth;
    setQuickYear(viewYear);
    setPanelView('months');
  };

  const closeMonthsView = () => {
    setPanelView('days');
    monthTitleRef.current?.focus();
  };

  const chooseMonth = (month: number) => {
    setPanelView('days');
    setView({ year: quickYear, month });
    pendingFocusRef.current = formatDate(quickYear, month, 1);
  };

  /* Year drill-down (the picker="year" grid's decade layout): opened
   * either straight from the date header's year title (picking a year
   * lands back on the day grid anchored at it) or from the quick-select
   * toolbar (picking returns to the month grid, the picker="year"
   * grid's cousin). Opening hands focus to the anchor year's cell. */
  const yearsDecadeStart = decadeStart(yearsAnchor);

  const openYearsFromHeader = () => {
    yearsReturnRef.current = 'days';
    // Decade of the NEW anchor (viewYear), not the previous state.
    pendingQuickCellRef.current = viewYear - decadeStart(viewYear);
    setYearsAnchor(viewYear);
    setPanelView('years');
  };

  const openYearsFromMonths = () => {
    yearsReturnRef.current = 'months';
    pendingQuickCellRef.current = quickYear - decadeStart(quickYear);
    setYearsAnchor(quickYear);
    setPanelView('years');
  };

  const closeYearsView = () => {
    if (yearsReturnRef.current === 'months') {
      setPanelView('months');
      pendingQuickCellRef.current = viewMonth;
    } else {
      setPanelView('days');
      yearTitleRef.current?.focus();
    }
  };

  const chooseYear = (year: number) => {
    if (yearsReturnRef.current === 'months') {
      setQuickYear(year);
      setPanelView('months');
      pendingQuickCellRef.current = viewMonth;
    } else {
      setPanelView('days');
      setViewYear(year);
      pendingFocusRef.current = formatDate(year, viewMonth, 1);
    }
  };

  /* Month/quarter mode drill-down: the year title opens the decade
   * grid anchored at the viewed year; picking (or Esc) returns to the
   * mode grid with focus on the value's cell. */
  const modeYearsDecadeStart = decadeStart(modeYearsAnchor);

  const modeValueCellIndex = () =>
    picker === 'month'
      ? (parseMonthValue(value)?.month ?? 0)
      : (parseQuarterValue(value)?.quarter ?? 1) - 1;

  const openModeYears = () => {
    pendingQuickCellRef.current = viewYear - decadeStart(viewYear);
    setModeYearsAnchor(viewYear);
    setModeYearsOpen(true);
  };

  const closeModeYears = () => {
    pendingModeCellRef.current = modeValueCellIndex();
    setModeYearsOpen(false);
  };

  const chooseModeYear = (year: number) => {
    pendingModeCellRef.current = modeValueCellIndex();
    setViewYear(year);
    setModeYearsOpen(false);
  };

  const secondPane = addMonths(viewYear, viewMonth, months - 1);
  const handleGridKeyDown = useGridKeyboard(
    gridRef,
    { year: viewYear, month: viewMonth },
    setView,
    pendingFocusRef
  );
  const handleSecondGridKeyDown = useGridKeyboard(
    secondGridRef,
    secondPane,
    setView,
    pendingFocusRef
  );

  const handleQuickGridKeyDown = useSelectorGridKeyboard(
    quickGridRef,
    3,
    (delta) => setQuickYear((year) => year + delta),
    pendingQuickCellRef
  );

  // Year drill-down grid: 3 columns like the month grid, PageUp/Down
  // step a decade (matching the picker="year" mode's stepper).
  const handleYearsGridKeyDown = useSelectorGridKeyboard(
    quickGridRef,
    3,
    (delta) => setYearsAnchor((year) => year + delta * 10),
    pendingQuickCellRef
  );

  // Month/quarter mode drill-down grid: PageUp/Down step the drill's
  // own anchor by a decade (the mode view's year stays untouched while
  // drilling; the pick commits it).
  const handleModeYearsGridKeyDown = useSelectorGridKeyboard(
    quickGridRef,
    3,
    (delta) => setModeYearsAnchor((year) => year + delta * 10),
    pendingQuickCellRef
  );

  // Picker modes: prev/next and PageUp/Down step one year (month and
  // quarter modes) or one decade (year mode), keeping the focused cell.
  const modeColumns = picker === 'quarter' ? 4 : 3;
  const stepModePeriod = (delta: number) =>
    setViewYear((year) => year + delta * (picker === 'year' ? 10 : 1));
  const handleModeGridKeyDown = useSelectorGridKeyboard(
    modeGridRef,
    modeColumns,
    stepModePeriod,
    pendingModeCellRef
  );

  const goPrevMonth = () => setView(addMonths(viewYear, viewMonth, -1));

  const goNextMonth = () => setView(addMonths(viewYear, viewMonth, 1));

  const goToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  /** A picker cell spanning a period is disabled when the whole period
   * sits out of the min/max range — its last day before `min`, or its
   * first day past `max` — or its representative date (the period's
   * day 1) is rejected by `disabledDate`. Day cells shrink the period
   * to the single day itself. */
  const periodDisabled = (
    firstDay: string,
    lastDay: string,
    representative: Date
  ) => {
    if (min && lastDay < min) return true;
    if (max && firstDay > max) return true;
    return disabledDate?.(representative) ?? false;
  };

  const isCellDisabled = (year: number, month: number, day: number) => {
    const dateStr = formatDate(year, month, day);
    return periodDisabled(dateStr, dateStr, new Date(year, month, day));
  };

  // A month cell is disabled when its whole period is out of range (any
  // day could still be pickable inside) or its representative day —
  // day 1 — is rejected by `disabledDate`.
  const isMonthCellDisabled = (year: number, month: number) =>
    periodDisabled(
      formatDate(year, month, 1),
      formatDate(year, month, getDaysInMonth(year, month)),
      new Date(year, month, 1)
    );

  const isQuarterCellDisabled = (year: number, quarter: number) => {
    const firstMonth = quarter * 3 - 3;
    const lastMonth = quarter * 3 - 1;
    return periodDisabled(
      formatDate(year, firstMonth, 1),
      formatDate(year, lastMonth, getDaysInMonth(year, lastMonth)),
      new Date(year, firstMonth, 1)
    );
  };

  const isYearCellDisabled = (year: number) =>
    periodDisabled(
      formatDate(year, 0, 1),
      formatDate(year, 11, 31),
      new Date(year, 0, 1)
    );

  const pickModeValue = (next: string) => {
    setValue(next);
    onSelect?.(next);
  };

  const rangeStartSet = rangeStart !== undefined && rangeStart !== '';
  const rangeEndSet = rangeEnd !== undefined && rangeEnd !== '';
  const isRangeEndpoint = (dateStr: string) =>
    (rangeStartSet && dateStr === rangeStart) ||
    (rangeEndSet && dateStr === rangeEnd);
  const isInRange = (dateStr: string) =>
    rangeStartSet &&
    rangeEndSet &&
    dateStr > rangeStart &&
    dateStr < rangeEnd;

  /* The two date-header drill titles. Both keep the plain-text box of
   * the span they replaced (titleBtn inherits font longhands and zeros
   * padding), so the header stays visually unchanged apart from being
   * two focuses. */
  const monthTitle = (
    <button
      ref={monthTitleRef}
      data-slot='title'
      type='button'
      x-class={[titleBtn, headerTitle, classNames?.title]}
      aria-haspopup='grid'
      aria-expanded={panelView === 'months'}
      onClick={panelView === 'months' ? closeMonthsView : openMonthsView}
    >
      {monthTitleFormatter.format(new Date(viewYear, viewMonth))}
    </button>
  );
  const yearTitle = (
    <button
      ref={yearTitleRef}
      data-slot='title'
      type='button'
      x-class={[titleBtn, headerTitle, classNames?.title]}
      aria-haspopup='grid'
      aria-expanded={panelView === 'years'}
      onClick={panelView === 'years' ? closeYearsView : openYearsFromHeader}
    >
      {viewYear}
    </button>
  );

  /* Explicit render context for the sibling grid module (grids.tsx):
   * the day panes and the period grids read Calendar's props and state
   * through these objects instead of closures, keeping the extracted
   * renders pure functions of their arguments. */
  const paneView: MonthPaneView = {
    weekStart,
    showWeekColumn,
    weekdayLabels,
    titleFormatter,
    weekNumberLabel: strings.weekNumber,
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
  };

  const periodView: PeriodGridView = {
    selectMonthLabel: strings.selectMonth,
    selectYearLabel: strings.selectYear,
    selectQuarterLabel: strings.selectQuarter,
    monthNames,
    classNames,
    cellRender,
  };

  /* ── Drill toolbar anatomy ── The quick-select drill toolbars (years,
   * months) and the picker modes' header share the same ‹ title ›
   * stepper; only the handlers, labels and the title element differ
   * (decade-range span or year button). Local render functions keep
   * the three rows in sync. */
  const renderStepButton = (
    slot: 'prev' | 'next',
    onClick: () => void,
    label: string
  ) => (
    <button
      data-slot={slot}
      type='button'
      x-class={[
        headerBtn,
        slot === 'prev' ? classNames?.prev : classNames?.next,
      ]}
      onClick={onClick}
      aria-label={label}
    >
      {slot === 'prev' ? '‹' : '›'}
    </button>
  );

  /** Decade-range title: `start – start + 11` (the year grids carry
   * twelve cells — the decade plus its overflow year). */
  const renderDecadeTitle = (start: number) => (
    <span data-slot='title' x-class={[headerTitle, classNames?.title]}>
      {start} – {start + 11}
    </span>
  );

  /** The full quick-select toolbar row (years/months drill views). */
  const renderDrillToolbar = (props: {
    prevLabel: string;
    onPrev: () => void;
    title: ReactNode;
    nextLabel: string;
    onNext: () => void;
  }) => (
    <div data-slot='toolbar' x-class={[quickToolbar, classNames?.toolbar]}>
      {renderStepButton('prev', props.onPrev, props.prevLabel)}
      {props.title}
      {renderStepButton('next', props.onNext, props.nextLabel)}
    </div>
  );

  /* Built lazily: when the day grid is showing, neither drill grid is
   * constructed — cellRender must not fire for cells that are not
   * mounted. */
  const yearsDrillView =
    panelView === 'years' ? (
      <div x-class={[quickSelect]} onKeyDown={onQuickKeyDown}>
        {renderDrillToolbar({
          prevLabel: strings.previousDecade,
          onPrev: () => setYearsAnchor((year) => year - 10),
          title: renderDecadeTitle(yearsDecadeStart),
          nextLabel: strings.nextDecade,
          onNext: () => setYearsAnchor((year) => year + 10),
        })}
        {renderYearGrid(
          {
            decadeStart: yearsDecadeStart,
            gridRef: quickGridRef,
            onKeyDown: handleYearsGridKeyDown,
            isActive: (year) => year === viewYear,
            isDisabled: isYearCellDisabled,
            onPick: chooseYear,
          },
          periodView
        )}
      </div>
    ) : null;

  const monthsDrillView =
    panelView === 'months' ? (
      <div x-class={[quickSelect]} onKeyDown={onQuickKeyDown}>
        {renderDrillToolbar({
          prevLabel: strings.previousYear,
          onPrev: () => setQuickYear((year) => year - 1),
          title: (
            /* The year drills into a decade grid (the picker="year"
                layout); picking a year lands back on this month grid. */
            <button
              data-slot='title'
              type='button'
              x-class={[titleBtn, headerTitle, classNames?.title]}
              aria-haspopup='grid'
              onClick={openYearsFromMonths}
            >
              {quickYear}
            </button>
          ),
          nextLabel: strings.nextYear,
          onNext: () => setQuickYear((year) => year + 1),
        })}
        {renderMonthGrid(
          {
            year: quickYear,
            gridRef: quickGridRef,
            onKeyDown: handleQuickGridKeyDown,
            isActive: (month) => quickYear === viewYear && month === viewMonth,
            onPick: chooseMonth,
          },
          periodView
        )}
      </div>
    ) : null;

  /** Esc inside a drill-down view: from the year grid it steps back one
   *  level (the month grid when drilled from the toolbar, the day grid
   *  when opened from the header's year title); from the month grid it
   *  cancels the quick select and returns focus to the month title. */
  function onQuickKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (panelView === 'years') {
        closeYearsView();
      } else {
        closeMonthsView();
      }
    }
  }

  /* ── Picker modes ── First-class month/quarter/year grids: a period
   *  stepper header (year, or decade in the year mode) above a cell
   *  grid whose cells select directly. Same grid/gridcell semantics
   *  and roving keyboard as the day grid; the date mode's quick-select
   *  is the in-place cousin of the month mode. The month/quarter year
   *  title drills into the decade year grid; picking a year returns to
   *  the mode grid anchored at it. */
  if (picker !== 'date' && picker !== 'week') {
    const drilled = modeYearsOpen && picker !== 'year';
    const previousLabel =
      drilled || picker === 'year'
        ? strings.previousDecade
        : strings.previousYear;
    const nextLabel =
      drilled || picker === 'year'
        ? strings.nextDecade
        : strings.nextYear;

    const modeGrid = drilled ? (
      /* No inner toolbar: while drilled, the mode header itself shows
       * the decade title and steps decades (see the header below); the
       * wrapper only adds the Escape step-back. */
      <div
        x-class={[quickSelect]}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            closeModeYears();
          }
        }}
      >
        {renderYearGrid(
          {
            decadeStart: modeYearsDecadeStart,
            gridRef: quickGridRef,
            onKeyDown: handleModeYearsGridKeyDown,
            isActive: (year) => year === viewYear,
            isDisabled: isYearCellDisabled,
            onPick: chooseModeYear,
          },
          periodView
        )}
      </div>
    ) : picker === 'month' ? (
      renderMonthGrid(
        {
          year: viewYear,
          gridRef: modeGridRef,
          onKeyDown: handleModeGridKeyDown,
          isActive: (month) => value === formatMonthValue(viewYear, month),
          isDisabled: (month) => isMonthCellDisabled(viewYear, month),
          onPick: (month) => pickModeValue(formatMonthValue(viewYear, month)),
        },
        periodView
      )
    ) : picker === 'quarter' ? (
      renderQuarterGrid(
        {
          year: viewYear,
          gridRef: modeGridRef,
          onKeyDown: handleModeGridKeyDown,
          isActive: (quarter) => value === formatQuarterValue(viewYear, quarter),
          isDisabled: (quarter) => isQuarterCellDisabled(viewYear, quarter),
          onPick: (quarter) => pickModeValue(formatQuarterValue(viewYear, quarter)),
        },
        periodView
      )
    ) : (
      renderYearGrid(
        {
          decadeStart: decadeStart(viewYear),
          gridRef: modeGridRef,
          onKeyDown: handleModeGridKeyDown,
          isActive: (year) => value === formatYearValue(year),
          isDisabled: isYearCellDisabled,
          onPick: (year) => pickModeValue(formatYearValue(year)),
        },
        periodView
      )
    );

    return (
      <div ref={setRootRef} data-slot='calendar' x-class={[calendarWrapper, className, classNames?.root]} {...rest}>
        <div data-slot='header' x-class={[header, classNames?.header]}>
          {renderStepButton(
            'prev',
            () =>
              drilled
                ? setModeYearsAnchor((year) => year - 10)
                : stepModePeriod(-1),
            previousLabel
          )}
          {drilled ? (
            renderDecadeTitle(modeYearsDecadeStart)
          ) : picker === 'year' ? (
            renderDecadeTitle(decadeStart(viewYear))
          ) : (
            /* The year title drills into the decade grid (the
                date mode's year title does the same from its header). */
            <button
              ref={yearTitleRef}
              data-slot='title'
              type='button'
              x-class={[titleBtn, headerTitle, classNames?.title]}
              aria-haspopup='grid'
              aria-expanded={modeYearsOpen}
              onClick={modeYearsOpen ? closeModeYears : openModeYears}
            >
              {viewYear}
            </button>
          )}
          <span data-slot='actions' x-class={[headerTrailing, classNames?.actions]}>
            <button
              data-slot='today-button'
              type='button'
              x-class={[headerBtn, classNames?.todayButton]}
              onClick={() => {
                if (drilled) setModeYearsOpen(false);
                goToday();
              }}
            >
              {strings.today}
            </button>
            {renderStepButton(
              'next',
              () =>
                drilled
                  ? setModeYearsAnchor((year) => year + 10)
                  : stepModePeriod(1),
              nextLabel
            )}
          </span>
        </div>
        {modeGrid}
      </div>
    );
  }

  return (
    <div ref={setRootRef} data-slot='calendar' x-class={[calendarWrapper, className, classNames?.root]} {...rest}>
      <div data-slot='header' x-class={[header, classNames?.header]}>
        <button
          data-slot='prev'
          type='button'
          x-class={[headerBtn, classNames?.prev]}
          onClick={goPrevMonth}
          aria-label={strings.previousMonth}
        >
          ‹
        </button>
        {/* Two drill-down titles in the locale's own month/year order:
            the month title opens the quick-select month grid, the year
            title the decade year grid — picking navigates the day view
            (the value still commits only at the picker's granularity). */}
        <span x-class={[headerTitles]}>
          {yearTitleFirst ? (
            <>
              {yearTitle}
              {monthTitle}
            </>
          ) : (
            <>
              {monthTitle}
              {yearTitle}
            </>
          )}
        </span>
        <span data-slot='actions' x-class={[headerTrailing, classNames?.actions]}>
          <button
            data-slot='today-button'
            type='button'
            x-class={[headerBtn, classNames?.todayButton]}
            onClick={goToday}
          >
            {strings.today}
          </button>
          <button
            data-slot='next'
            type='button'
            x-class={[headerBtn, classNames?.next]}
            onClick={goNextMonth}
            aria-label={strings.nextMonth}
          >
            ›
          </button>
        </span>
      </div>
      {panelView !== 'days'
        ? (yearsDrillView ?? monthsDrillView)
        : months === 2
          ? (
              <div data-slot='months' x-class={[monthPanels, classNames?.months]}>
                <div data-slot='month-panel' x-class={[monthPanel, classNames?.monthPanel]}>
                  {renderMonthPane(
                    { year: viewYear, month: viewMonth },
                    gridRef,
                    handleGridKeyDown,
                    paneView
                  )}
                </div>
                <div data-slot='month-panel' x-class={[monthPanel, classNames?.monthPanel]}>
                  <div data-slot='header' x-class={[paneHeader, classNames?.header]}>
                    <span data-slot='title' x-class={[headerTitle, classNames?.title]}>
                      {titleFormatter.format(
                        new Date(secondPane.year, secondPane.month)
                      )}
                    </span>
                  </div>
                  {renderMonthPane(
                    secondPane,
                    secondGridRef,
                    handleSecondGridKeyDown,
                    paneView
                  )}
                </div>
              </div>
            )
          : renderMonthPane(
              { year: viewYear, month: viewMonth },
              gridRef,
              handleGridKeyDown,
              paneView
            )}
    </div>
  );
}
