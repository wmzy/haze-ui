import type { DensitySpaceTokenName } from './spacing';

import { css } from '@linaria/core';

import { SPACE_PX } from './spacing';

/*
 * Compact density: 75% of the default spacing scale, computed from the
 * SPACE_PX integers (tokens/spacing.ts) and declared through the
 * --haze-density-space-N indirection that the spacing class resolves
 * --haze-space-* through. The values are exact — the default scale is a
 * 4px grid, so Math.round(px * 0.75) of every step stays on an integer
 * px and the emitted table is byte-identical to the hand-written one it
 * replaces.
 *
 * Why indirection instead of re-declaring --haze-space-* here: a density
 * class that wrote --haze-space-3 directly would collide with the spacing
 * class at the same specificity, leaving the winner to stylesheet emission
 * order (unstable across per-component css splits and consumer bundles).
 * Here the two classes never declare the same property name — spacing asks
 * var(--haze-density-space-3, 12px) and compact answers it — so any class
 * order on the element produces the same computed scale.
 *
 * Because unregistered custom properties substitute var() eagerly at the
 * element that declares them, compact must land on the SAME element as the
 * spacing class (or on a subtree that re-declares spacing for its island):
 *
 *   <div className={`${lightTheme} ${compact} ${spacing} ${typography}`}>
 *
 * Pure constants — no hooks, no DOM access (RSC-safe; see
 * scripts/rsc-safe.mjs). The ./spacing import is a pure integer record.
 */

const toCompact = (px: number): string => `${Math.round(px * 0.75)}px`;

export const COMPACT_OVERRIDES: Record<DensitySpaceTokenName, string> =
  Object.fromEntries(
    Object.entries(SPACE_PX).map(([token, px]) => [
      token.replace('--haze-space-', '--haze-density-space-'),
      toCompact(px),
    ] as const)
  ) as Record<DensitySpaceTokenName, string>;

/**
 * The declarations the compact class emits, one per density override.
 * Exported for the token tests — the css template interpolates this
 * exact function and Linaria evaluates it at build time
 * (spacingDeclarations / remDeclarations precedent).
 */
export function compactDeclarations(): string {
  return Object.entries(COMPACT_OVERRIDES)
    .map(([token, value]) => `${token}: ${value};`)
    .join('\n');
}

export const compact = css`
${compactDeclarations()}
`;
