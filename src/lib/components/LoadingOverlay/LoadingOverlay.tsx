import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';

import Spinner from '../Spinner/Spinner';

/**
 * Container-level loading state: dims the wrapped content and centers a
 * spinner above it. The content stays in the tree (focus keeps its
 * place when the overlay lifts); `aria-busy` on the wrapper is the AT
 * channel the Mantine equivalent uses — the block becomes non-interactive
 * by aria-disabled on children not being rescriptable, so consumers gate
 * their own handlers on the same `visible` prop.
 */
type LoadingOverlayProps = {
  /** Whether the overlay is shown. */
  visible?: boolean;
  /** Optional announcement text rendered inside a visually-paired label
   * under the spinner for sighted context. */
  label?: ReactNode;
  /** Swap the default Spinner. */
  loader?: ReactNode;
  /** Spinner size (when the default loader is used). */
  spinnerSize?: 'sm' | 'md' | 'lg';
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const wrapper = css`
  position: relative;
`;

const veil = css`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--haze-space-2);
  background: color-mix(in oklab, var(--haze-color-bg) 70%, transparent);
  z-index: 1;

  @media (forced-colors: active) {
    background: Canvas;
  }
`;

const veilLabel = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
`;

const dimmed = css`
  /* The content goes inert under the veil: keyboard focus, pointer and
   * selection all blocked (aria-modal would be wrong here — this is a
   * transient region state, not a dialog). */
  pointer-events: none;
  user-select: none;
  opacity: 0.45;

  @media (forced-colors: active) {
    opacity: 0.6;
  }
`;

export default function LoadingOverlay({
  visible = false,
  label,
  loader,
  spinnerSize = 'md',
  className,
  children,
  ...rest
}: LoadingOverlayProps) {
  return (
    <div
      data-slot='loading-overlay'
      aria-busy={visible || undefined}
      x-class={[wrapper, className]}
      {...rest}
    >
      <div data-slot='content' x-class={[visible && dimmed]}>
        {children}
      </div>
      {visible && (
        <div data-slot='veil' x-class={[veil]}>
          {loader ?? <Spinner size={spinnerSize} />}
          {label !== undefined && label !== null && (
            <span x-class={[veilLabel]}>{label}</span>
          )}
        </div>
      )}
    </div>
  );
}

export type { LoadingOverlayProps };
