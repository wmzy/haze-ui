import type { ComponentPropsWithoutRef, CSSProperties, Ref } from 'react';

import { truncate } from '../../utils/truncate';

// sibling module (not `styles.ts`) — Linaria derives dev class names from
// the file basename, and a shared `styles` basename collides with
// Button/styles.ts (identical `haze-styles__*` selectors cross-wire the
// two components' rules in dev AND collide in dist css)
import {
  heatmapBase,
  heatmapCell,
  heatmapCellEmpty,
  heatmapMonth,
  heatmapWeekday,
} from './heatmap-styles';

/**
 * Heatmap — a GitHub-style activity calendar: week columns × weekday
 * rows of squares, intensity-binned by value. Pure rendering from
 * props (no hooks — listed in scripts/rsc-safe.mjs): all i18n surface
 * is label props (`getLabel` / `getMonthLabel` / `getWeekdayLabel` /
 * `summary`) instead of LocaleProvider keys, so the English literals
 * below are deliberate RSC-safe defaults, not missed hook-ups.
 *
 * Layout is one CSS grid: row 1 carries month labels (each spanning
 * the week columns whose Saturday opens that month), column 1 the
 * weekday labels, and every day square is placed by explicit
 * gridRow/gridColumn — no nested wrappers, so labels and cells cannot
 * drift apart. The date range aligns outward to full Sunday..Saturday
 * weeks and defaults to the data's own extent.
 *
 * Accessibility: the calendar renders `role="img"` named by `summary`
 * (one announcement for the whole graphic — screen readers would
 * otherwise drown in hundreds of squares). Inside an image every child
 * is presentational, so cells carry their `getLabel` text as a native
 * `title` tooltip (and `data-date`/`data-level` for custom tooltip
 * wiring) — an `aria-label` there would be swallowed by the img role
 * and is prohibited on role-less elements besides.
 */
type HeatmapDatum = { date: string; value: number };

/**
 * Semantic slot classes (AntD v6 `classNames` shape): keys mirror the
 * data-slot values each part carries, appended after the component
 * defaults so consumer classes can override them.
 */
type HeatmapClassNames = {
  /** The grid root (`data-slot='heatmap'`). */
  root?: string;
  /** Every month label (`data-slot='month'`). */
  month?: string;
  /** Every weekday label (`data-slot='weekday'`). */
  weekday?: string;
  /** Every day square (`data-slot='cell'`). */
  cell?: string;
};

type HeatmapProps = {
  /** Activity data, one entry per `'YYYY-MM-DD'` date (later duplicates win). */
  data?: HeatmapDatum[] | Record<string, number>;
  /** Intensity bins above the empty level; default 4 (GitHub's scale). */
  levels?: number;
  /** First date of the range; defaults to the earliest datum. */
  startDate?: string;
  /** Last date of the range; defaults to the latest datum. */
  endDate?: string;
  /** Tooltip text of one day square (`title`, via `getLabel`). */
  getLabel?: (datum: { date: string; value: number }) => string;
  /** Month label for the week-group headers; defaults to English short names. */
  getMonthLabel?: (month: number, year: number) => string;
  /** Weekday label for row `weekday` (0 = Sunday); return '' to hide one. */
  getWeekdayLabel?: (weekday: number) => string;
  /** Accessible name of the whole calendar; default 'Activity heatmap'. */
  summary?: string;
  classNames?: HeatmapClassNames;
  className?: string;
  /** Forwarded to the grid root. */
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

/** UTC day in milliseconds — the grid math is DST-free by construction. */
const DAY_MS = 86_400_000;

// RSC-safe by design (scripts/rsc-safe.mjs): the month/weekday label
// defaults (and the summary / getLabel English fallbacks below) stay
// inlined literals instead of useStrings('heatmap') — a server tree
// cannot source strings from a client LocaleProvider anyway (context
// never crosses the RSC boundary), and the hook would drag the whole
// locale pack into the safe closure. Localize via getMonthLabel /
// getWeekdayLabel / getLabel / summary props.
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;
const WEEKDAY_NAMES = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
] as const;

