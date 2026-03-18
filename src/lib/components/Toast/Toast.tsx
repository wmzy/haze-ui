import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useEffect } from 'react';

type ToastProps = {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  onClose: () => void;
  duration: number;
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
  box-shadow: var(--haze-shadow-lg);
  pointer-events: auto;
  animation: toastIn 0.2s ease-out;

  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const variants = {
  info: css`
    background: var(--haze-color-bg);
    color: var(--haze-color-text);
    border: 1px solid var(--haze-color-border);
  `,
  success: css`
    background: color-mix(
      in srgb,
      var(--haze-color-success) 10%,
      var(--haze-color-bg)
    );
    color: var(--haze-color-success);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-success) 25%, transparent);
  `,
  warning: css`
    background: color-mix(
      in srgb,
      var(--haze-color-warning) 10%,
      var(--haze-color-bg)
    );
    color: var(--haze-color-warning);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-warning) 25%, transparent);
  `,
  danger: css`
    background: color-mix(
      in srgb,
      var(--haze-color-danger) 10%,
      var(--haze-color-bg)
    );
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
`;

export default function Toast({
  variant = 'info',
  onClose,
  duration,
  children,
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div role='alert' x-class={[base, variants[variant]]}>
      <div className={contentStyle}>{children}</div>
      <button
        type='button'
        className={closeBtn}
        aria-label='Close'
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export type { ToastProps };
