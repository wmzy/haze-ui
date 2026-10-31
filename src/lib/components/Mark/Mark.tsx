import type { ComponentPropsWithoutRef } from 'react';

import { css } from '@linaria/core';

import { statusSubtleColors } from '../../utils/status-skin';

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

/* Tone surfaces come from the shared status skin (utils/status-skin
 * `statusSubtleColors` — the same subtle pairing Badge/Tag wear);
 * `warning` stays local because it is the full element chassis
 * (padding, radius, forced-colors arm), not just the tone pair. */
const colors = {
  default: statusSubtleColors.default,
  warning: base,
  primary: statusSubtleColors.primary,
  success: statusSubtleColors.success,
  danger: statusSubtleColors.danger,
  info: statusSubtleColors.info,
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
