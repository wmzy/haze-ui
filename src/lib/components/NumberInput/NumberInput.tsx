import type { ComponentPropsWithoutRef, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';

import NumberInputCore from './NumberInputCore';

type NumberInputProps = {
  value?: ControlOrValue<number>;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  /** Forwarded to the inner number `<input>` (not the wrapper div) —
   * the element form bridges and `ref.current.focus()` reach. */
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'size'>;

export default function NumberInput({
  value: valueControl,
  min,
  max,
  step,
  size,
  className,
  onChange,
  ref,
  ...rest
}: NumberInputProps) {
  const [value, setValue] = useControl(valueControl, 0);

  // Three tiers per wired prop: explicit prop → ConfigProvider
  // `NumberInput` section → NumberInputCore's built-ins ('md', step 1).
  // A missing provider stays byte-identical.
  const config = useConfigDefaults('NumberInput');

  return (
    <NumberInputCore
      ref={ref}
      value={value}
      onChange={setValue}
      onNativeChange={onChange}
      min={min}
      max={max}
      step={step ?? config.step}
      size={size ?? config.size}
      className={className}
      {...rest}
    />
  );
}

export type { NumberInputProps };
