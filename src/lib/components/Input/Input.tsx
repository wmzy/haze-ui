import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import InputCore from './InputCore';

type InputProps = {
  value?: Control<string> | string;
  size?: 'sm' | 'md' | 'lg';
} & Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'size'>;

export default function Input({
  value: valueControl,
  size,
  className,
  onChange,
  ...rest
}: InputProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');

  return (
    <InputCore
      value={value}
      onChange={setValue}
      onNativeChange={onChange}
      size={size}
      className={className}
      {...rest}
    />
  );
}

export type { InputProps };
