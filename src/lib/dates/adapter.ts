/**
 * Calendar-agnostic date adapter contract.
 *
 * `src/lib/utils/date-math.ts` owns the complete Gregorian math
 * (month lengths, view shifts, ISO weeks, value parsing); this module is
 * the adapter layer above it that lets consumers reason about *any*
 * calendar's civil dates. The contract is deliberately shaped after the
 * operations Calendar actually performs on dates — month lengths for grid
 * building, month shifts for view navigation, name lists for headers —
 * nothing more.
 *
 * Semantics (inherited from date-math.ts): every `(year, month, day)` triple is
 * a civil calendar date realized as a *local* Date at midnight. DST
 * transitions never move midnight, so `toGregorian` output always
 * round-trips through `fromGregorian` exactly, and internal conversion
 * arithmetic rides the UTC civil timeline (whole-day millisecond spans
 * with no DST drift) before materializing the local-midnight result.
 */
import { addMonths as shiftMonth, getDaysInMonth as monthLength } from '../utils/date-math';

/**
 * Normalize a possibly out-of-range month index into the `(year, month)`
 * pair it denotes — `addMonths(year, month, 0)` named for what the
 * 12-month adapters read consumer parts through: month 12 is next
 * January, month −1 the prior December, and day-level clamping in
 * `addMonths` must not fire (the normalized year feeds month-length
 * checks and conversions that carry the original day).
 */
export function normalizeParts(
  year: number,
  month: number
): { year: number; month: number } {
  return shiftMonth(year, month, 0);
}

/** Civil date parts in a specific calendar. `month` is 0-based — the
 * same `Date#getMonth` convention every date-math.ts function uses (0 = the
 * calendar's first month; 11 in 12-month calendars, 12 in hebrew leap
 * years and ethiopic's Pagume-ending years) — while `day` is 1-based. */
export type CivilDateParts = {
  year: number;
  month: number;
  day: number;
};

/** Calendars with a built-in adapter. `islamic-umalqura` is the
 * Umm al-Qura tabulation Node and browsers ship in full ICU; valid there
 * roughly 1300–1600 AH (Gregorian ~1882–2174), beyond which ICU falls
 * back to computed approximations (still self-consistent through this
 * adapter, which routes every conversion through Intl). The five
 * algorithmic calendars (`persian`, `hebrew`, `japanese`, `buddhist`,
 * `ethiopic`) are integer-arithmetic implementations whose outputs are
 * cross-verified against Intl in their tests — see each adapter module
 * for its supported range. */
export type HazeCalendarIdentifier =
  | 'gregory'
  | 'islamic-umalqura'
  | 'persian'
  | 'hebrew'
  | 'japanese'
  | 'buddhist'
  | 'ethiopic';

/** Month-name width, mirroring Intl's `month` option values. */
export type MonthNameStyle = 'long' | 'short' | 'narrow';

/**
 * Operations on a calendar's civil dates. All members are pure: no
 * internal state, no mutation of arguments.
 */
export type HazeDateAdapter = {
  /** Which calendar this adapter speaks; matches the `calendar` string
   * Intl accepts. */
  readonly identifier: HazeCalendarIdentifier;

  /** Hijri/lunar-equivalent parts of a Date's **local civil date** (the
   * date.ts midnight semantics — never the UTC reading of the
   * instant). */
  fromGregorian(date: Date): CivilDateParts;

  /** Local-midnight Date of a civil date in this calendar. Out-of-range
   * month indices normalize with carry (month 12 → next January,
   * mirroring date.ts); a `day` that exists in no month of the calendar
   * throws `RangeError` — never the silent `new Date` rollover. */
  toGregorian(parts: CivilDateParts): Date;

  /** Number of days in a month. Out-of-range months normalize with
   * carry, like date.ts's Gregorian helper. */
  getDaysInMonth(year: number, month: number): number;

  /** Shift by whole calendar months with year carry, truncating the day
   * to the target month's length (1430-12-30 + 1 → next year's month 1
   * day 29 when that month has 29 days). Pure integer arithmetic on the
   * month index — no Date rollover hazards. */
  addMonths(parts: CivilDateParts, delta: number): CivilDateParts;

  /** Month names for one full cycle of the calendar year, index 0 =
   * first month of the calendar year. Twelve entries for 12-month
   * calendars; thirteen where the calendar always has a thirteenth
   * month (ethiopic's Pagume). `locale` defaults to the adapter's base
   * presentation locale ('en' for the built-ins, matching Intl's
   * calendar-extended locales). */
  monthNames(locale?: string, style?: MonthNameStyle): string[];

  /** Era abbreviation for a year ("AH" for Hijri, "AD"/"BC" for
   * Gregorian), via Intl. Optional: consumers that render no era skip
   * it. */
  era?(year: number, locale?: string): string;
};

