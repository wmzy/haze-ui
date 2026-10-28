import { css } from '@linaria/core';

/**
 * Solid status axis — Progress's bar fill and Indicator's solid tone
 * dots. A sibling of utils/status-skin.ts (subtle) and
 * utils/status-stroke-skin.ts rather than a second map inside either:
 * Linaria derives a css class's display name from the member key, so
 * two maps sharing keys (subtle/solid both have `primary`) in ONE
 * module compile to the SAME class name and the emitted css keeps only
 * one of them — wave 5 lost the entire subtle axis that way before the
 * split (caught only by the badge/tag e2e baselines; jsdom cannot see
 * css). One css map per module is the rule. Pure Linaria class
 * constants (RSC-safe listed, scripts/rsc-safe.mjs); rides with the
 * consuming families via sharedLayers (split-css.mjs).
 */

/** Solid status surface: the full accent as the surface color. */
export const statusSolidColors = {
  default: css`
    background: var(--haze-color-text-secondary);
  `,
  primary: css`
    background: var(--haze-color-primary);
  `,
  success: css`
    background: var(--haze-color-success);
  `,
  warning: css`
    background: var(--haze-color-warning);
  `,
  danger: css`
    background: var(--haze-color-danger);
  `,
  info: css`
    background: var(--haze-color-info);
  `,
} as const;
