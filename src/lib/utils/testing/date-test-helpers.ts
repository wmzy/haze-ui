/**
 * Date/calendar test scaffolding shared by the co-located test files of
 * Calendar, Datepicker and DateRangePicker: default-locale "Month Year"
 * grid labels, the header's month drill-down names, Calendar's week-start
 * resolution (Intl reports 7 for Sunday while the grid uses 0, and engines
 * without getWeekInfo fall back to Sunday) and short weekday header labels
 * rotated to the resolved week start. Test-only module — never import from
 * library source and never re-export through a barrel.
 */
import { screen } from '@testing-library/react';

/** "Month Year" label behind a calendar grid's accessible name. */
export function getMonthLabel(year: number, month: number) {
  return new Date(year, month).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
}

/** Long month name of the header's month drill-down button (any year). */
export function getMonthTitleName(month: number) {
  return new Date(2025, month, 15).toLocaleString('default', {
    month: 'long',
  });
}

/** Locale-aware month drill-down name. */
export function getLocalizedMonthTitleName(month: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(
    new Date(2025, month, 15)
  );
}

/** Locale-aware "Month Year" grid label. */
export function getLocalizedMonthLabel(
  year: number,
  month: number,
  locale: string
) {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month));
}

export function getLocaleWeekStart(locale: string) {
  const firstDay = (
    new Intl.Locale(locale) as { getWeekInfo?: () => { firstDay: number } }
  ).getWeekInfo?.().firstDay;
  return firstDay === undefined || firstDay === 7 ? 0 : firstDay;
}

/** Short weekday labels in grid order, rotated to the week start. */
export function getLocalizedWeekdays(locale: string, weekStart: number) {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 2024-01-07 is a Sunday; index 0…6 map to Sunday…Saturday.
  const byDay = Array.from({ length: 7 }, (_, day) =>
    fmt.format(new Date(2024, 0, 7 + day))
  );
  return Array.from({ length: 7 }, (_, i) => byDay[(weekStart + i) % 7]!);
}

/** Weekday header row text in DOM order. */
export function getWeekdayHeaders() {
  return screen
    .getAllByRole('columnheader')
    .map((columnheader) => columnheader.textContent);
}