/**
 * Era part of a UTC-civil date in `calendar` via Intl's `era` piece —
 * the shared implementation behind both built-in adapters' `era` members
 * (internal helper; not part of the public dates surface).
 */
export function eraOfDate(
  date: Date,
  calendar: HazeCalendarIdentifier,
  locale: string
): string {
  const parts = new Intl.DateTimeFormat(locale, {
    calendar,
    era: 'short',
    timeZone: 'UTC',
  }).formatToParts(date);
  for (const part of parts) {
    if (part.type === 'era') return part.value;
  }
  return '';
}

/**
 * UTC-civil milliseconds of a proleptic (year, month, day) triple. The
 * `setUTCFullYear` route sidesteps the constructor's two-digit-year →
 * 19xx remap, which the algorithmic adapters need for far-past eras
 * (ethiopic year 1 maps to 8 CE; buddhist year 608 to 65 CE). Shared
 * implementation behind the algorithmic adapters' conversions (internal
 * helper; not part of the public dates surface).
 */
export function utcCivilMs(year: number, month: number, day: number): number {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  return date.getTime();
}

/**
 * Local-midnight Date materializing a UTC civil instant — the date.ts
 * civil semantics every adapter's `toGregorian` must produce. The
 * constructor already builds exact local midnights; only its
 * two-digit-year → 19xx remap needs dodging (ethiopic year 1 maps to
 * 8 CE), which `setFullYear` — unlike the constructor — does while
 * preserving the midnight time-of-day. Internal helper; not part of
 * the public dates surface.
 */
export function localMidnightOf(ms: number): Date {
  const utc = new Date(ms);
  const year = utc.getUTCFullYear();
  const month = utc.getUTCMonth();
  const day = utc.getUTCDate();
  const date = new Date(year, month, day);
  if (year >= 0 && year <= 99) {
    date.setFullYear(year, month, day);
  }
  return date;
}

/** Milliseconds in one civil day — the whole-day span the adapters'
 * conversion arithmetic rides on (no DST drift). Internal constant;
 * not part of the public dates surface. */
export const DAY_MS = 86400000;

/** Julian Day Number of 1970-01-01 — the days-since-epoch ↔ JDN offset
 * every JDN-based conversion rides on. Internal constant; not part of
 * the public dates surface. */
export const UNIX_EPOCH_JDN = 2440588;

/**
 * Month names sampled through Intl: one formatter pinned to `calendar`
 * and UTC, applied to `anchors` — one UTC-civil millisecond instant per
 * month of a probe year (day 15 of every month, or a day that exists
 * in the calendar's short months). The skeleton every built-in
 * adapter's `monthNames` member reduces to. Internal helper; not part
 * of the public dates surface.
 */
export function sampleMonthNames(
  calendar: HazeCalendarIdentifier,
  locale: string,
  style: MonthNameStyle,
  anchors: readonly number[]
): string[] {
  const fmt = new Intl.DateTimeFormat(locale, {
    calendar,
    month: style,
    timeZone: 'UTC',
  });
  return anchors.map((ms) => fmt.format(new Date(ms)));
}

/**
 * Strict-day guard shared by the adapters' `toGregorian` members:
 * rejects a `day` that exists in no month of the calendar — never the
 * silent `new Date(y, m, 31)` rollover — reading the month's length
 * through the caller's month-carried `normalized` parts. `label` is
 * the article + calendar name exactly as the message renders it
 * ('a gregorian', 'an ethiopic'). Internal helper; not part of the
 * public dates surface.
 */
export function assertCivilDate(
  parts: CivilDateParts,
  normalized: { year: number; month: number },
  monthLength: (year: number, month: number) => number,
  label: string
): void {
  if (
    parts.day < 1 ||
    parts.day > monthLength(normalized.year, normalized.month)
  ) {
    throw new RangeError(
      `Not ${label} date: ${parts.year}-${parts.month + 1}-${parts.day}`
    );
  }
}

