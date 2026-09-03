import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useCallback, useEffect, useRef } from 'react';

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
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  // Keep the latest onClose without re-arming the timer when the parent
  // re-renders with a fresh callback identity.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    // Bank the elapsed slice so resuming uses the remaining budget, not the
    // full duration again. Re-entrant: a no-op while already paused.
    remainingRef.current = Math.max(
      0,
      remainingRef.current - (Date.now() - startedAtRef.current)
    );
  }, []);

  const resumeTimer = useCallback(() => {
    if (timerRef.current !== null || remainingRef.current <= 0) return;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onCloseRef.current();
    }, remainingRef.current);
  }, []);

  // WCAG 2.2.1: hover or focus (both bubbling to the toast root) freezes the
  // countdown; leaving/unfocusing resumes it with whatever budget is left.
  const syncPaused = useCallback(() => {
    if (hoveredRef.current || focusedRef.current) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }, [pauseTimer, resumeTimer]);

  useEffect(() => {
    if (duration <= 0) return;
    remainingRef.current = duration;
    if (!hoveredRef.current && !focusedRef.current) resumeTimer();
    // Cleanup banks elapsed time so the budget stays accurate.
    return pauseTimer;
  }, [duration, resumeTimer, pauseTimer]);

  return (
    <div
      role='alert'
      x-class={[base, variants[variant]]}
      onPointerEnter={() => {
        hoveredRef.current = true;
        syncPaused();
      }}
      onPointerLeave={() => {
        hoveredRef.current = false;
        syncPaused();
      }}
      onFocus={() => {
        focusedRef.current = true;
        syncPaused();
      }}
      onBlur={() => {
        focusedRef.current = false;
        syncPaused();
      }}
    >
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
