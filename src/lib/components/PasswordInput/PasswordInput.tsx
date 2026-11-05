import type { ComponentPropsWithoutRef, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import PasswordInputCore from './PasswordInputCore';

type PasswordInputProps = {
  value?: ControlOrValue<string>;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Forwarded to the inner password `<input>` (not the wrapper div) —
   * the element form bridges and `ref.current.focus()` reach. */
  ref?: Ref<HTMLInputElement>;
  /* Native size is omitted for the same reason as Input/MaskedInput/
   * NumberInput: the character-width attribute would collide with
   * InputCore's 'sm' | 'md' | 'lg' size variant downstream. */
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'type'
  | 'value'
  | 'onChange'
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
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      {...rest}
    />
  );
}

export type { PasswordInputProps };
