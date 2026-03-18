import type {ComponentPropsWithoutRef} from 'react';

import {css} from '@linaria/core';

type ButtonProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
} & Omit<ComponentPropsWithoutRef<'button'>, 'type'>;

const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--pbl-space-2);
  border: 1px solid transparent;
  border-radius: var(--pbl-radius-md);
  font-family: var(--pbl-font-sans);
  font-weight: var(--pbl-weight-medium);
  line-height: var(--pbl-leading-tight);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
  user-select: none;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const variants = {
  solid: css`
    background: var(--pbl-color-primary);
    color: var(--pbl-color-text-inverse);

    &:hover {
      background: var(--pbl-color-primary-hover);
    }

    &:active {
      background: var(--pbl-color-primary-active);
    }
  `,
  outline: css`
    background: transparent;
    border-color: var(--pbl-color-border);
    color: var(--pbl-color-text);

    &:hover {
      border-color: var(--pbl-color-border-hover);
      background: var(--pbl-color-bg-subtle);
    }

    &:active {
      background: var(--pbl-color-bg-muted);
    }
  `,
  ghost: css`
    background: transparent;
    color: var(--pbl-color-text);

    &:hover {
      background: var(--pbl-color-bg-subtle);
    }

    &:active {
      background: var(--pbl-color-bg-muted);
    }
  `,
} as const;

const sizes = {
  sm: css`
    padding: var(--pbl-space-1) var(--pbl-space-3);
    font-size: var(--pbl-text-sm);
  `,
  md: css`
    padding: var(--pbl-space-2) var(--pbl-space-4);
    font-size: var(--pbl-text-sm);
  `,
  lg: css`
    padding: var(--pbl-space-3) var(--pbl-space-6);
    font-size: var(--pbl-text-base);
  `,
} as const;

export default function Button({
  variant = 'solid',
  size = 'md',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type='button'
      x-class={[base, variants[variant], sizes[size], className]}
      {...rest}
    />
  );
}

export type {ButtonProps};
