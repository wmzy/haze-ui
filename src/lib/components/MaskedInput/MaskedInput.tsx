import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import MaskedInputCore from './MaskedInputCore';

type MaskedInputProps = {
  /** Masked display value (`'(123) 456'`); `onChange` fires with the
   * masked string too — extract the raw content with `unmask`. */
  value?: ControlOrValue<string>;
  /** See {@link MaskedInputCoreProps.mask}. */
  mask: string;
  size?: 'sm' | 'md' | 'lg';
  /** See {@link InputCoreProps.leftSection}. */
  leftSection?: ReactNode;
  /** See {@link InputCoreProps.rightSection}. */
  rightSection?: ReactNode;
  /** Forwarded to the underlying `<input>` — the element form bridges,
   * tests and `ref.current.focus()` reach. */
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'size'>;

/** Input-skinned masked text field — `useControl` sugar over `MaskedInputCore`. */
export default function MaskedInput({
  value: valueControl,
  mask,
  size,
  className,
  leftSection,
  rightSection,
  onChange,
  ref,
  ...rest
}: MaskedInputProps) {
  const [value, setValue] = useControl(valueControl, '');

  return (
    <MaskedInputCore
      ref={ref}
      value={value}
      onChange={setValue}
      onNativeChange={onChange}
      mask={mask}
      size={size}
      className={className}
      leftSection={leftSection}
      rightSection={rightSection}
      {...rest}
    />
  );
}

export type { MaskedInputProps };
