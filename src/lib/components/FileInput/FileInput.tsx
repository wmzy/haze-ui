import type {ComponentPropsWithoutRef, ReactNode} from 'react';

import {css} from '@linaria/core';
import {useRef} from 'react';

type FileInputProps = {
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

const hiddenInput = css`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const trigger = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--pbl-space-2);
  padding: var(--pbl-space-2) var(--pbl-space-4);
  border: 1px solid var(--pbl-color-border);
  border-radius: var(--pbl-radius-md);
  background: var(--pbl-color-bg);
  color: var(--pbl-color-text);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  font-weight: var(--pbl-weight-medium);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    border-color: var(--pbl-color-border-hover);
    background: var(--pbl-color-bg-subtle);
  }

  &:focus-within {
    border-color: var(--pbl-color-primary);
    box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
  }
`;

export default function FileInput({
  children,
  className,
  ...rest
}: FileInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <label x-class={[trigger, className]}>
      <input ref={ref} type='file' className={hiddenInput} {...rest} />
      {children ?? 'Choose file'}
    </label>
  );
}

export type {FileInputProps};