/**
 * The `addMonths` body every fixed-grid adapter shares: shift
 * `(year, month)` by `delta` months over a `monthsPerYear`-wide grid
 * with year carry, then clamp the day to the target month's length
 * (Jan 31 + 1 → Feb 28). At the default grid of 12 the shift is
 * exactly date-math's `addMonths` formula; ethiopic passes its
 * thirteen-month grid. Hebrew's years hold a variable 12/13 months,
 * so its adapter walks the calendar locally and only mirrors the
 * final day clamp. Internal helper; not part of the public dates
 * surface.
 */
export function clampMonthShift(
  parts: CivilDateParts,
  delta: number,
  monthLength: (year: number, month: number) => number,
  monthsPerYear = 12
): CivilDateParts {
  const total = parts.year * monthsPerYear + parts.month + delta;
  const year = Math.floor(total / monthsPerYear);
  const month = ((total % monthsPerYear) + monthsPerYear) % monthsPerYear;
  return {
    year,
    month,
    day: Math.min(parts.day, monthLength(year, month)),
  };
}

/**
 * Fold `Intl.DateTimeFormat#formatToParts` output into a numeric parts
 * object: every part whose type names a key of `parts` stores
 * `Number(value)` plus the key's `offsets` entry (default 0) under that
 * key — literal/dayPeriod/era parts fall through untouched. Intl months
 * are 1-based while the parts convention (`CivilDateParts`,
 * `ZonedParts`) is `Date#getMonth`'s 0-based, hence the lone `{ month:
 * -1 }` offset both callers pass. Folds into and returns `parts`.
 * Internal helper; not part of the public dates surface.
 */
export function foldFormatParts<T extends Record<string, number>>(
  formatted: readonly Intl.DateTimeFormatPart[],
  parts: T,
  offsets?: Readonly<Partial<Record<keyof T, number>>>
): T {
  const target: Record<string, number> = parts;
  for (const part of formatted) {
    if (part.type in target) {
      target[part.type] =
        Number(part.value) + (offsets?.[part.type as keyof T] ?? 0);
    }
  }
  return parts;
}

/**
 * Anchor instants for Gregorian-structure month-name sampling: day 15
 * of every month of 2026 UTC (day 15 exists in every month; the year
 * sits mid-range). Shared by the Gregorian-like adapters' factory.
 */
const GREGORIAN_LIKE_MONTH_ANCHORS: readonly number[] = Array.from(
  { length: 12 },
  (_, month) => Date.UTC(2026, month, 15)
);

/**
 * Factory for Gregorian-structure adapters — calendars whose month
 * lengths, leap rules and weekday math are the Gregorian ones, with at
 * most a constant year offset (buddhist's +543 BE) and a different era
 * label (japanese's imperial eras). `calendar` is the Intl calendar
 * string month names and eras are sampled through; `yearOffset` is
 * added to the Gregorian year coming in (`fromGregorian`) and
 * subtracted going out; `eraAnchor` is the Gregorian (post-offset)
 * month/day whose era label `era` reports for a year. Internal helper;
 * the adapter modules themselves are the public surface.
 */
export function makeGregorianLikeAdapter(
  identifier: HazeCalendarIdentifier,
  calendar: HazeCalendarIdentifier,
  yearOffset = 0,
  eraAnchor: { month: number; day: number } = { month: 0, day: 1 }
): HazeDateAdapter {
  return {
    identifier,

    fromGregorian(date) {
      return {
        year: date.getFullYear() + yearOffset,
        month: date.getMonth(),
        day: date.getDate(),
      };
    },

    toGregorian(parts) {
      const shifted = normalizeParts(parts.year - yearOffset, parts.month);
      assertCivilDate(parts, shifted, monthLength, `a ${identifier}`);
      // utcCivilMs sidesteps the constructor's two-digit-year → 19xx
      // remap for years 0–99.
      return localMidnightOf(
        utcCivilMs(shifted.year, shifted.month, parts.day)
      );
    },

    getDaysInMonth:
      yearOffset === 0
        ? monthLength
        : (year: number, month: number) =>
            monthLength(year - yearOffset, month),

    addMonths(parts, delta) {
      return clampMonthShift(parts, delta, (year, month) =>
        monthLength(year - yearOffset, month)
      );
    },

    monthNames(locale = 'en', style: MonthNameStyle = 'long') {
      return sampleMonthNames(
        calendar,
        locale,
        style,
        GREGORIAN_LIKE_MONTH_ANCHORS
      );
    },

    era(year, locale = 'en') {
      return eraOfDate(
        new Date(
          utcCivilMs(year - yearOffset, eraAnchor.month, eraAnchor.day)
        ),
        calendar,
        locale
      );
    },
  };
}

