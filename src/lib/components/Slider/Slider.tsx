import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import SliderCore from './SliderCore';

type SliderProps = {
  value?: Control<number> | number;
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value'>;

export default function Slider({
  value: valueControl,
  className,
  onChange,
  ...rest
}: SliderProps) {
  const [value, setValue] = useControl(valueControl as Control<number>, 50);

  return (
    <SliderCore
      value={value}
      onChange={setValue}
      onNativeChange={onChange}
      className={className}
      {...rest}
    />
  );
}

export type { SliderProps };
