import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  Ref,
} from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { getDirection, useDirection } from '../../utils/direction';
import { outlineFocusVisible } from '../../utils/focus-ring';
import { nextGridRovingAction } from '../../utils/grid-roving';
import { clamp } from '../../utils/math';
import { truncate } from '../../utils/truncate';
import Button from '../Button/Button';
import {
  addDays,
  addMinutes,
  addMonthsToDate,
  formatDateOf,
  getLeadingDays,
  getWeekdayLabels,
  isSameDay,
  resolveWeekStart,
  startOfDay,
} from '../../utils/date-math';
import { LocaleContext } from '../LocaleProvider/LocaleContext';
import { useStrings } from '../LocaleProvider';
import Segmented from '../Segmented/Segmented';
import { capturePointer, releasePointerCaptureSafe } from '../../utils/pointer-capture';
import { reactNodeText } from '../../utils/text';

type ScheduleView = 'day' | 'week' | 'month';

type ScheduleEventColor =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral';

type ScheduleEvent = {
  id: string;
  start: Date | string;
  end: Date | string;
  title: ReactNode;
  color?: ScheduleEventColor;
  allDay?: boolean;
};

type ScheduleEventChange = { id: string; start: Date; end: Date };

type ScheduleBusinessHours = { start: number; end: number };

type ScheduleViewLabels = Partial<Record<ScheduleView, string>>;

/**
 * Semantic slot classes (AntD v6 `classNames` shape) for Schedule: one
 * record themes the toolbar and both grid kinds plus every event chip.
 * Consumer classes are appended at the end of each part's class list
 * (able to override component defaults).
 */
type ScheduleClassNames = {
  /** The root container (`data-slot='schedule'`). */
  root?: string;
  /** The toolbar strip — nav buttons, title and the view switcher
   *  (`data-slot='toolbar'`). */
  toolbar?: string;
  /** The day/week time grid (`data-slot='time-grid'`), header and
   *  all-day rows included. */
  timeGrid?: string;
  /** The month grid (`data-slot='month-grid'`). */
  monthGrid?: string;
  /** Every event chip across all views (`data-slot='event'`), the
   *  "+N" overflow chips excepted (`data-slot='overflow-chip'`). */
  event?: string;
}

type ScheduleProps = {
  /** Events to lay out. The component never mutates them — drag and
   * keyboard rescheduling surface through `onEventChange` and the
   * consumer owns the data. */
  events: ScheduleEvent[];
  /** Active view. Uncontrolled (`'week'`) or controlled. */
  view?: ControlOrValue<ScheduleView>;
  onViewChange?: (view: ScheduleView) => void;
  /** Anchor date the grid is centered on (defaults to today). */
  date?: ControlOrValue<Date>;
  onDateChange?: (date: Date) => void;
  /** Snap granularity in minutes for the day/week time grid (default 60). */
  slotMinutes?: number;
  /** Hour numbers (0–23); rows outside the window render muted. */
  businessHours?: ScheduleBusinessHours;
  /** Current-time line in day/week views (default true). */
  nowIndicator?: boolean;
  onEventClick?: (event: ScheduleEvent) => void;
  /** Fired when an event is moved by drag or arrow keys: duration is
   * preserved, start/end snapped to `slotMinutes`. */
  onEventChange?: (change: ScheduleEventChange) => void;
  /** Fired when a month-view day cell (or its "+N" overflow chip) is
   * activated. Cells stay inert unless this is provided. */
  onDayClick?: (date: Date) => void;
  /** Row height of one hour in the day/week grid, px (default 56 —
   * sized so a 30-minute block fits the chip's two-line content). */
  hourHeight?: number;
  /** Today button text; defaults to the `schedule.today` locale pack
   *  entry ('Today'). */
  todayLabel?: string;
  /** Previous nav button's accessible name; defaults to the
   *  `schedule.previous` pack entry ('Previous'). */
  prevLabel?: string;
  /** Next nav button's accessible name; defaults to the
   *  `schedule.next` pack entry ('Next'). */
  nextLabel?: string;
  /** Per-view Segmented labels; keys absent here fall back to the
   *  matching `schedule.day` / `week` / `month` pack entry. */
  viewLabels?: ScheduleViewLabels;
  /** BCP 47 locale for weekday/month/time formatting; falls back to the
   * LocaleProvider chain, then the browser default. */
  locale?: string;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape), keyed by the
   * structural parts (see {@link ScheduleClassNames}). Slot classes are
   * appended at the end of each part's class list; per-part `className`
   * stays on the root and still lands after the `root` slot. Not
   * passing it renders identical output.
   */
  classNames?: ScheduleClassNames;
  className?: string;
  /** Forwarded to the root container `<div>` (`data-slot='schedule'`). */
  ref?: Ref<HTMLDivElement>;
} & ComponentPropsWithoutRef<'div'>;

