import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import InputCore from './InputCore';

type InputProps = {
  value?: ControlOrValue<string>;
  size?: 'sm' | 'md' | 'lg';
  /** Content rendered inside the field at the leading edge (icon,
   * currency glyph, …). See InputCore for the layout contract. */
  leftSection?: ReactNode;
  /** Same as `leftSection`, at the trailing edge — the conventional
   * home of clear buttons and visibility toggles. */
  rightSection?: ReactNode;
  /** Forwarded to the underlying `<input>` — the element form bridges
   * (react-f0rm `focusRef`), tests and `ref.current.focus()` reach. */
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'size'>;

export default function Input({
  value: valueControl,
  size,
  className,
  leftSection,
  rightSection,
  onChange,
  ref,
  ...rest
}: InputProps) {
  const [value, setValue] = useControl(valueControl, '');

  return (
    <InputCore
      ref={ref}
      value={value}
      onChange={setValue}
      onNativeChange={onChange}
      size={size}
      className={className}
      leftSection={leftSection}
      rightSection={rightSection}
      {...rest}
    />
  );
}

export type { InputProps };
