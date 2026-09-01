import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import SwitchCore from './SwitchCore';

type SwitchProps = {
  checked?: Control<boolean> | boolean;
  size?: 'sm' | 'md' | 'lg';
} & Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'checked' | 'onChange'>;

export default function Switch({
  checked: checkedControl,
  size,
  className,
  onClick,
  ...rest
}: SwitchProps) {
  const [checked, setChecked] = useControl(
    checkedControl,
    false
  );

  return (
    <SwitchCore
      checked={checked}
      onChange={setChecked}
      onNativeClick={onClick}
      size={size}
      className={className}
      {...rest}
    />
  );
}

export type { SwitchProps };
