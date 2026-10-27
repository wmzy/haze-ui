import type { ComponentPropsWithoutRef, Ref } from 'react';

import { css } from '@linaria/core';

import { fieldChrome, fieldSizes, nativeFieldChrome } from '../../utils/field-skin';

type TextareaCoreProps = {
  value: string;
  onChange: (value: string) => void;
  /** Native change event passthrough — invoked with the DOM event after
   * `onChange`, so a spread can never override the controlled callback. */
  onNativeChange?: ComponentPropsWithoutRef<'textarea'>['onChange'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Forwarded to the `<textarea>` element. */
  ref?: Ref<HTMLTextAreaElement>;
} & Omit<ComponentPropsWithoutRef<'textarea'>, 'value' | 'onChange' | 'size'>;

/* The field base is the shared field skin (utils/field-skin.ts) —
 * Input and Textarea wore identical chrome; the only Textarea delta is
 * the drag handle. */
const resizable = css`
  resize: vertical;
`;

export default function TextareaCore({
  value,
  onChange,
  onNativeChange,
  size = 'md',
  className,
  ref,
  ...rest
}: TextareaCoreProps) {
  return (
    <textarea
      ref={ref}
      data-slot='textarea'
      x-class={[fieldChrome, nativeFieldChrome, resizable, fieldSizes[size], className]}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        onNativeChange?.(e);
      }}
      {...rest}
    />
  );
}

export type { TextareaCoreProps };
