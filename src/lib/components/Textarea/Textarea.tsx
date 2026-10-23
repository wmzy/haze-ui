import type { ComponentPropsWithoutRef, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';

import TextareaCore from './TextareaCore';

type TextareaProps = {
  value?: ControlOrValue<string>;
  size?: 'sm' | 'md' | 'lg';
  /** Forwarded to the underlying `<textarea>` — the element form bridges
   * (react-f0rm `focusRef`), tests and `ref.current.focus()` reach. */
  ref?: Ref<HTMLTextAreaElement>;
} & Omit<ComponentPropsWithoutRef<'textarea'>, 'value'>;

export default function Textarea({
  value: valueControl,
  size,
  className,
  onChange,
  ref,
  ...rest
}: TextareaProps) {
  const [value, setValue] = useControl(valueControl, '');

  // Three tiers: explicit prop → ConfigProvider `Textarea.size` →
  // TextareaCore's built-in 'md' (a missing provider stays
  // byte-identical).
  const config = useConfigDefaults('Textarea');

  return (
    <TextareaCore
      ref={ref}
      value={value}
      onChange={setValue}
      onNativeChange={onChange}
      size={size ?? config.size}
      className={className}
      {...rest}
    />
  );
}

export type { TextareaProps };
