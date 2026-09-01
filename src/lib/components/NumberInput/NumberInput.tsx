import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import NumberInputCore from './NumberInputCore';

type NumberInputProps = {
  value?: Control<number> | number;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'size'>;

export default function NumberInput({
  value: valueControl,
  min,
  max,
  step,
  size,
  className,
  onChange,
  ...rest
}: NumberInputProps) {
  const [value, setValue] = useControl(valueControl, 0);

  return (
    <NumberInputCore
      value={value}
      onChange={setValue}
      onNativeChange={onChange}
      min={min}
      max={max}
      step={step}
      size={size}
      className={className}
      {...rest}
    />
  );
}

export type { NumberInputProps };
