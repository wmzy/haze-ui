import {css} from '@linaria/core';

import { statusSubtleColors } from '../../utils/status-skin';

/**
 * Shared Alert skin — the base and color classes the `Alert`
 * component wears. Living in their own module keeps the component file
 * free of style internals (react-refresh boundary) and lets the
 * colors map ship as a public constant (`alertVariants`, the shadcn
 * `buttonVariants` precedent) for consumers composing custom elements
 * with the same skin; split-css groups the emitted CSS into
 * `haze-ui/css/alert.css` with them.
 */

export const base = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-3);
  padding: var(--haze-space-3) var(--haze-space-4);
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);
`;

/* The tinted surface/text pair comes from the shared status skin
 * (utils/status-skin.ts — byte-identical to Badge/Tag/Banner/Chip's
 * subtle axis); Alert's own layer below is the color-mix border
 * composed on top. Key order preserved from the historical map (the
 * public `alertVariants` shape). */
export const colors = {
  default: statusSubtleColors.default,
  primary: statusSubtleColors.primary,
  info: statusSubtleColors.info,
  success: statusSubtleColors.success,
  warning: statusSubtleColors.warning,
  danger: statusSubtleColors.danger,
} as const;

/** The border layer Alert composes over the shared subtle skin — the
 * 25% color-mix edge that frames the message with its accent. */
export const borders = {
  default: css`
    border: 1px solid var(--haze-color-border);
  `,
  primary: css`
    border: 1px solid
      color-mix(in srgb, var(--haze-color-primary) 25%, transparent);
  `,
  info: css`
    border: 1px solid
      color-mix(in srgb, var(--haze-color-info) 25%, transparent);
  `,
  success: css`
    border: 1px solid
      color-mix(in srgb, var(--haze-color-success) 25%, transparent);
  `,
  warning: css`
    border: 1px solid
      color-mix(in srgb, var(--haze-color-warning) 25%, transparent);
  `,
  danger: css`
    border: 1px solid
      color-mix(in srgb, var(--haze-color-danger) 25%, transparent);
  `,
} as const;

export const contentStyle = css`
  flex: 1;
`;
