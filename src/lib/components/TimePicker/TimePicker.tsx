import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import TimePickerCore from './TimePickerCore';

type TimePickerProps = {
  value?: Control<string> | string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  'value' | 'onChange' | 'type' | 'placeholder'
>;

export default function TimePicker({
  value: valueControl,
  onChange,
  placeholder,
  className,
  ...rest
}: TimePickerProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');

  return (
    <TimePickerCore
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      placeholder={placeholder}
      className={className}
      {...rest}
    />
  );
}

export type { TimePickerProps };
