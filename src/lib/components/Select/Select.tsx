import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import SelectCore from './SelectCore';

type SelectProps = {
  value?: Control<string> | string;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'select'>, 'value' | 'size'>;

export default function Select({
  value: valueControl,
  size,
  className,
  children,
  onChange,
  ...rest
}: SelectProps) {
  const [value, setValue] = useControl(valueControl, '');

  return (
    <SelectCore
      value={value}
      onChange={setValue}
      onNativeChange={onChange}
      size={size}
      className={className}
      {...rest}
    >
      {children}
    </SelectCore>
  );
}

export type { SelectProps };
