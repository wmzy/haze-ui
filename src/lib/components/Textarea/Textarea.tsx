import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

type TextareaProps = {
  value?: Control<string> | string;
  size?: 'sm' | 'md' | 'lg';
} & Omit<ComponentPropsWithoutRef<'textarea'>, 'value'>;

const base = css`
  display: block;
  width: 100%;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  line-height: var(--haze-leading-normal);
  resize: vertical;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &::placeholder {
    color: var(--haze-color-text-muted);
  }

  &:hover {
    border-color: var(--haze-color-border-hover);
  }

  &:focus {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const sizes = {
  sm: css`
    padding: var(--haze-space-1) var(--haze-space-2);
    font-size: var(--haze-text-sm);
  `,
  md: css`
    padding: var(--haze-space-2) var(--haze-space-3);
    font-size: var(--haze-text-sm);
  `,
  lg: css`
    padding: var(--haze-space-3) var(--haze-space-4);
    font-size: var(--haze-text-base);
  `,
} as const;

export default function Textarea({
  value: valueControl,
  size = 'md',
  className,
  onChange,
  ...rest
}: TextareaProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');

  return (
    <textarea
      x-class={[base, sizes[size], className]}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange?.(e);
      }}
      {...rest}
    />
  );
}

export type { TextareaProps };
