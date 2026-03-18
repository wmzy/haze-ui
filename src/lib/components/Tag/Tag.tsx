import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type TagProps = {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  closable?: boolean;
  onClose?: () => void;
  className?: string;
  children: ReactNode;
};

const base = css`
  display: inline-flex;
  align-items: center;
  gap: var(--pbl-space-1);
  border-radius: var(--pbl-radius-md);
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
  primary: css`
    background: var(--pbl-color-primary-subtle);
    color: var(--pbl-color-primary);
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
} as const;

const tagSizes = {
  sm: css`
    padding: var(--pbl-space-0) var(--pbl-space-2);
    font-size: var(--pbl-text-xs);
  `,
  md: css`
    padding: var(--pbl-space-1) var(--pbl-space-3);
    font-size: var(--pbl-text-sm);
  `,
} as const;

const closeBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.15s;
  display: inline-flex;
  align-items: center;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
    border-radius: var(--pbl-radius-sm);
  }
`;

export default function Tag({
  variant = 'default',
  size = 'md',
  closable = false,
  onClose,
  className,
  children,
}: TagProps) {
  return (
    <span x-class={[base, variants[variant], tagSizes[size], className]}>
      {children}
      {closable && (
        <button type='button' className={closeBtn} aria-label='Remove' onClick={onClose}>
          ×
        </button>
      )}
    </span>
  );
}

export type {TagProps};
