import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

type TimePickerProps = {
  value?: Control<string> | string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'type' | 'placeholder'>;

const input = css`
  width: 100%;
  padding: var(--haze-space-2) var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--haze-color-text-muted);
  }
`;

export default function TimePicker({
  value: valueControl,
  onChange,
  placeholder,
  className,
  ...rest
}: TimePickerProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    onChange?.(v);
  };

  return (
    <input
      type="time"
      x-class={[input, className]}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      {...rest}
    />
  );
}

export type { TimePickerProps };
