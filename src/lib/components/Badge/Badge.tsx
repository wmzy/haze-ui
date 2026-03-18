import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type BadgeProps = {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
};

const base = css`
  display: inline-flex;
  align-items: center;
  border-radius: var(--pbl-radius-full);
  font-family: var(--pbl-font-sans);
  font-weight: var(--pbl-weight-medium);
  line-height: var(--pbl-leading-tight);
  white-space: nowrap;
`;

const variants = {
  default: css`
    background: var(--pbl-color-bg-muted);
    color: var(--pbl-color-text-secondary);
  `,
  success: css`
    background: color-mix(in srgb, var(--pbl-color-success) 15%, transparent);
    color: var(--pbl-color-success);
  `,
  warning: css`
    background: color-mix(in srgb, var(--pbl-color-warning) 15%, transparent);
    color: var(--pbl-color-warning);
  `,
  danger: css`
    background: color-mix(in srgb, var(--pbl-color-danger) 15%, transparent);
    color: var(--pbl-color-danger);
  `,
  info: css`
    background: color-mix(in srgb, var(--pbl-color-info) 15%, transparent);
    color: var(--pbl-color-info);
  `,
} as const;

const sizes = {
  sm: css`
    padding: var(--pbl-space-0) var(--pbl-space-2);
    font-size: var(--pbl-text-xs);
  `,
  md: css`
    padding: var(--pbl-space-1) var(--pbl-space-3);
    font-size: var(--pbl-text-sm);
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

export type {BadgeProps};
