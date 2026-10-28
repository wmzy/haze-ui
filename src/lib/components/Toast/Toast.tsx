import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { ToastAction } from './ToastContext';

import { css } from '@linaria/core';
import { useCallback, useEffect, useRef } from 'react';

import { dismissBtn } from '../../utils/status-skin';
import { SpinnerGlyph, spinAnimation } from '../../utils/spinner-glyph';
import { usePausableTimeout } from '../../utils/use-pausable-timeout';

import { useStrings } from '../LocaleProvider';

/**
 * Semantic slot classes (AntD v6 `classNames` shape) for the toast
 * family. Toasts are usually fired imperatively (`useToast()` /
 * `toast()`), so the record is accepted by `ToastContainer` and flows
 * to every toast it renders; a directly rendered `<Toast>` accepts the
 * same record and reads the item slots. Consumer classes are appended
 * at the end of each part's class list (able to override component
 * defaults).
 */
type ToastClassNames = {
  /**
   * The fixed-position toast stack. Only `ToastContainer` renders this
   * part — a directly rendered `<Toast>` ignores the key.
   */
  viewport?: string;
  /** One toast: the `role="status"`/`"alert"` card. */
  item?: string;
  /** The body wrapper around the toast content. */
  content?: string;
  /** The action button (only rendered for toasts carrying an action). */
  action?: string;
  /** The bold title line (only rendered for toasts carrying a title). */
  title?: string;
  /** The dismiss × button. */
  close?: string;
};

type ToastProps = {
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'loading';
  /**
   * Action button rendered right of the content and left of the dismiss
   * × — a real focusable button (see {@link ToastAction}). `close`
   * defaults to `true`: the toast dismisses right after `onClick` runs.
   */
  action?: ToastAction;
  /** Bold first line rendered above the content. */
  title?: ReactNode;
  onClose: () => void;
  duration: number;
  children: ReactNode;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape) — see
   * {@link ToastClassNames}. Only `item`/`content`/`action`/`title`/
   * `close` apply to a directly rendered toast; `viewport` is a
   * `ToastContainer` part. Omitting it changes nothing.
   */
  classNames?: ToastClassNames;
} & Omit<ComponentPropsWithRef<'div'>, 'children' | 'onClose' | 'title'>;

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

  /* Presence (mounted by ToastContainer) injects data-state on this root:
   * open plays the entrance, closed plays the exit while the toast stays
   * mounted until the animation settles. */
  &[data-state='open'] {
    animation: toastIn var(--haze-duration-normal) var(--haze-ease);
  }

  &[data-state='closed'] {
    animation: toastOut var(--haze-duration-fast) var(--haze-ease);
  }

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

  @keyframes toastOut {
    to {
      opacity: 0;
      transform: translateY(-8px);
    }
  }
`;

const variants = {
  info: css`
    background: var(--haze-color-bg);
    color: var(--haze-color-text);
    border: 1px solid var(--haze-color-border);
  `,
  // Variant text uses the standard text token: the accent tokens
  // (--haze-color-success / --haze-color-warning …) sit under the
  // 4.5:1 threshold on the tinted background (axe color-contrast).
  // The accent stays visible through the border and the subtle
  // background tint — same shape as `info`.
  success: css`
    background: var(--haze-color-success-subtle);
    color: var(--haze-color-text);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-success) 25%, transparent);
  `,
  warning: css`
    background: var(--haze-color-warning-subtle);
    color: var(--haze-color-text);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-warning) 25%, transparent);
  `,
  danger: css`
    background: var(--haze-color-danger-subtle);
    color: var(--haze-color-text);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-danger) 25%, transparent);
  `,
  // The loading surface stays neutral (same shape as info): the spinner
  // glyph carries the state, and the settle patch swaps the whole item to
  // success/danger styling.
  loading: css`
    background: var(--haze-color-bg);
    color: var(--haze-color-text);
    border: 1px solid var(--haze-color-border);
  `,
} as const;

/* Live-region semantics per variant (Radix / React-Aria convention):
 * only danger may interrupt the screen reader — role="alert" is
 * implicitly aria-live="assertive". info/success/warning announce
 * politely via role="status" (implicitly aria-live="polite",
 * aria-atomic="true") so they queue behind in-progress speech. Each
 * toast is its own live region; ToastContainer's viewport must not add
 * aria-live/role of its own or the same toast would be announced twice. */
const liveRoles = {
  info: 'status',
  success: 'status',
  warning: 'status',
  danger: 'alert',
  loading: 'status',
} as const;

const contentStyle = css`
  flex: 1;
