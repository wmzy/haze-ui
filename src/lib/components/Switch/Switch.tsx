import type { ComponentPropsWithoutRef, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import { NativeBooleanField } from '../../utils/native-form';

import SwitchCore from './SwitchCore';

type SwitchProps = {
  checked?: ControlOrValue<boolean>;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Form field name: renders a hidden checkbox bridge next to the
   * button so `<form action={fn}>` / `new FormData(form)` receive
   * `on` while checked (native successful-control semantics —
   * unchecked submits nothing). Without it the switch is form-silent;
   * react-f0rm `FormItem` usage never passes it, so both worlds
   * coexist. A `<button>`'s own `name` is submitter-scoped, hence the
   * rerouting.
   */
  name?: string;
  /** Forwarded to the underlying switch `<button>` — form bridges and
   * `ref.current.focus()` reach. */
  ref?: Ref<HTMLButtonElement>;
} & Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'checked' | 'onChange' | 'name'>;

export default function Switch({
  checked: checkedControl,
  size,
  className,
  onClick,
  name,
  ref,
  ...rest
}: SwitchProps) {
  const [checked, setChecked] = useControl(
    checkedControl,
    false
  );

  return (
    <>
      <SwitchCore
        ref={ref}
        checked={checked}
        onChange={setChecked}
        onNativeClick={onClick}
        size={size}
        className={className}
        {...rest}
      />
      <NativeBooleanField name={name} type='checkbox' checked={checked} />
    </>
  );
}

export type { SwitchProps };