type DropPosition = { dayIndex: number; minutes: number };

type DropContext = {
  /** Start-of-day for every visible column, in reading order. */
  days: Date[];
  eventStart: Date;
  eventEnd: Date;
  /** Column index / minute-of-day the pointer grabbed the event at. */
  grabDayIndex: number;
  grabMinutes: number;
  slotMinutes: number;
};

type TimedPlacement = {
  event: ScheduleEvent;
  start: Date;
  end: Date;
  dayIndex: number;
  column: number;
  columns: number;
};

type AllDayPlacement = {
  event: ScheduleEvent;
  startCol: number;
  span: number;
};

type DragState = {
  id: string;
  pointerId: number;
  grabDayIndex: number;
  grabMinutes: number;
  startX: number;
  startY: number;
  start: Date;
  end: Date;
};

const MS_PER_MINUTE = 60_000;
const HOURS_PER_DAY = 24;
/**
 * Default row height of one hour in the day/week grid, px. 56 keeps a
 * `slotMinutes`-snapped 30-minute block (~28px) tall enough for the
 * event chip's two-line time+title content at `--haze-text-xs` with
 * its 1-line vertical gap — thinner rows clip the title line.
 */
const HOUR_HEIGHT = 56;
const MINUTES_PER_DAY = HOURS_PER_DAY * 60;
const MAX_MONTH_CHIPS = 3;
const DRAG_THRESHOLD_PX = 4;
const NOW_TICK_MS = 60_000;

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Exclusive end of a civil day — the following midnight. */
function endOfDay(date: Date): Date {
  return addDays(startOfDay(date), 1);
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Snap to the nearest `slotMinutes` boundary of the day — minute
 * resolution (date-math's own), matching the grids' slot semantics. */
function snapToDateSlot(date: Date, slotMinutes: number): Date {
  const step = slotMinutes > 0 ? slotMinutes : 60;
  const snapped = Math.round(minutesOfDay(date) / step) * step;
  return snapped >= MINUTES_PER_DAY
    ? addDays(startOfDay(date), 1)
    : addMinutes(startOfDay(date), snapped);
}

/**
 * Drop-position → rescheduled range, pure so the snap/day-shift/duration
 * math can be unit-tested without a DOM. The day index is clamped into
 * the visible columns, the raw pointer delta (drop − grab) shifts the
 * event civilly, the start snaps to the nearest `slotMinutes` boundary
 * of its day, and the original duration is re-attached.
 */
// eslint-disable-next-line react-refresh/only-export-components -- computeDropTime 必须与组件同文件导出供测试直测（ToastContainer / floating.tsx 同一条 suppression）
export function computeDropTime(
  position: DropPosition,
  context: DropContext
): { start: Date; end: Date } {
  const lastIndex = Math.max(context.days.length - 1, 0);
  const dayIndex = clamp(position.dayIndex, 0, lastIndex);
  const deltaDays = dayIndex - context.grabDayIndex;
  const durationMs = context.eventEnd.getTime() - context.eventStart.getTime();
  const shifted = addMinutes(
    addDays(context.eventStart, deltaDays),
    position.minutes - context.grabMinutes
  );
  const start = snapToDateSlot(shifted, context.slotMinutes);
  return { start, end: new Date(start.getTime() + durationMs) };
}

/** Greedy column split for overlapping same-day events: each event
 * lands in the first column whose previous occupant ended, `columns`
 * is the day's total so siblings share the column width. */
function layoutTimed(
  events: ScheduleEvent[],
  days: Date[]
): TimedPlacement[] {
  const placements: TimedPlacement[] = [];
  days.forEach((day, dayIndex) => {
    const dayEnd = endOfDay(day);
    const entries = events
      .filter(
        (event) =>
          !event.allDay && isSameDay(startOfDay(toDate(event.start)), day)
      )
      .map((event) => {
        const start = toDate(event.start);
        const end = toDate(event.end);
        return { event, start, end: end > dayEnd ? dayEnd : end };
      })
      .sort(
        (a, b) =>
          a.start.getTime() - b.start.getTime() ||
          a.end.getTime() - b.end.getTime()
      );
    const columnEnds: number[] = [];
    const placed = entries.map((entry) => {
      let column = columnEnds.findIndex(
        (end) => end <= entry.start.getTime()
      );
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(entry.end.getTime());
      } else {
        columnEnds[column] = Math.max(
          columnEnds[column] ?? entry.end.getTime(),
          entry.end.getTime()
        );
      }
      return { ...entry, dayIndex, column };
    });
    const columns = Math.max(columnEnds.length, 1);
    placed.forEach((p) => placements.push({ ...p, columns }));
  });
  return placements;
}

function layoutAllDay(
  events: ScheduleEvent[],
  days: Date[]
): AllDayPlacement[] {
  return events
    .filter((event) => event.allDay)
    .map((event) => {
      const startDay = startOfDay(toDate(event.start));
      const endDay = startOfDay(toDate(event.end));
      const startCol = days.findIndex(
        (day) => day.getTime() >= startDay.getTime()
      );
      if (startCol === -1) return null;
      let lastCol = -1;
      days.forEach((day, i) => {
        if (day.getTime() <= endDay.getTime()) lastCol = i;
      });
      if (lastCol < startCol) return null;
      return { event, startCol, span: lastCol - startCol + 1 };
    })
    .filter((placement): placement is AllDayPlacement => placement !== null)
    .sort((a, b) => a.startCol - b.startCol);
}

const root = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-2);
  min-inline-size: 0;
  color: var(--haze-color-text);
