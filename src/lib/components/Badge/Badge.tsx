import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type BadgeProps = {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
};

const base = css`
  display: inline-flex;
  align-items: center;
  border-radius: var(--haze-radius-full);
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
  line-height: var(--haze-leading-tight);
  white-space: nowrap;
`;

const variants = {
  default: css`
    background: var(--haze-color-bg-muted);
    color: var(--haze-color-text-secondary);
  `,
  success: css`
    background: color-mix(in srgb, var(--haze-color-success) 15%, transparent);
    color: var(--haze-color-success);
  `,
  warning: css`
    background: color-mix(in srgb, var(--haze-color-warning) 15%, transparent);
    color: var(--haze-color-warning);
  `,
  danger: css`
    background: color-mix(in srgb, var(--haze-color-danger) 15%, transparent);
    color: var(--haze-color-danger);
  `,
  info: css`
    background: color-mix(in srgb, var(--haze-color-info) 15%, transparent);
    color: var(--haze-color-info);
  `,
} as const;

const sizes = {
  sm: css`
    padding: var(--haze-space-0) var(--haze-space-2);
    font-size: var(--haze-text-xs);
  `,
  md: css`
    padding: var(--haze-space-1) var(--haze-space-3);
    font-size: var(--haze-text-sm);
  `,
} as const;

export default function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
}: BadgeProps) {
  return (
    <span x-class={[base, variants[variant], sizes[size], className]}>
      {children}
    </span>
  );
}

export type { BadgeProps };
