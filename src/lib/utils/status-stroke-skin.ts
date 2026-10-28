import { css } from '@linaria/core';

/**
 * Stroke status axis — Progress's circle track stroke. Kept out of
 * utils/status-skin.ts / utils/status-solid-skin.ts because Linaria
 * derives a css class's display name from the member key: two maps
 * sharing keys in one module compile to the SAME class name and the
 * emitted css keeps only one (wave-5 incident — the subtle axis was
 * silently lost until the badge/tag e2e baselines caught it). One css
 * map per module. Pure Linaria class constants (RSC-safe listed,
 * scripts/rsc-safe.mjs); rides with the consuming family via
 * sharedLayers (split-css.mjs).
 */

/** Stroked status surface: the full accent as a stroke color. */
export const statusStrokeColors = {
  default: css`
    stroke: var(--haze-color-text-secondary);
  `,
  primary: css`
    stroke: var(--haze-color-primary);
  `,
  success: css`
    stroke: var(--haze-color-success);
  `,
  warning: css`
    stroke: var(--haze-color-warning);
  `,
  danger: css`
    stroke: var(--haze-color-danger);
  `,
  info: css`
    stroke: var(--haze-color-info);
  `,
} as const;
