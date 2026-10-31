import { css } from '@linaria/core';

/**
 * The tabular numeric base CountUp and Countdown wore as byte-identical
 * copies: digits share one advance width (tabular-nums) so a counting
 * or per-second ticking number does not jitter, set in the sans family,
 * with size and color inherited so the number slots into Stat-like
 * contexts unchanged.
 *
 * Pure css module — rides with the consuming component groups
 * (sharedLayers in scripts/split-css.mjs).
 */
export const tabularNums = css`
  font-variant-numeric: tabular-nums;
  font-family: var(--haze-font-sans);
  font-size: inherit;
  color: inherit;
`;
