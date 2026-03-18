import type { ComponentPropsWithoutRef } from 'react';

import { css } from '@linaria/core';

type ButtonProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  square?: boolean;
} & Omit<ComponentPropsWithoutRef<'button'>, 'type'>;

const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--haze-space-2);
  border: 1px solid transparent;
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
  line-height: var(--haze-leading-tight);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
  user-select: none;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const variants = {
  solid: css`
    background: var(--haze-color-primary);
    color: var(--haze-color-text-inverse);

    &:hover {
      background: var(--haze-color-primary-hover);
    }

    &:active {
      background: var(--haze-color-primary-active);
    }
  `,
  outline: css`
    background: transparent;
    border-color: var(--haze-color-border);
    color: var(--haze-color-text);

    &:hover {
      border-color: var(--haze-color-border-hover);
      background: var(--haze-color-bg-subtle);
    }

    &:active {
      background: var(--haze-color-bg-muted);
    }
  `,
  ghost: css`
    background: transparent;
    color: var(--haze-color-text);

    &:hover {
      background: var(--haze-color-bg-subtle);
    }

    &:active {
      background: var(--haze-color-bg-muted);
    }
  `,
} as const;

const sizes = {
  sm: css`
    padding: var(--haze-space-1) var(--haze-space-3);
    font-size: var(--haze-text-sm);
  `,
  md: css`
    padding: var(--haze-space-2) var(--haze-space-4);
    font-size: var(--haze-text-sm);
  `,
  lg: css`
    padding: var(--haze-space-3) var(--haze-space-6);
    font-size: var(--haze-text-base);
  `,
} as const;

const squareSizes = {
  sm: css`
    padding: var(--haze-space-1);
    font-size: var(--haze-text-sm);
  `,
  md: css`
    padding: var(--haze-space-2);
    font-size: var(--haze-text-sm);
  `,
  lg: css`
    padding: var(--haze-space-3);
    font-size: var(--haze-text-base);
  `,
} as const;

export default function Button({
  variant = 'solid',
  size = 'md',
  square = false,
  className,
  ...rest
}: ButtonProps) {
  const sizeClass = square ? squareSizes[size] : sizes[size];
  return (
    <button
      type='button'
      x-class={[base, variants[variant], sizeClass, className]}
      {...rest}
    />
  );
}

export type { ButtonProps };
