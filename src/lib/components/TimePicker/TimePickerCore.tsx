import type { ComponentPropsWithoutRef, Ref } from 'react';

import { css } from '@linaria/core';

import { pickerFieldInput } from '../../utils/field-skin';

type TimePickerCoreProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Forwarded to the `<input>` element. */
  ref?: Ref<HTMLInputElement>;
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  'value' | 'onChange' | 'type' | 'placeholder'
>;

/* Native core input deltas on the shared picker field skin
   (utils/field-skin.ts): the editable input fills its host and carries
   the disabled and placeholder arms. Composed with `pickerFieldInput`
   at the input — additive properties only. */
const input = css`
  width: 100%;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--haze-color-text-muted);
  }
`;

export default function TimePickerCore({
  value,
  onChange,
  placeholder,
  className,
  ref,
  ...rest
}: TimePickerCoreProps) {
  return (
    <input
      ref={ref}
      data-slot='input'
      type="time"
      x-class={[pickerFieldInput, input, className]}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}

export type { TimePickerCoreProps };
