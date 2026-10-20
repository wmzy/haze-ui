import type { ComponentPropsWithoutRef, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { TimePickerFormat } from '../TimePicker/time';
import type { TimeLabels, TimePlaceholder } from './TimeFieldCore';

import { useControl } from 'react-use-control';

import TimeFieldCore from './TimeFieldCore';

type TimeFieldProps = {
  /** `"HH:mm"` / `"HH:mm:ss"` matching `format` (TimePicker's value
   * semantics) or `''` when empty; commits fire only when every
   * segment holds a value. */
  value?: ControlOrValue<string>;
  onChange?: (value: string) => void;
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
  /** Forwarded to the current tab-stop segment span — the element form
   * bridges and `ref.current.focus()` reach. */
  ref?: Ref<HTMLSpanElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange'>;

export default function TimeField({
  value: valueControl,
  onChange,
  format,
  use12Hours,
  disabled,
  placeholder,
  labels,
  className,
  ref,
  ...rest
}: TimeFieldProps) {
  const [value, setValue] = useControl(valueControl, '');
  const commit = (next: string) => {
    setValue(next);
    onChange?.(next);
  };

  return (
    <TimeFieldCore
      ref={ref}
      value={value}
      onChange={commit}
      format={format}
      use12Hours={use12Hours}
      disabled={disabled}
      placeholder={placeholder}
      labels={labels}
      className={className}
      {...rest}
    />
  );
}

export type { TimeFieldProps };
