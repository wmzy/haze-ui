import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';

import Spinner from '../Spinner/Spinner';

/**
 * Container-level loading state: dims the wrapped content and centers a
 * spinner above it. The content stays in the tree and keeps its place
 * in the focus order — deliberately, so focus survives the overlay
 * (`aria-busy` on the wrapper is the AT channel, same as the Mantine
 * equivalent). The veil blocks pointer and selection, but nothing here
 * is modal: keyboard users can still reach the content. Consumers that
 * need a full lock gate their own handlers on the same `visible` prop
 * (or host the content in an `inert` subtree).
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
  /* Host children that build their own stacking context can surface
   * above a bare z-index:1 — component variable keeps the veil
   * overridable without new tokens. */
  z-index: var(--haze-overlay-z, var(--haze-z-local-1));

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
  /* Pointer and selection are blocked under the veil. Keyboard focus
   * is deliberately NOT blocked — the content keeps its place in the
   * focus order so focus survives the overlay (aria-modal would be
   * wrong here: this is a transient region state, not a dialog).
   * Consumers needing a full lock gate handlers on the visible prop or
   * host the content in an inert subtree. */
  pointer-events: none;
  user-select: none;
  opacity: var(--haze-overlay-dim-opacity, 0.45);

  @media (forced-colors: active) {
    opacity: var(--haze-overlay-dim-opacity, 0.6);
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
