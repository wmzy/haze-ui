import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

type SelectProps = {
  value?: Control<string> | string;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'select'>, 'value' | 'size'>;

const base = css`
  display: block;
  width: 100%;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  line-height: var(--haze-leading-normal);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2.22 4.47a.75.75 0 0 1 1.06 0L6 7.19l2.72-2.72a.75.75 0 1 1 1.06 1.06L6.53 8.78a.75.75 0 0 1-1.06 0L2.22 5.53a.75.75 0 0 1 0-1.06z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--haze-space-3) center;
  padding-right: var(--haze-space-8);
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

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

export default function Select({
  value: valueControl,
  size = 'md',
  className,
  children,
  onChange,
  ...rest
}: SelectProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');

  return (
    <select
      x-class={[base, sizes[size], className]}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange?.(e);
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

export type { SelectProps };
