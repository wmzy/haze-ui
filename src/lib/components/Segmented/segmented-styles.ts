import {css} from '@linaria/core';

/**
 * Shared Segmented size skin — the per-size option-button classes the
 * `SegmentedCore` component wears (the `Segmented` sugar delegates to
 * it). Sibling styles module per the react-refresh boundary convention
 * (Input `input-styles` precedent); the sizes arm the buttons through
 * the container (`& button`), so one class sizes the whole group.
 * split-css groups the module with the Segmented family's css.
 */
export const sizes = {
  sm: css`& button { padding: var(--haze-space-0) var(--haze-space-2); font-size: var(--haze-text-xs); }`,
  md: css`& button { padding: var(--haze-space-1) var(--haze-space-3); font-size: var(--haze-text-sm); }`,
  lg: css`& button { padding: var(--haze-space-2) var(--haze-space-4); font-size: var(--haze-text-base); }`,
} as const;
