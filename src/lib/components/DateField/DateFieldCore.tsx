import type { ComponentPropsWithoutRef, Ref } from 'react';

import type { SegmentSpec } from '../../utils/segmented-field';

import { formatDate, getDaysInMonth, parseCivilDate } from '../../utils/date-math';

import SegmentedField from '../../utils/segmented-field';

/** Per-segment placeholder strings for the empty state. */
type DatePlaceholder = { year?: string; month?: string; day?: string };

/** Accessible segment names, overriding the built-in English ones. */
type DateLabels = { year?: string; month?: string; day?: string };

type DateFieldCoreProps = {
  /** `"YYYY-MM-DD"` — Calendar/Datepicker's civil-date serialization —
   * or `''` when empty. Impossible dates are rejected on parse. */
  value: string;
  onChange: (value: string) => void;
  /** Locale feeding the month segment's aria-valuetext (localized long
   * month names, e.g. locale="fr" reads "mars"). */
  locale?: string;
  disabled?: boolean;
  placeholder?: DatePlaceholder;
  labels?: DateLabels;
  className?: string;
  /** Forwarded to the current tab-stop segment span. */
  ref?: Ref<HTMLSpanElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange'>;

/* Full set → ISO string; null when incomplete or an impossible
 * combination (February 30th) — see segmented-field.tsx's commit flow. */
const serializeDate = (values: (number | null)[]): string | null => {
  const [year, month, day] = values;
  if (year == null || month == null || day == null) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > getDaysInMonth(year, month - 1)) return null;
  return formatDate(year, month - 1, day);
};

/* Intl.DateTimeFormat construction is comparatively expensive; the
 * month-name formatter caches one instance per locale (undefined
 * normalizes to the 'default' key — CountUp's per-decimals cache is
 * the precedent). */
const monthFormatters = new Map<string, Intl.DateTimeFormat>();

function getMonthFormatter(locale: string | undefined): Intl.DateTimeFormat {
  const key = locale ?? 'default';
  const cached = monthFormatters.get(key);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  monthFormatters.set(key, formatter);
  return formatter;
}

export default function DateFieldCore({
  value,
  onChange,
  locale,
  disabled,
  placeholder,
  labels,
  className,
  ref,
  ...rest
}: DateFieldCoreProps) {
  const parsed = parseCivilDate(value);
  const values: (number | null)[] = parsed
    ? [parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate()]
    : [null, null, null];

  const monthFormatter = getMonthFormatter(locale);
  const segments: SegmentSpec[] = [
    {
      kind: 'numeric',
      key: 'year',
      label: labels?.year ?? 'Year',
      min: 1,
      max: 9999,
      digits: 4,
      pad: 4,
      placeholder: placeholder?.year ?? 'yyyy',
      fallback: new Date().getFullYear(),
    },
    {
      kind: 'numeric',
      key: 'month',
      label: labels?.month ?? 'Month',
      min: 1,
      max: 12,
      digits: 2,
      pad: 2,
      placeholder: placeholder?.month ?? 'mm',
      wrap: true,
      ariaValueText: (month) =>
        monthFormatter.format(new Date(2026, month - 1, 15)),
    },
    {
      kind: 'numeric',
      key: 'day',
      label: labels?.day ?? 'Day',
      min: 1,
      max: 31,
      digits: 2,
      pad: 2,
      placeholder: placeholder?.day ?? 'dd',
      wrap: true,
    },
  ];

  return (
    <SegmentedField
      ref={ref}
      data-slot='date-field'
      segments={segments}
      separators={['/', '/']}
      values={values}
      value={value}
      serialize={serializeDate}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...rest}
    />
  );
}

export type { DateFieldCoreProps, DatePlaceholder, DateLabels };