`;

const toolbar = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  flex-wrap: wrap;
`;

const toolbarTitle = css`
  font-size: var(--haze-text-base);
  font-weight: var(--haze-weight-medium);
  margin-inline: var(--haze-space-1);
`;

const monthGrid = css`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  overflow: hidden;
`;

const monthWeekdays = css`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  background: var(--haze-color-bg-subtle);
`;

const monthWeekday = css`
  padding: var(--haze-space-2);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-secondary);
  text-align: center;
`;

const monthRow = css`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
`;

const monthCell = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  min-block-size: 6rem;
  padding: var(--haze-space-1);
  border-block-start: 1px solid var(--haze-color-border);
  border-inline-start: 1px solid var(--haze-color-border);

  &:focus-visible {
    outline-offset: -2px;
  }
`;

const monthCellOutside = css`
  color: var(--haze-color-text-muted);
  background: var(--haze-color-bg-muted);
`;

const monthDay = css`
  align-self: flex-end;
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-secondary);
  min-inline-size: var(--haze-space-5);
  /* 2px (half of space-1) has no ladder rung — the steps (1-6, 8, 10, 12,
     16) skip 05, so the literal stays (InlineEdit's 1.75rem precedent). */
  padding-block: 2px;
  text-align: center;
`;

const monthDayToday = css`
  background: var(--haze-color-primary);
  color: var(--haze-color-text-inverse);
  border-radius: var(--haze-radius-full);
  font-weight: var(--haze-weight-medium);
`;

const timeGrid = css`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  overflow: hidden;
`;

const headerRow = css`
  display: flex;
  border-block-end: 1px solid var(--haze-color-border);
`;

const headerGutter = css`
  inline-size: var(--haze-space-16);
  flex: none;
  border-inline-end: 1px solid var(--haze-color-border);
`;

const headerColumns = css`
  flex: 1;
  min-inline-size: 0;
  display: grid;
`;

const dayHeaderCell = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding-block: var(--haze-space-1);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-secondary);
`;

const dayHeaderNum = css`
  font-size: var(--haze-text-sm);
`;

const dayHeaderNumToday = css`
  min-inline-size: var(--haze-space-6);
  block-size: var(--haze-space-6);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--haze-color-primary);
  color: var(--haze-color-text-inverse);
  border-radius: var(--haze-radius-full);
  font-weight: var(--haze-weight-medium);
`;

const allDayColumns = css`
  flex: 1;
  min-inline-size: 0;
  display: grid;
  gap: var(--haze-space-1);
  padding: var(--haze-space-1);
  grid-auto-rows: minmax(var(--haze-space-6), auto);
  align-items: start;
`;

const gridScroll = css`
  overflow-y: auto;
`;

const bodyRow = css`
  display: flex;
`;

const gutter = css`
  position: relative;
  flex: none;
  inline-size: var(--haze-space-16);
  border-inline-end: 1px solid var(--haze-color-border);
`;

const gutterLabel = css`
  position: absolute;
  inset-inline-end: var(--haze-space-2);
  transform: translateY(-50%);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  white-space: nowrap;
`;

const gridBody = css`
  position: relative;
  flex: 1;
  min-inline-size: 0;
  touch-action: none;
`;

const timeRow = css`
  position: absolute;
  inset-inline: 0;
  border-block-start: 1px solid var(--haze-color-border);
`;

const timeRowOff = css`
  background: var(--haze-color-bg-muted);
`;

const eventBlock = css`
  position: absolute;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--haze-space-1);
  border: none;
  border-inline-start: var(--haze-space-1) solid var(--haze-color-primary);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-primary-subtle);
  color: var(--haze-color-text);
  font-size: var(--haze-text-xs);
  line-height: var(--haze-leading-tight);
  font-family: inherit;
  text-align: start;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  touch-action: none;
  z-index: var(--haze-z-local-1);

  &:focus-visible {
    outline-offset: 1px;
  }

  &:hover {
    opacity: 0.9;
  }
`;