/**
 * Spec for `defineDayNumberAdapter` — the day-number conversion core
 * one algorithmic calendar supplies to the shared adapter shell below.
 * `normalizeMonth` carries an out-of-range month index across year
 * boundaries (the shared `normalizeParts` for fixed 12/13-month grids,
 * hebrew's variable-year walk for itself); `monthLength` and
 * `toDayNumber` receive already-normalized parts; `fromDayNumber` is
 * the exact inverse of `toDayNumber`; `probeAnchors` are the
 * month-name sampling instants (UTC-civil milliseconds); `label` is
 * the article + calendar name exactly as assertCivilDate's message
 * renders it ('a hebrew', 'an ethiopic'). `monthsPerYear` sizes the
 * default addMonths grid (12 unless stated otherwise); `addMonths`
 * overrides that default wholesale — hebrew's variable 12/13-month
 * years keep their own walk. Internal helper; the adapter modules
 * themselves are the public surface.
 */
export type DayNumberAdapterSpec = {
  identifier: HazeCalendarIdentifier;
  label: string;
  // Function-valued properties, not method signatures: the spec is a
  // bag of closures with no `this`, so detached references (passing
  // `monthLength` straight into helpers) stay lint-clean and hazard-free.
  normalizeMonth: (year: number, month: number) => {
    year: number;
    month: number;
  };
  monthLength: (year: number, month: number) => number;
  toDayNumber: (year: number, month: number, day: number) => number;
  fromDayNumber: (dayNumber: number) => CivilDateParts;
  probeAnchors: readonly number[];
  monthsPerYear?: number;
  addMonths?: (parts: CivilDateParts, delta: number) => CivilDateParts;
};

/**
 * Factory for day-number adapters — the algorithmic calendars whose
 * conversions reduce to an integer day number on the UTC civil
 * timeline (days since the epoch; the Intl-routed umalqura tabulation
 * rides the same timeline in whole-day milliseconds). Every member of
 * the adapter shell is shared verbatim across such calendars: the
 * local-civil read, the strict-day guard, normalized month lengths,
 * month-name sampling and era anchoring; the spec supplies the
 * calendar's own arithmetic. Internal helper; the adapter modules
 * themselves are the public surface.
 */
export function defineDayNumberAdapter(
  spec: DayNumberAdapterSpec
): HazeDateAdapter {
  return {
    identifier: spec.identifier,

    fromGregorian(date) {
      // Read the local civil date first (date.ts midnight semantics), then
      // convert on the UTC civil timeline — zone-independent by
      // construction.
      const ms = utcCivilMs(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      return spec.fromDayNumber(Math.floor(ms / DAY_MS));
    },

    toGregorian(parts) {
      const normalized = spec.normalizeMonth(parts.year, parts.month);
      assertCivilDate(parts, normalized, spec.monthLength, spec.label);
      // The day-number arithmetic sidesteps the constructor's
      // two-digit-year remap for pre-100 CE years — ethiopic year 1
      // maps to 8 CE.
      return localMidnightOf(
        spec.toDayNumber(normalized.year, normalized.month, parts.day) *
          DAY_MS
      );
    },

    getDaysInMonth(year, month) {
      const normalized = spec.normalizeMonth(year, month);
      return spec.monthLength(normalized.year, normalized.month);
    },

    addMonths:
      spec.addMonths ??
      ((parts, delta) =>
        clampMonthShift(
          parts,
          delta,
          spec.monthLength,
          spec.monthsPerYear
        )),

    monthNames(locale = 'en', style: MonthNameStyle = 'long') {
      return sampleMonthNames(
        spec.identifier,
        locale,
        style,
        spec.probeAnchors
      );
    },

    era(year, locale = 'en') {
      return eraOfDate(
        new Date(spec.toDayNumber(year, 0, 1) * DAY_MS),
        spec.identifier,
        locale
      );
    },
  };
}
