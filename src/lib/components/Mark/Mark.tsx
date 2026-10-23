import type { ComponentPropsWithoutRef } from 'react';

import { css } from '@linaria/core';

type MarkProps = {
  /** Semantic highlight color — maps to the status tokens. */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
} & Omit<ComponentPropsWithoutRef<'mark'>, 'color'>;

const base = css`
  padding-inline: var(--haze-space-1);
  border-radius: var(--haze-radius-sm);
  /* subtle background + tone color — the Badge status pairing */
  background: var(--haze-color-warning-subtle);
  color: var(--haze-color-warning);

  @media (forced-colors: active) {
    /* UA flattens backgrounds — Mark stays visible via the system
     * Highlight pair */
    background: Mark;
    color: MarkText;
  }
`;

const neutral = css`
  background: var(--haze-color-bg-muted);
  color: var(--haze-color-text-secondary);
`;

const primary = css`
  background: var(--haze-color-primary-subtle);
  color: var(--haze-color-primary);
`;

const success = css`
  background: var(--haze-color-success-subtle);
  color: var(--haze-color-success);
`;

const danger = css`
  background: var(--haze-color-danger-subtle);
  color: var(--haze-color-danger);
`;

const info = css`
  background: var(--haze-color-info-subtle);
  color: var(--haze-color-info);
`;

const colors = {
  default: neutral,
  warning: base,
  primary,
  success,
  danger,
  info,
} as const;

/**
 * Text-level highlight — the semantic `<mark>` skinned with the status
 * tokens. For search-result highlighting of arbitrary substrings use
 * Highlight, which composes this element.
 */
export default function Mark({ color = 'warning', className, ...rest }: MarkProps) {
  return <mark data-slot='mark' x-class={[colors[color], className]} {...rest} />;
}

export type { MarkProps };
