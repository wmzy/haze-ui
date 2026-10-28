import {css} from '@linaria/core';

import { statusSubtleColors } from '../../utils/status-skin';

/**
 * Shared Chip skin — the base, color and close-button classes the
 * `Chip` component wears. Living in their own module keeps the
 * component file free of style internals (react-refresh boundary) and
 * lets the per-variant color maps ship as a public constant
 * (`chipVariants`, the shadcn `buttonVariants` precedent) for
 * consumers composing custom elements with the same skin; split-css
 * groups the emitted CSS into `haze-ui/css/chip.css` with them.
 */

export const base = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  border-radius: var(--haze-radius-full);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  white-space: nowrap;
  line-height: 1;
  padding: var(--haze-space-1) var(--haze-space-3);
`;

/* The solid axis is the shared subtle status skin (utils/status-skin.ts)
 * — the same map Chip historically declared inline; aliased under its
 * public `chipVariants.solid` name. */
export const solidColors = statusSubtleColors;

export const outlineColors = {
  default: css`border: 1px solid var(--haze-color-border); color: var(--haze-color-text-secondary);`,
  primary: css`border: 1px solid var(--haze-color-primary); color: var(--haze-color-primary);`,
  success: css`border: 1px solid var(--haze-color-success); color: var(--haze-color-success);`,
  warning: css`border: 1px solid var(--haze-color-warning); color: var(--haze-color-warning);`,
  danger: css`border: 1px solid var(--haze-color-danger); color: var(--haze-color-danger);`,
  info: css`border: 1px solid var(--haze-color-info); color: var(--haze-color-info);`,
} as const;

/**
 * The full variant × color skin matrix in the `ChipProps` shape —
 * `chipVariants.solid.primary` is the class a solid primary chip wears
 * (the same lookup the component itself performs).
 */
export const chipVariants = {
  solid: solidColors,
  outline: outlineColors,
} as const;

export const iconStyle = css`
  display: inline-flex;
  align-items: center;
`;

/** Chip-local dismiss offset layered over the shared dismiss skin
 * (utils/status-skin.ts): the leading margin separating the × from the
 * label. Margin is not part of the shared chrome, so a plain class
 * composes order-independently. */
export const closeBtnGap = css`
  margin-inline-start: var(--haze-space-1);
`;
