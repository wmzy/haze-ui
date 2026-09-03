import type { ReactNode } from 'react';

import type { ToastItem } from './ToastContext';

import { css } from '@linaria/core';
import { useState, useCallback, useRef } from 'react';

import Toast from './Toast';
import { ToastProvider } from './ToastContext';

type ToastPlacement =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

type ToastContainerProps = {
  children: ReactNode;
  /** Max simultaneous toasts; the oldest one is dropped on overflow. */
  maxCount?: number;
  /** Viewport edge the stack is pinned to. */
  placement?: ToastPlacement;
};

const containerBase = css`
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-2);
  pointer-events: none;
`;

export const toastPlacements = {
  'top-left': css`
    top: calc(var(--haze-space-4) + env(safe-area-inset-top));
    left: calc(var(--haze-space-4) + env(safe-area-inset-left));
  `,
  'top-right': css`
    top: calc(var(--haze-space-4) + env(safe-area-inset-top));
    right: calc(var(--haze-space-4) + env(safe-area-inset-right));
  `,
  'bottom-left': css`
    bottom: calc(var(--haze-space-4) + env(safe-area-inset-bottom));
    left: calc(var(--haze-space-4) + env(safe-area-inset-left));
  `,
  'bottom-right': css`
    bottom: calc(var(--haze-space-4) + env(safe-area-inset-bottom));
    right: calc(var(--haze-space-4) + env(safe-area-inset-right));
  `,
} as const;

export default function ToastContainer({
  children,
  maxCount,
  placement = 'bottom-right',
}: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      counterRef.current += 1;
      setToasts((prev) => {
        const next = [...prev, { ...toast, id: counterRef.current }];
        if (maxCount === undefined || next.length <= maxCount) return next;
        return next.slice(next.length - maxCount);
      });
    },
    [maxCount]
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastProvider value={{ toasts, addToast, removeToast }}>
      {children}
      <div x-class={[containerBase, toastPlacements[placement]]}>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            duration={t.duration}
            onClose={() => removeToast(t.id)}
          >
            {t.content}
          </Toast>
        ))}
      </div>
    </ToastProvider>
  );
}

export type { ToastContainerProps, ToastPlacement };
