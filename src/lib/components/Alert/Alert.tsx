import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useState } from 'react';

type AlertProps = {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  closable?: boolean;
  className?: string;
  children: ReactNode;
};

const base = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-3);
  padding: var(--haze-space-3) var(--haze-space-4);
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);
`;

const variants = {
  info: css`
    background: color-mix(in srgb, var(--haze-color-info) 10%, transparent);
    color: var(--haze-color-info);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-info) 25%, transparent);
  `,
  success: css`
    background: color-mix(in srgb, var(--haze-color-success) 10%, transparent);
    color: var(--haze-color-success);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-success) 25%, transparent);
  `,
  warning: css`
    background: color-mix(in srgb, var(--haze-color-warning) 10%, transparent);
    color: var(--haze-color-warning);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-warning) 25%, transparent);
  `,
  danger: css`
    background: color-mix(in srgb, var(--haze-color-danger) 10%, transparent);
    color: var(--haze-color-danger);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-danger) 25%, transparent);
  `,
} as const;

const contentStyle = css`
  flex: 1;
`;

const closeBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: var(--haze-text-lg);
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
    border-radius: var(--haze-radius-sm);
  }
`;

export default function Alert({
  variant = 'info',
  closable = false,
  className,
  children,
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div role='alert' x-class={[base, variants[variant], className]}>
      <div className={contentStyle}>{children}</div>
      {closable && (
        <button
          type='button'
          className={closeBtn}
          aria-label='Close'
          onClick={() => setVisible(false)}
        >
          ×
        </button>
      )}
    </div>
  );
}

export type { AlertProps };