/** `'YYYY-MM-DD'` → UTC epoch ms; NaN for malformed input. */
function toUtcMs(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

/** UTC epoch ms → `'YYYY-MM-DD'` (toISOString is always UTC). */
function toDateString(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Both accepted `data` shapes → one date → value map (later wins). */
function toValueMap(data: HeatmapProps['data']): Map<string, number> {
  const values = new Map<string, number>();
  if (Array.isArray(data)) {
    for (const datum of data) values.set(datum.date, datum.value);
  } else if (data) {
    for (const [date, value] of Object.entries(data)) values.set(date, value);
  }
  return values;
}

type MonthSpan = { key: string; label: string; start: number; span: number };

type Cell = {
  date: string;
  level: number;
  mix: number;
  label: string;
  week: number;
  weekday: number;
};

export default function Heatmap({
  data,
  levels: levelsProp = 4,
  startDate,
  endDate,
  getLabel,
  getMonthLabel,
  getWeekdayLabel,
  summary = 'Activity heatmap',
  classNames,
  className,
  style,
  ref,
  ...rest
}: HeatmapProps) {
  const levels = Math.max(1, Math.floor(levelsProp));
  const values = toValueMap(data);

  let firstMs = Number.POSITIVE_INFINITY;
  let lastMs = Number.NEGATIVE_INFINITY;
  for (const date of values.keys()) {
    const ms = toUtcMs(date);
    if (Number.isNaN(ms)) continue;
    firstMs = Math.min(firstMs, ms);
    lastMs = Math.max(lastMs, ms);
  }
  const hasData = Number.isFinite(lastMs);

  // Pure render: the range defaults to the data's own extent; with
  // neither data nor explicit dates nothing renders (no Date.now()
  // "last 52 weeks" default — that would be impure and SSR-unsafe).
  const explicitEnd = endDate === undefined ? Number.NaN : toUtcMs(endDate);
  const explicitStart = startDate === undefined ? Number.NaN : toUtcMs(startDate);
  const endMs = !Number.isNaN(explicitEnd) ? explicitEnd : hasData ? lastMs : Number.NaN;
  const startMs = !Number.isNaN(explicitStart)
    ? explicitStart
    : hasData
      ? firstMs
      : endMs;

  // Align outward to full Sunday..Saturday weeks (UTC — no DST edges).
  const hasRange = !Number.isNaN(startMs) && !Number.isNaN(endMs);
  const gridStart = hasRange
    ? startMs - new Date(startMs).getUTCDay() * DAY_MS
    : 0;
  const gridEnd = hasRange
    ? endMs + (6 - new Date(endMs).getUTCDay()) * DAY_MS
    : 0;
  const weeks =
    hasRange && gridStart <= gridEnd
      ? Math.floor((gridEnd - gridStart) / DAY_MS / 7) + 1
      : 0;

  let maxValue = 0;
  for (const value of values.values()) {
    if (value > maxValue) maxValue = value;
  }

  const cells: Cell[] = [];
  for (let week = 0; week < weeks; week += 1) {
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = toDateString(gridStart + (week * 7 + weekday) * DAY_MS);
      const value = values.get(date) ?? 0;
      const level =
        value <= 0 || maxValue <= 0
          ? 0
          : Math.min(
              levels,
              Math.max(1, Math.ceil((value / maxValue) * levels))
            );
      // RSC-safe inline English fallback (see the MONTH_NAMES note) —
      // localize via the getLabel prop, not useStrings.
      const label = getLabel
        ? getLabel({ date, value })
        : `${value === 0 ? 'No activity' : `${value} ${value === 1 ? 'activity' : 'activities'}`} on ${date}`;
      cells.push({
        date,
        level,
        mix: Math.round((level / levels) * 100),
        label,
        week,
        weekday,
      });
    }
  }

  // Month labels: a week belongs to the month its Saturday opens — the
  // GitHub heuristic, so a Jan 1 landing mid-week labels that column Jan.
  const monthSpans: MonthSpan[] = [];
  for (let week = 0; week < weeks; week += 1) {
    const saturday = new Date(gridStart + (week * 7 + 6) * DAY_MS);
    const month = saturday.getUTCMonth();
    const year = saturday.getUTCFullYear();
    const key = `${year}-${month}`;
    const previous = monthSpans[monthSpans.length - 1];
    if (previous?.key === key) {
      previous.span += 1;
    } else {
      monthSpans.push({
        key,
        label:
          getMonthLabel?.(month, year) ?? MONTH_NAMES[month] ?? '',
        start: week,
        span: 1,
      });
    }
  }

  const weekdayLabels = WEEKDAY_NAMES.map(
    (name, weekday) => getWeekdayLabel?.(weekday) ?? name
  );

  return (
    <div
      ref={ref}
      role='img'
      aria-label={summary}
      data-slot='heatmap'
      x-class={[heatmapBase, className, classNames?.root]}
      style={{
        gridTemplateColumns: `auto repeat(${weeks}, var(--haze-space-4))`,
        ...style,
      }}
      {...rest}
    >
      {monthSpans.map((span) => (
        <span
          key={span.key}
          data-slot='month'
          x-class={[truncate, heatmapMonth, classNames?.month]}
          style={{ gridColumn: `${span.start + 2} / span ${span.span}` }}
        >
          {span.label}
        </span>
      ))}
      {weekdayLabels.map((label, weekday) => (
        <span
          key={weekday}
          data-slot='weekday'
          x-class={[heatmapWeekday, classNames?.weekday]}
          style={{ gridRow: weekday + 2, gridColumn: 1 }}
        >
          {label}
        </span>
      ))}
      {cells.map((cell) => (
        <div
          key={cell.date}
          data-slot='cell'
          data-level={cell.level}
          data-date={cell.date}
          title={cell.label}
          x-class={[
            heatmapCell,
            cell.level === 0 && heatmapCellEmpty,
            classNames?.cell,
          ]}
          style={
            {
              gridRow: cell.weekday + 2,
              gridColumn: cell.week + 2,
              '--haze-heatmap-mix': `${cell.mix}%`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export type { HeatmapProps, HeatmapClassNames, HeatmapDatum };
