import {css} from '@linaria/core';

/**
 * Shared Pagination size skin — the per-size control metrics applied to
 * the nav (`sizes.sm` / `sizes.lg` tighten or loosen the buttons,
 * select and jumper input; `md` is the built-in and carries no class).
 * Sibling styles module per the react-refresh boundary convention
 * (Input `input-styles` precedent); split-css groups the module with
 * the Pagination family's css.
 */
export const sizes = {
  sm: css`
    & button, & select, & input { min-width: var(--haze-space-8); height: var(--haze-space-8); font-size: var(--haze-text-xs); }
  `,
  md: css``,
  lg: css`
    & button, & select, & input { min-width: var(--haze-space-10); height: var(--haze-space-10); font-size: var(--haze-text-base); }
  `,
} as const;
