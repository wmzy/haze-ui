/**
 * Built-in range presets for DateRangePicker's `presets='common'` set.
 *
 * Date arithmetic follows utils/date-math.ts semantics: every value is
 * a local civil date realized at midnight, serialized at day
 * resolution — only the civil date reaches the value, so `addDays`'
 * minute-resolution day rollover is equivalent to the constructor's.
 */

import type { DateRangePickerPreset } from './DateRangePickerCore';

import {
  addDays,
  addMonths,
  formatDate,
  formatDateOf,
  getDaysInMonth,
} from '../../utils/date-math';

/** Localized labels for the built-in rows (LocaleProvider's
 * `dateRangePicker` section). */
type CommonPresetLabels = {
  today: string;
  yesterday: string;
  last7Days: string;
  last30Days: string;
  thisMonth: string;
  lastMonth: string;
};

/** First → last day of a month, as "YYYY-MM-DD" values. */
function monthBounds(year: number, month: number): [string, string] {
  return [
    formatDate(year, month, 1),
    formatDate(year, month, getDaysInMonth(year, month)),
  ];
}

/** The built-in shortcut rows relative to `today` (defaults to now). */
export function commonRangePresets(
  labels: CommonPresetLabels,
  today: Date = new Date()
): DateRangePickerPreset[] {
  const day = (delta: number) => formatDateOf(addDays(today, delta));
  const thisMonth = monthBounds(today.getFullYear(), today.getMonth());
  const previous = addMonths(today.getFullYear(), today.getMonth(), -1);
  const lastMonth = monthBounds(previous.year, previous.month);
  return [
    { label: labels.today, range: [day(0), day(0)] },
    { label: labels.yesterday, range: [day(-1), day(-1)] },
    // Trailing windows anchored on today, inclusive of both ends.
    { label: labels.last7Days, range: [day(-6), day(0)] },
    { label: labels.last30Days, range: [day(-29), day(0)] },
    { label: labels.thisMonth, range: thisMonth },
    { label: labels.lastMonth, range: lastMonth },
  ];
}
