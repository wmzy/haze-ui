import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import CheckboxCore from './CheckboxCore';

type CheckboxProps = {
  checked?: Control<boolean> | boolean;
  label?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'input'>, 'checked' | 'type'>;

export default function Checkbox({
  checked: checkedControl,
  className,
  label,
  onChange,
  ...rest
}: CheckboxProps) {
  const [checked, setChecked] = useControl(
    checkedControl,
    false
  );

  return (
    <CheckboxCore
      checked={checked}
      onChange={setChecked}
      onNativeChange={onChange}
      className={className}
      label={label}
      {...rest}
    />
  );
}

export type { CheckboxProps };
