import type { ComponentPropsWithoutRef, Ref } from 'react';

import type { SegmentSpec } from '../DateField/segmented-field';
import type { TimePickerFormat } from '../../utils/time-math';

import SegmentedField from '../DateField/segmented-field';
import {
  formatTimeValue,
  from12Hour,
  parseTimeValue,
  to12Hour,
} from '../../utils/time-math';

/** Per-segment placeholder strings for the empty state. */
type TimePlaceholder = {
  hour?: string;
  minute?: string;
  second?: string;
  dayPeriod?: string;
};

/** Accessible segment names, overriding the built-in English ones. */
type TimeLabels = {
  hour?: string;
  minute?: string;
  second?: string;
  dayPeriod?: string;
};

type TimeFieldCoreProps = {
  /** `"HH:mm"` / `"HH:mm:ss"` matching `format` (TimePicker's value
   * semantics), or `''` when empty. */
  value: string;
  onChange: (value: string) => void;
  /** Column granularity and the value's serialization shape; defaults
   * to `'HH:mm'` (no second segment), matching TimePicker. */
  format?: TimePickerFormat;
  /** 12-hour presentation with an AM/PM segment; the value stays
   * 24-hour either way (10 PM serializes as `22:00`). */
  use12Hours?: boolean;
  disabled?: boolean;
  placeholder?: TimePlaceholder;
  labels?: TimeLabels;
  className?: string;
  /** Forwarded to the current tab-stop segment span. */
  ref?: Ref<HTMLSpanElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange'>;

export default function TimeFieldCore({
  value,
  onChange,
  format = 'HH:mm',
  use12Hours = false,
  disabled,
  placeholder,
  labels,
  className,
  ref,
  ...rest
}: TimeFieldCoreProps) {
  const withSeconds = format === 'HH:mm:ss';
  const parts = parseTimeValue(value);

  const values: (number | null)[] = [
    parts ? (use12Hours ? to12Hour(parts.hour) : parts.hour) : null,
    parts ? parts.minute : null,
  ];
  if (withSeconds) values.push(parts ? parts.second : null);
  if (use12Hours) values.push(parts ? (parts.hour >= 12 ? 1 : 0) : null);

  const segments: SegmentSpec[] = [
    {
      kind: 'numeric',
      key: 'hour',
      label: labels?.hour ?? 'Hour',
      min: use12Hours ? 1 : 0,
      max: use12Hours ? 12 : 23,
      digits: 2,
      pad: 2,
      placeholder: placeholder?.hour ?? 'hh',
      wrap: true,
    },
    {
      kind: 'numeric',
      key: 'minute',
      label: labels?.minute ?? 'Minute',
      min: 0,
      max: 59,
      digits: 2,
      pad: 2,
      placeholder: placeholder?.minute ?? 'mm',
      wrap: true,
    },
  ];
  const separators = [':'];
  if (withSeconds) {
    segments.push({
      kind: 'numeric',
      key: 'second',
      label: labels?.second ?? 'Second',
      min: 0,
      max: 59,
      digits: 2,
      pad: 2,
      placeholder: placeholder?.second ?? 'ss',
      wrap: true,
    });
    separators.push(':');
  }
  if (use12Hours) {
    segments.push({
      kind: 'period',
      key: 'dayPeriod',
      label: labels?.dayPeriod ?? 'Day period',
      options: ['AM', 'PM'],
      placeholder: placeholder?.dayPeriod ?? '--',
    });
    separators.push(' ');
  }

  /* Segment layout is [hour, minute, (second), (dayPeriod)] with the
   * hour displayed 1–12 in 12-hour mode; serialize back to 24-hour. */
  const serialize = (next: (number | null)[]): string | null => {
    if (next.some((v) => v == null)) return null;
    const hour = next[0]!;
    const minute = next[1]!;
    const second = withSeconds ? next[2]! : 0;
    const period = use12Hours ? (next[next.length - 1] ?? 0) : 0;
    return formatTimeValue(
      {
        hour: use12Hours ? from12Hour(hour, period === 1) : hour,
        minute,
        second,
      },
      format
    );
  };

  return (
    <SegmentedField
      ref={ref}
      data-slot='time-field'
      segments={segments}
      separators={separators}
      values={values}
      value={value}
      serialize={serialize}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...rest}
    />
  );
}

export type { TimeFieldCoreProps, TimePlaceholder, TimeLabels };
