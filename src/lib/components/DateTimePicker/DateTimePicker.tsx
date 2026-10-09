import type { ControlOrValue } from 'react-use-control';

import type { DatepickerPreset } from '../Datepicker/DatepickerCore';
import type { CalendarCellRender } from '../Calendar/Calendar';
import type { Ref } from 'react';

import Datepicker from '../Datepicker/Datepicker';

/**
 * Date+time picker (the Mantine DateTimePicker niche): a date calendar
 * with a time field below it in one popover. This is a thin sugar over
 * Datepicker — `picker` is fixed to `date` (date+time values are apples
 * and day-granularity oranges for week/month/quarter/year modes) and
 * `showTime` defaults to `true`; {@link showSeconds} flips it to the
 * seconds-resolution form.
 *
 * Value serializes as `"YYYY-MM-DD HH:mm"` (or `"YYYY-MM-DD HH:mm:ss"`
 * with `showSeconds`), matching Datepicker's showTime contract.
 */
type DateTimePickerProps = {
  value?: ControlOrValue<string>;
  open?: ControlOrValue<boolean>;
  min?: string;
  max?: string;
  /** Disables individual dates on the calendar panel (day granularity). */
  disabledDate?: (date: Date) => boolean;
  /** Shortcut rows at the top of the panel. */
  presets?: DatepickerPreset[];
  /** Include seconds in the time field (value gains a `:ss` part). */
  showSeconds?: boolean;
  locale?: string;
  weekStartsOn?: 0 | 1;
  cellRender?: CalendarCellRender;
  placeholder?: string;
  className?: string;
  /** Forwarded to the trigger `<input>`. */
  ref?: Ref<HTMLInputElement>;
};

export default function DateTimePicker({
  value: valueControl,
  open: openControl,
  min,
  max,
  disabledDate,
  presets,
  showSeconds = false,
  locale,
  weekStartsOn,
  cellRender,
  placeholder,
  className,
  ref,
}: DateTimePickerProps) {
  return (
    <Datepicker
      ref={ref}
      value={valueControl}
      open={openControl}
      picker='date'
      min={min}
      max={max}
      disabledDate={disabledDate}
      presets={presets}
      showTime={showSeconds ? { seconds: true } : true}
      locale={locale}
      weekStartsOn={weekStartsOn}
      cellRender={cellRender}
      placeholder={placeholder}
      className={className}
      data-slot='datetime-picker'
    />
  );
}

export type { DateTimePickerProps };
