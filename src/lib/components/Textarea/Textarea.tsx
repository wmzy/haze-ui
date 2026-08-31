import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import TextareaCore from './TextareaCore';

type TextareaProps = {
  value?: Control<string> | string;
  size?: 'sm' | 'md' | 'lg';
} & Omit<ComponentPropsWithoutRef<'textarea'>, 'value'>;

export default function Textarea({
  value: valueControl,
  size,
  className,
  onChange,
  ...rest
}: TextareaProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');

  return (
    <TextareaCore
      value={value}
      onChange={setValue}
      onNativeChange={onChange}
      size={size}
      className={className}
      {...rest}
    />
  );
}

export type { TextareaProps };
