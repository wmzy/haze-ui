import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';
import { useRef } from 'react';

import { useStrings } from '../LocaleProvider';
import { fieldChrome, focusWithinRing } from '../../utils/field-skin';
import { srOnly } from '../../utils/sr-only';

type FileInputProps = {
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

/* The trigger keeps its own transition/hover (the only field surface
 * whose hover also paints a subtle fill — a button-feel affordance) and
 * wears the shared surface chrome + :focus-within ring from
 * utils/field-skin.ts; the hidden native input wears the shared
 * sr-only clip class from utils/sr-only.ts. */
const trigger = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2) var(--haze-space-4);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  cursor: pointer;
  transition:
    background var(--haze-duration-fast),
    border-color var(--haze-duration-fast);

  &:hover {
    border-color: var(--haze-color-border-hover);
    background: var(--haze-color-bg-subtle);
  }
`;

export default function FileInput({
  children,
  className,
  ...rest
}: FileInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const strings = useStrings('fileInput');

  return (
    <label data-slot='file-input' x-class={[fieldChrome, focusWithinRing, trigger, className]}>
      <input
        ref={ref}
        data-slot='input'
        type='file'
        x-class={[srOnly]}
        {...rest}
      />
      {children ?? strings.label}
    </label>
  );
}

export type { FileInputProps };