const eventDragging = css`
  cursor: grabbing;
  box-shadow: var(--haze-shadow-md);
  z-index: var(--haze-z-local-2);
  opacity: 0.9;
`;

const eventTime = css`
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-secondary);
`;

/** Chip skeleton shared by the all-day row, month cells, and the month
 * overflow toggle; the variant classes below carry only their deltas
 * (outline itself comes from `outlineFocusVisible`, clipping from the
 * shared `truncate` (utils/truncate), both composed via x-class). */
const chipBase = css`
  border: none;
  font-size: var(--haze-text-xs);
  font-family: inherit;
  padding: 2px var(--haze-space-1);
  text-align: start;
  cursor: pointer;

  &:focus-visible {
    outline-offset: 1px;
  }
`;

/** Event-colored chip (colored bar + pill skin); all-day rows override
 * the padding to the roomier full step. */
const allDayChip = css`
  border-inline-start: var(--haze-space-1) solid var(--haze-color-primary);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-primary-subtle);
  color: var(--haze-color-text);
  padding: var(--haze-space-1);
`;

const monthChip = css`
  border-inline-start: var(--haze-space-1) solid var(--haze-color-primary);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-primary-subtle);
  color: var(--haze-color-text);
`;

const overflowChip = css`
  background: transparent;
  color: var(--haze-color-text-muted);
  align-self: flex-start;

  &:hover {
    color: var(--haze-color-text);
  }
`;

const nowLine = css`
  position: absolute;
  inset-inline: 0;
  border-block-start: 2px solid var(--haze-color-danger);
  pointer-events: none;
  z-index: var(--haze-z-local-3);
`;

const nowDot = css`
  position: absolute;
  inset-inline-start: calc(-1 * var(--haze-space-1));
  inset-block-start: calc(-1 * var(--haze-space-1));
  inline-size: var(--haze-space-2);
  block-size: var(--haze-space-2);
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-danger);
`;

const chipColors: Record<ScheduleEventColor, string> = {
  primary: css`
    background: var(--haze-color-primary-subtle);
    border-inline-start-color: var(--haze-color-primary);
  `,
  success: css`
    background: var(--haze-color-success-subtle);
    border-inline-start-color: var(--haze-color-success);
  `,
  danger: css`
    background: var(--haze-color-danger-subtle);
    border-inline-start-color: var(--haze-color-danger);
  `,
  warning: css`
    background: var(--haze-color-warning-subtle);
    border-inline-start-color: var(--haze-color-warning);
  `,
  info: css`
    background: var(--haze-color-info-subtle);
    border-inline-start-color: var(--haze-color-info);
  `,
  neutral: css`
    background: var(--haze-color-bg-muted);
    border-inline-start-color: var(--haze-color-border);
    color: var(--haze-color-text-secondary);
  `,
};

