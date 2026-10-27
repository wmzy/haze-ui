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
import { clamp } from '../../utils/math';
import Button from '../Button/Button';
import {
  addDays,
  addMinutes,
  addMonthsToDate,
  formatDate,
  getLeadingDays,
  getWeekdayLabels,
  isSameDay,
  resolveWeekStart,
  startOfDay,
} from '../Calendar/date';
import { LocaleContext } from '../LocaleProvider/LocaleContext';
import Segmented from '../Segmented/Segmented';

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
  todayLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
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
const HOUR_HEIGHT = 56;
const DAY_HEIGHT = HOURS_PER_DAY * HOUR_HEIGHT;
const MINUTES_PER_DAY = HOURS_PER_DAY * 60;
const MAX_MONTH_CHIPS = 3;
const DRAG_THRESHOLD_PX = 4;
const NOW_TICK_MS = 60_000;

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function endOfDay(date: Date): Date {
  const day = startOfDay(date);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Plain-text projection of a ReactNode title, for aria-labels. */
function reactNodeText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(reactNodeText).filter(Boolean).join(' ');
  }
  if (typeof node === 'object' && 'props' in (node as object)) {
    return reactNodeText(
      (node as { props?: { children?: ReactNode } }).props?.children
    );
  }
  return '';
}

function snapToDateSlot(date: Date, slotMinutes: number): Date {
  const step = slotMinutes > 0 ? slotMinutes : 60;
  const snapped = Math.round(minutesOfDay(date) / step) * step;
  if (snapped >= MINUTES_PER_DAY) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );
  }
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    snapped
  );
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
    outline: 2px solid var(--haze-color-focus-ring);
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
  padding-block: var(--haze-space-05, 0);
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
  gap: var(--haze-space-05, 0);
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
  gap: var(--haze-space-05, 0);
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
    outline: 2px solid var(--haze-color-focus-ring);
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

const eventTitle = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const allDayChip = css`
  border: none;
  border-inline-start: var(--haze-space-1) solid var(--haze-color-primary);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-primary-subtle);
  color: var(--haze-color-text);
  font-size: var(--haze-text-xs);
  font-family: inherit;
  padding: var(--haze-space-1);
  text-align: start;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--haze-color-focus-ring);
    outline-offset: 1px;
  }
`;

const monthChip = css`
  border: none;
  border-inline-start: var(--haze-space-1) solid var(--haze-color-primary);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-primary-subtle);
  color: var(--haze-color-text);
  font-size: var(--haze-text-xs);
  font-family: inherit;
  padding: var(--haze-space-05, 0) var(--haze-space-1);
  text-align: start;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--haze-color-focus-ring);
    outline-offset: 1px;
  }
`;

const overflowChip = css`
  border: none;
  background: transparent;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
  font-family: inherit;
  padding: var(--haze-space-05, 0) var(--haze-space-1);
  text-align: start;
  cursor: pointer;
  align-self: flex-start;

  &:focus-visible {
    outline: 2px solid var(--haze-color-focus-ring);
    outline-offset: 1px;
  }

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
  todayLabel = 'Today',
  prevLabel = 'Previous',
  nextLabel = 'Next',
  viewLabels,
  locale,
  classNames,
  className,
  ref,
  ...rest
}: ScheduleProps) {
  const [view, setView] = useControl(viewControl, 'week');
  const [date, setDate] = useControl<Date>(dateControl, new Date());
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
      ((clientY - rect.top) / HOUR_HEIGHT) * 60,
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
    if (typeof pe.currentTarget.setPointerCapture === 'function') {
      pe.currentTarget.setPointerCapture(pe.pointerId);
    }
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
    const cellRtl = getDirection(ke.currentTarget) === 'rtl';
    const deltas: Record<string, number> = {
      ArrowLeft: cellRtl ? 1 : -1,
      ArrowRight: cellRtl ? -1 : 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const delta = deltas[ke.key];
    if (delta === undefined) return;
    ke.preventDefault();
    const nextIndex = clamp(index + delta, 0, monthCells.length - 1);
    const nextDay = monthCells[nextIndex];
    if (!nextDay) return;
    setRovingDate(nextDay);
    monthGridRef.current
      ?.querySelector<HTMLElement>(`[data-index="${nextIndex}"]`)
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
      { value: 'day', label: viewLabels?.day ?? 'Day' },
      { value: 'week', label: viewLabels?.week ?? 'Week' },
      { value: 'month', label: viewLabels?.month ?? 'Month' },
    ],
    [viewLabels]
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
                  allDayChip,
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
            style={{ blockSize: DAY_HEIGHT }}
            aria-hidden
          >
            {hours.map((h) => (
              <span
                key={h}
                data-slot='gutter-label'
                x-class={[gutterLabel]}
                style={{ top: h * HOUR_HEIGHT }}
              >
                {timeFormatters.hour.format(new Date(2026, 0, 1, h))}
              </span>
            ))}
          </div>
          <div
            data-slot='grid-body'
            ref={gridRef}
            x-class={[gridBody]}
            style={{ blockSize: DAY_HEIGHT }}
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
                  style={{ top: h * HOUR_HEIGHT, blockSize: HOUR_HEIGHT }}
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
                    chipColors[placement.event.color ?? 'primary'],
                    dragging && eventDragging,
                    classNames?.event,
                  ]}
                  style={{
                    top: (minutesOfDay(start) / 60) * HOUR_HEIGHT,
                    blockSize:
                      ((end.getTime() - start.getTime()) / MS_PER_MINUTE / 60) *
                      HOUR_HEIGHT,
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
                  <span data-slot='event-title' x-class={[eventTitle]}>
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
                  top: (minutesOfDay(now) / 60) * HOUR_HEIGHT,
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
      const key = formatDate(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );
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
              const dayKey = formatDate(
                day.getFullYear(),
                day.getMonth(),
                day.getDate()
              );
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
                  x-class={[monthCell, outside && monthCellOutside]}
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
                          monthChip,
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
                      x-class={[overflowChip]}
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
          aria-label={prevLabel}
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
          {todayLabel}
        </Button>
        <Button
          variant='ghost'
          size='sm'
          square
          aria-label={nextLabel}
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
