import type { ComponentPropsWithoutRef, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import PasswordInputCore from './PasswordInputCore';

type PasswordInputProps = {
  value?: ControlOrValue<string>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Forwarded to the inner password `<input>` — the element form
   * bridges and `ref.current.focus()` reach. */
  ref?: Ref<HTMLInputElement>;
  /* Native size is omitted for the same reason as Input/MaskedInput/
   * NumberInput: the character-width attribute would collide with
   * InputCore's 'sm' | 'md' | 'lg' size variant downstream. */
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'type'
  | 'value'
  | 'placeholder'
  | 'disabled'
  | 'className'
  | 'ref'
  | 'size'
>;

export default function PasswordInput({
  value: valueControl,
  onChange,
  placeholder,
  disabled,
  className,
  ref,
  ...rest
}: PasswordInputProps) {
  const [value, setValue] = useControl(valueControl, '');

  return (
    <PasswordInputCore
      ref={ref}
      value={value}
      onChange={setValue}
      onNativeChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      {...rest}
    />
  );
}

export type { PasswordInputProps };