`;

/* Spinner glyph sizing for the `loading` variant — the glyph geometry
 * and the spin loop come from utils/spinner-glyph.tsx (shared with the
 * Spinner component, byte-identical pair). The glyph stays aria-hidden
 * art: the toast root is already the live region, so a nested
 * role="status" would announce the message twice. */
const spinnerIcon = css`
  flex-shrink: 0;
  width: var(--haze-text-base);
  height: var(--haze-text-base);
`;

const titleStyle = css`
  font-weight: var(--haze-weight-medium);
`;

const descriptionStyle = css`
  color: var(--haze-color-text-secondary);
`;

const actionBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: var(--haze-weight-medium);
  line-height: inherit;
  /* Same color as the toast text: the accent tokens sit under 4.5:1 on
   * the tinted variant surfaces (light primary on success-subtle ≈ 4.16),
   * so the interactive affordance comes from the underline instead.
   * Hover/active intensify into the primary ramp (>3:1 everywhere). */
  color: inherit;
  text-decoration: underline;
  text-underline-offset: calc(var(--haze-space-1) / 2);
  align-self: center;
  transition: color var(--haze-duration-fast);
  /* WCAG 2.5.8 target size: the label alone can fall under 24px — box it
   * out to the minimum with the label centered. */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;

  &:hover {
    color: var(--haze-color-primary);
  }

  &:active {
    color: var(--haze-color-primary-active);
  }

  &:focus-visible {
    outline: 2px solid var(--haze-color-focus-ring);
    outline-offset: 2px;
  }
`;

/** Runs a toast action, then dismisses the toast unless it opted out
 * (`close: false`). The countdown semantics are untouched: a closing
 * toast never needed its timer again, and a staying one keeps running. */
function runToastAction(action: ToastAction, onClose: () => void) {
  action.onClick();
  if (action.close !== false) onClose();
}

export default function Toast({
  variant = 'info',
  action,
  title,
  onClose,
  duration,
  children,
  classNames,
  className,
  ...rest
}: ToastProps) {
  const strings = useStrings('toast');
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  // Keep the latest onClose without re-arming the timer when the parent
  // re-renders with a fresh callback identity.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Banks at 0: a consumed countdown is simply over (the shared hook's
  // other flavors — recurring re-arm, 1ms stall floor — belong to
  // Carousel's autoplay engine).
  const { pause: pauseTimer, resume: resumeTimer } = usePausableTimeout({
    delay: duration,
    onFire: () => onCloseRef.current(),
    enabled: duration > 0,
  });

  // WCAG 2.2.1: hover or focus (both bubbling to the toast root) freezes the
  // countdown; leaving/unfocusing resumes it with whatever budget is left.
  const syncPaused = useCallback(() => {
    if (hoveredRef.current || focusedRef.current) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }, [pauseTimer, resumeTimer]);

  return (
    <div
      role={liveRoles[variant]}
      data-slot='toast'
      x-class={[base, variants[variant], className, classNames?.item]}
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
      {...rest}
    >
      {variant === 'loading' && (
        <SpinnerGlyph
          data-slot='icon'
          x-class={[spinAnimation, spinnerIcon]}
        />
      )}
      <div data-slot='content' x-class={[contentStyle, classNames?.content]}>
        {title === undefined ? (
          children
        ) : (
          <>
            <div data-slot='title' x-class={[titleStyle, classNames?.title]}>{title}</div>
            <div data-slot='description' x-class={descriptionStyle}>{children}</div>
          </>
        )}
      </div>
      {action !== undefined && (
        <button
          type='button'
          data-slot='action'
          x-class={[actionBtn, classNames?.action]}
          onClick={() => runToastAction(action, onCloseRef.current)}
        >
          {action.label}
        </button>
      )}
      <button
        type='button'
        data-slot='close'
        x-class={[dismissBtn, classNames?.close]}
        aria-label={strings.close}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export type { ToastProps, ToastClassNames };