export default function Schedule({
  events,
  view: viewControl,
  onViewChange,
  date: dateControl,
  onDateChange,
  slotMinutes,
  businessHours,
  nowIndicator = true,
  onEventClick,
  onEventChange,
  onDayClick,
  hourHeight = HOUR_HEIGHT,
  todayLabel,
  prevLabel,
  nextLabel,
  viewLabels,
  locale,
  classNames,
  className,
  ref,
  ...rest
}: ScheduleProps) {
  const [view, setView] = useControl(viewControl, 'week');
  const [date, setDate] = useControl<Date>(dateControl, new Date());
  const strings = useStrings('schedule');
  const todayText = todayLabel ?? strings.today;
  const prevText = prevLabel ?? strings.previous;
  const nextText = nextLabel ?? strings.next;
  const dayHeight = HOURS_PER_DAY * hourHeight;
  const contextLocale = useContext(LocaleContext)?.locale;
  const resolvedLocale = locale ?? contextLocale;
  const direction = useDirection();
  const rtl = direction === 'rtl';

  const anchor = toDate(date);
  const anchorDay = startOfDay(anchor);
  const anchorKey = anchorDay.getTime();
  const slotStep = slotMinutes !== undefined && slotMinutes > 0 ? slotMinutes : 60;
  // Locale-aware first column (Date#getDay semantics), shared with
  // Calendar's grids — the legacy hard-wired Sunday-first grid applies
  // whenever no locale resolves (Calendar's resolveWeekStart default).
  const weekStart = resolveWeekStart(resolvedLocale, undefined);

  const days = useMemo<Date[]>(() => {
    if (view === 'month') return [];
    const day = new Date(anchorKey);
    if (view === 'day') return [day];
    const weekStartDate = addDays(day, -((day.getDay() - weekStart + 7) % 7));
    return Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));
  }, [view, anchorKey, weekStart]);

  const monthCells = useMemo<Date[]>(() => {
    const anchorDate = new Date(anchorKey);
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();
    // Calendar's leading-days math anchors the grid start (locale-aware
    // week start); the grid itself stays the fixed six rows (42 cells)
    // Schedule has always rendered.
    const first = new Date(year, month, 1);
    const gridStart = addDays(first, -getLeadingDays(year, month, weekStart));
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [anchorKey, weekStart]);

  const weekdayLabels = useMemo(
    () => getWeekdayLabels(resolvedLocale, weekStart),
    [resolvedLocale, weekStart]
  );

  const placements = useMemo(
    () => (view === 'month' ? [] : layoutTimed(events, days)),
    [events, days, view]
  );

  const allDayPlacements = useMemo(
    () => (view === 'month' ? [] : layoutAllDay(events, days)),
    [events, days, view]
  );

  const titleText = useMemo(() => {
    const withLocale = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(resolvedLocale ?? 'default', options);
    const anchorDate = new Date(anchorKey);
    if (view === 'month') {
      return withLocale({ month: 'long', year: 'numeric' }).format(anchorDate);
    }
    if (view === 'day') {
      return withLocale({
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(anchorDate);
    }
    const range = withLocale({ month: 'short', day: 'numeric' });
    const first = days[0] ?? anchorDate;
    const last = days[days.length - 1] ?? anchorDate;
    return `${range.format(first)} – ${range.format(last)}`;
  }, [view, resolvedLocale, anchorKey, days]);

  const [now, setNow] = useState(() => new Date());
  const nowDayIndex = days.findIndex((day) => isSameDay(day, now));
  const nowVisible = nowIndicator && nowDayIndex >= 0;

  useEffect(() => {
    if (!nowVisible) return;
    const timer = window.setInterval(() => setNow(new Date()), NOW_TICK_MS);
    return () => window.clearInterval(timer);
  }, [nowVisible]);

  const [rovingDate, setRovingDate] = useState<Date>(() => anchorDay);
  const monthGridRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const movedRef = useRef(false);
  const [dragPreview, setDragPreview] = useState<{
    id: string;
    start: Date;
    end: Date;
    dayIndex: number;
  } | null>(null);

  const step = (direction: 1 | -1) => {
    const next =
      view === 'day'
        ? addDays(anchor, direction)
        : view === 'week'
          ? addDays(anchor, direction * 7)
          : addMonthsToDate(anchor, direction);
    setDate(next);
    onDateChange?.(next);
  };

  const goToday = () => {
    const next = startOfDay(new Date());
    setDate(next);
    onDateChange?.(next);
  };

  const changeView = (next: string) => {
    const nextView = next as ScheduleView;
    setView(nextView);
    onViewChange?.(nextView);
  };

  const pointerToPosition = (
    clientX: number,
    clientY: number
  ): DropPosition | null => {
    const grid = gridRef.current;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    if (rect.width <= 0) return null;
    const minutes = clamp(
      ((clientY - rect.top) / hourHeight) * 60,
      0,
      MINUTES_PER_DAY - 1
    );
    const fraction =
      getDirection(grid) === 'rtl'
        ? (rect.right - clientX) / rect.width
        : (clientX - rect.left) / rect.width;
    const dayIndex = clamp(
      Math.floor(fraction * days.length),
      0,
      days.length - 1
    );
    return { dayIndex, minutes };
  };

  const dropContext = (drag: DragState): DropContext => ({
    days,
    eventStart: drag.start,
    eventEnd: drag.end,
    grabDayIndex: drag.grabDayIndex,
    grabMinutes: drag.grabMinutes,
    slotMinutes: slotStep,
  });

  const handleChipPointerDown = (
    event: ScheduleEvent,
    start: Date,
    end: Date,
    pe: ReactPointerEvent<HTMLButtonElement>
  ) => {
    if (pe.button !== 0) return;
    const position = pointerToPosition(pe.clientX, pe.clientY);
    if (!position) return;
    dragRef.current = {
      id: event.id,
      pointerId: pe.pointerId,
      grabDayIndex: position.dayIndex,
      grabMinutes: position.minutes,
      startX: pe.clientX,
      startY: pe.clientY,
      start,
      end,
    };
    movedRef.current = false;
    capturePointer(pe.currentTarget, pe.pointerId);
  };

  const handleChipPointerMove = (pe: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain -- 保持 drag 的非空收窄，optional chain 写法会丢失 narrowing
    if (!drag || pe.pointerId !== drag.pointerId) return;
    if (
      Math.abs(pe.clientX - drag.startX) > DRAG_THRESHOLD_PX ||
      Math.abs(pe.clientY - drag.startY) > DRAG_THRESHOLD_PX
    ) {
      movedRef.current = true;
    }
    const position = pointerToPosition(pe.clientX, pe.clientY);
    if (!position) return;
    const { start, end } = computeDropTime(position, dropContext(drag));
    setDragPreview({ id: drag.id, start, end, dayIndex: position.dayIndex });
  };

  const finishDrag = (pe: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain -- 保持 drag 的非空收窄，optional chain 写法会丢失 narrowing
    if (!drag || pe.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    releasePointerCaptureSafe(pe.currentTarget, pe.pointerId);
    const position = pointerToPosition(pe.clientX, pe.clientY);
    if (movedRef.current && position) {
      const { start, end } = computeDropTime(position, dropContext(drag));
      onEventChange?.({ id: drag.id, start, end });
    }
    setDragPreview(null);
  };

  const handleChipClick = (event: ScheduleEvent) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onEventClick?.(event);
  };

  const handleChipKeyDown = (
    ke: ReactKeyboardEvent<HTMLButtonElement>,
    event: ScheduleEvent,
    start: Date,
    end: Date
  ) => {
    let dayDelta = 0;
    let minuteDelta = 0;
    switch (ke.key) {
      case 'ArrowUp':
        minuteDelta = -slotStep;
        break;
      case 'ArrowDown':
        minuteDelta = slotStep;
        break;
      case 'ArrowRight':
        dayDelta = getDirection(ke.currentTarget) === 'rtl' ? -1 : 1;
        break;
      case 'ArrowLeft':
        dayDelta = getDirection(ke.currentTarget) === 'rtl' ? 1 : -1;
        break;
      default:
        return;
    }
    ke.preventDefault();
    const durationMs = end.getTime() - start.getTime();
    const nextStart = addMinutes(addDays(start, dayDelta), minuteDelta);
    onEventChange?.({
      id: event.id,
      start: nextStart,
      end: new Date(nextStart.getTime() + durationMs),
    });
  };

  const handleMonthKeyDown = (ke: ReactKeyboardEvent<HTMLDivElement>) => {
    const cell = (ke.target as HTMLElement).closest<HTMLElement>(
      '[data-slot="month-cell"]'
    );
    if (!cell) return;
    const index = Number(cell.dataset.index);
    if (!Number.isInteger(index)) return;
    const action = nextGridRovingAction(
      ke.key,
      index,
      getDirection(ke.currentTarget) === 'rtl',
      // Month cells are never disabled; the shared walker's
      // edge-stopping replaces the former raw clamp, so an off-grid
      // move stays put instead of pinning to the grid's corner.
      { columns: 7, count: monthCells.length, isDisabled: () => false }
    );
    if (action?.type !== 'move') return;
    ke.preventDefault();
    const nextDay = monthCells[action.target];
    if (!nextDay) return;
    setRovingDate(nextDay);
    monthGridRef.current
      ?.querySelector<HTMLElement>(`[data-index="${action.target}"]`)
      ?.focus();
  };

  const colPct = days.length > 0 ? 100 / days.length : 100;
  const hours = Array.from({ length: HOURS_PER_DAY }, (_, h) => h);

  const timeFormatters = useMemo(() => {
    const tag = resolvedLocale ?? 'default';
    return {
      hour: new Intl.DateTimeFormat(tag, { hour: 'numeric' }),
      time: new Intl.DateTimeFormat(tag, {
        hour: 'numeric',
        minute: '2-digit',
      }),
      dayNum: new Intl.DateTimeFormat(tag, { day: 'numeric' }),
      cell: new Intl.DateTimeFormat(tag, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  }, [resolvedLocale]);

  const viewOptions = useMemo(
    () => [
      { value: 'day', label: viewLabels?.day ?? strings.day },
      { value: 'week', label: viewLabels?.week ?? strings.week },
      { value: 'month', label: viewLabels?.month ?? strings.month },
    ],
    [viewLabels, strings]
  );

  /** Physical left edge for one column of a day's overlap split — RTL
   * mirrors so column 0 hugs the reading-start edge. */
  const columnLeft = (dayIndex: number, column: number, columns: number) => {
    const columnWidth = colPct / columns;
    const logicalLeft = dayIndex * colPct + column * columnWidth;
    return rtl ? 100 - logicalLeft - columnWidth : logicalLeft;
  };

  const renderTimeGrid = () => (
    <div
      data-slot='time-grid'
      x-class={[timeGrid, classNames?.timeGrid]}
    >
      <div data-slot='day-header' x-class={[headerRow]}>
        <div x-class={[headerGutter]} aria-hidden />
        <div
          x-class={[headerColumns]}
          style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
        >
          {days.map((day) => {
            const today = isSameDay(day, now);
            // The labels run weekStart-first, so a day's label sits at
            // its column offset from the week start.
            const weekdayIndex = (day.getDay() - weekStart + 7) % 7;
            return (
              <div
                key={day.getTime()}
                data-slot='day-header-cell'
                x-class={[dayHeaderCell]}
              >
                <span>{weekdayLabels[weekdayIndex] ?? ''}</span>
                <span
                  x-class={[dayHeaderNum, today && dayHeaderNumToday]}
                >
                  {timeFormatters.dayNum.format(day)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {allDayPlacements.length > 0 && (
        <div data-slot='all-day-row' x-class={[headerRow]}>
          <div x-class={[headerGutter]} aria-hidden />
          <div
            x-class={[allDayColumns]}
            style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
          >
            {allDayPlacements.map((placement) => (
              <button
                key={placement.event.id}
                type='button'
                data-slot='event'
                x-class={[
                  chipBase,
                  allDayChip,
                  truncate,
                  outlineFocusVisible,
                  chipColors[placement.event.color ?? 'primary'],
                  classNames?.event,
                ]}
                style={{
                  gridColumn: `${placement.startCol + 1} / span ${placement.span}`,
                }}
                aria-label={reactNodeText(placement.event.title)}
                onClick={() => onEventClick?.(placement.event)}
              >
                {placement.event.title}
              </button>
            ))}
          </div>
        </div>
      )}
      <div data-slot='grid-scroll' x-class={[gridScroll]}>
        <div x-class={[bodyRow]}>
          <div
            data-slot='time-gutter'
            x-class={[gutter]}
            style={{ blockSize: dayHeight }}
            aria-hidden
          >
            {hours.map((h) => (
              <span
                key={h}
                data-slot='gutter-label'
                x-class={[gutterLabel]}
                style={{ top: h * hourHeight }}
              >
                {timeFormatters.hour.format(new Date(2026, 0, 1, h))}
              </span>
            ))}
          </div>
          <div
            data-slot='grid-body'
            ref={gridRef}
            x-class={[gridBody]}
            style={{ blockSize: dayHeight }}
          >
            {hours.map((h) => {
              const off =
                businessHours !== undefined &&
                (h < businessHours.start || h >= businessHours.end);
              return (
                <div
                  key={h}
                  data-slot='time-row'
                  data-off-hours={off ? '' : undefined}
                  x-class={[timeRow, off && timeRowOff]}
                  style={{ top: h * hourHeight, blockSize: hourHeight }}
                  aria-hidden
                />
              );
            })}
            {placements.map((placement) => {
              const dragging = dragPreview?.id === placement.event.id;
              const start = dragging ? dragPreview.start : placement.start;
              const end = dragging ? dragPreview.end : placement.end;
              const dayIndex = dragging
                ? dragPreview.dayIndex
                : placement.dayIndex;
              const spanColumns = placement.columns;
              const columnWidth = colPct / spanColumns;
              const title = reactNodeText(placement.event.title);
              const range = `${timeFormatters.time.format(start)} – ${timeFormatters.time.format(end)}`;
              const label = [title, range].filter(Boolean).join(', ');
              return (
                <button
                  key={placement.event.id}
                  type='button'
                  data-slot='event'
                  x-class={[
                    eventBlock,
                    outlineFocusVisible,
                    chipColors[placement.event.color ?? 'primary'],
                    dragging && eventDragging,
                    classNames?.event,
                  ]}
                  style={{
                    top: (minutesOfDay(start) / 60) * hourHeight,
                    blockSize:
                      ((end.getTime() - start.getTime()) / MS_PER_MINUTE / 60) *
                      hourHeight,
                    left: `${columnLeft(dayIndex, placement.column, spanColumns)}%`,
                    inlineSize: `${columnWidth}%`,
                  }}
                  aria-label={label}
                  onPointerDown={(pe) =>
                    handleChipPointerDown(
                      placement.event,
                      placement.start,
                      placement.end,
                      pe
                    )
                  }
                  onPointerMove={handleChipPointerMove}
                  onPointerUp={finishDrag}
                  onPointerCancel={finishDrag}
                  onKeyDown={(ke) =>
                    handleChipKeyDown(
                      ke,
                      placement.event,
                      placement.start,
                      placement.end
                    )
                  }
                  onClick={() => handleChipClick(placement.event)}
                >
                  <span data-slot='event-time' x-class={[eventTime]}>
                    {timeFormatters.time.format(start)}
                  </span>
                  <span data-slot='event-title' x-class={[truncate]}>
                    {placement.event.title}
                  </span>
                </button>
              );
            })}
            {nowVisible && (
              <div
                data-slot='now-indicator'
                x-class={[nowLine]}
                style={{
                  top: (minutesOfDay(now) / 60) * hourHeight,
                  left: `${columnLeft(nowDayIndex, 0, 1)}%`,
                  inlineSize: `${colPct}%`,
                }}
                aria-hidden
              >
                <span data-slot='now-indicator-dot' x-class={[nowDot]} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonth = () => {
    const focusDate = monthCells.some((day) => isSameDay(day, rovingDate))
      ? rovingDate
      : anchorDay;
    const eventsByDay = new Map<string, ScheduleEvent[]>();
    events.forEach((event) => {
      const start = startOfDay(toDate(event.start));
      const key = formatDateOf(start);
      const list = eventsByDay.get(key);
      if (list) {
        list.push(event);
      } else {
        eventsByDay.set(key, [event]);
      }
    });
    return (
      <div
        data-slot='month-grid'
        x-class={[monthGrid, classNames?.monthGrid]}
        role='grid'
        aria-label={titleText}
        ref={monthGridRef}
        onKeyDown={handleMonthKeyDown}
      >
        <div role='row' x-class={[monthWeekdays]}>
          {weekdayLabels.map((label) => (
            <div
              key={label}
              role='columnheader'
              data-slot='month-weekday'
              x-class={[monthWeekday]}
            >
              {label}
            </div>
          ))}
        </div>
        {Array.from({ length: monthCells.length / 7 }, (_, week) => (
          <div key={week} role='row' x-class={[monthRow]}>
            {monthCells.slice(week * 7, week * 7 + 7).map((day, i) => {
              const index = week * 7 + i;
              const outside = day.getMonth() !== anchor.getMonth();
              const today = isSameDay(day, now);
              const dayKey = formatDateOf(day);
              const dayEvents = eventsByDay.get(dayKey) ?? [];
              const visible = dayEvents.slice(0, MAX_MONTH_CHIPS);
              const hiddenCount = dayEvents.length - visible.length;
              return (
                <div
                  key={day.getTime()}
                  role='gridcell'
                  data-slot='month-cell'
                  data-index={index}
                  data-date={dayKey}
                  data-outside={outside ? '' : undefined}
                  x-class={[monthCell, outlineFocusVisible, outside && monthCellOutside]}
                  tabIndex={isSameDay(day, focusDate) ? 0 : -1}
                  aria-label={timeFormatters.cell.format(day)}
                  onClick={() => onDayClick?.(day)}
                  onKeyDown={(ke) => {
                    // Chips handle their own Enter/Space natively — only
                    // the cell itself activates onDayClick.
                    if (ke.target !== ke.currentTarget) return;
                    if (ke.key === 'Enter' || ke.key === ' ') {
                      ke.preventDefault();
                      onDayClick?.(day);
                    }
                  }}
                >
                  <span
                    data-slot='month-day'
                    x-class={[monthDay, today && monthDayToday]}
                  >
                    {timeFormatters.dayNum.format(day)}
                  </span>
                  {visible.map((event) => {
                    const title = reactNodeText(event.title);
                    const time = event.allDay
                      ? ''
                      : timeFormatters.time.format(toDate(event.start));
                    return (
                      <button
                        key={event.id}
                        type='button'
                        data-slot='event'
                        x-class={[
                          chipBase,
                          monthChip,
                          truncate,
                          outlineFocusVisible,
                          chipColors[event.color ?? 'primary'],
                          classNames?.event,
                        ]}
                        aria-label={[title, time].filter(Boolean).join(', ')}
                        onClick={(ce) => {
                          ce.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        {event.title}
                      </button>
                    );
                  })}
                  {hiddenCount > 0 && (
                    <button
                      type='button'
                      data-slot='overflow-chip'
                      x-class={[chipBase, overflowChip, outlineFocusVisible]}
                      onClick={(ce) => {
                        ce.stopPropagation();
                        onDayClick?.(day);
                      }}
                    >
                      +{hiddenCount}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={ref} data-slot='schedule' x-class={[root, classNames?.root, className]} {...rest}>
      <div data-slot='toolbar' x-class={[toolbar, classNames?.toolbar]}>
        <Button
          variant='ghost'
          size='sm'
          square
          aria-label={prevText}
          data-slot='prev'
          onClick={() => step(-1)}
        >
          ‹
        </Button>
        <Button
          variant='outline'
          size='sm'
          data-slot='today'
          onClick={goToday}
        >
          {todayText}
        </Button>
        <Button
          variant='ghost'
          size='sm'
          square
          aria-label={nextText}
          data-slot='next'
          onClick={() => step(1)}
        >
          ›
        </Button>
        <div data-slot='title' x-class={[toolbarTitle]}>
          {titleText}
        </div>
        <Segmented
          options={viewOptions}
          value={view}
          onChange={changeView}
          size='sm'
        />
      </div>
      {view === 'month' ? renderMonth() : renderTimeGrid()}
    </div>
  );
}

export type {
  ScheduleProps,
  ScheduleClassNames,
  ScheduleEvent,
  ScheduleView,
  ScheduleEventChange,
  ScheduleEventColor,
  ScheduleBusinessHours,
  ScheduleViewLabels,
};
