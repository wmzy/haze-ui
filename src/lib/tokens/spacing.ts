import { css } from '@linaria/core';

import { zIndexDeclarations } from './z-index';

/*
 * Spacing defaults live in SPACING_DEFAULTS (derived from the SPACE_PX
 * integers below) so the css template here, the compact density class
 * (./density), the text-zoom rem scale (./zoom) and the token tests all
 * read one source of truth (same pattern as colors.ts deriving its
 * themes from palette.ts).
 *
 * Indirect addressing: every --haze-space-N the spacing class declares
 * resolves through a --haze-density-space-N reference with the default as
 * fallback. Unregistered custom properties substitute their var() eagerly
 * at the element that declares them, so a --haze-density-* value cascaded
 * onto that same element is what the scale resolves to there — while the
 * spacing class and a density class never declare the same property name,
 * so neither can win or lose by stylesheet emission order (see ./density).
 * Radius and shadow stay direct: they are not density-adjusted. The
 * z-index ladder stays direct too and rides the same class — the spacing
 * class is the always-applied invariant token carrier, so its tiers
 * resolve wherever spacing does (see ./z-index).
 */

const SPACE_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16] as const;

export type SpaceStep = (typeof SPACE_STEPS)[number];
export type SpaceTokenName = `--haze-space-${SpaceStep}`;
export type DensitySpaceTokenName = `--haze-density-space-${SpaceStep}`;

/**
 * The spacing scale's numeric source of truth (px per overridable step).
 * Everything the scale becomes is derived from these integers: the
 * SPACING_DEFAULTS declarations right below, compact density (./density,
 * ×0.75) and the 16px = 1rem text-zoom scale (./zoom).
 */
export const SPACE_PX: Record<SpaceTokenName, number> = {
  '--haze-space-1': 4,
  '--haze-space-2': 8,
  '--haze-space-3': 12,
  '--haze-space-4': 16,
  '--haze-space-5': 20,
  '--haze-space-6': 24,
  '--haze-space-8': 32,
  '--haze-space-10': 40,
  '--haze-space-12': 48,
  '--haze-space-16': 64,
};

/** `<n>px` string per step — the fallback values the spacing class declares. */
export const SPACING_DEFAULTS: Record<SpaceTokenName, string> =
  Object.fromEntries(
    Object.entries(SPACE_PX).map(([token, px]) => [token, `${px}px`])
  ) as Record<SpaceTokenName, string>;

/**
 * The space declarations the spacing class emits, one per overridable step:
 * `--haze-space-N: var(--haze-density-space-N, <default>);`. Exported for
 * the token tests — the css template interpolates this exact function, and
 * Linaria evaluates it at build time (colors.ts interpolation precedent).
 */
export function spacingDeclarations(): string {
  return SPACE_STEPS.map((step) => {
    const token: SpaceTokenName = `--haze-space-${step}`;
    return `${token}: var(--haze-density-space-${step}, ${SPACING_DEFAULTS[token]});`;
  }).join('\n');
}

export const spacing = css`
  --haze-space-0: 0;
${spacingDeclarations()}

  --haze-radius-none: 0;
  --haze-radius-sm: 4px;
  --haze-radius-md: 6px;
  --haze-radius-lg: 8px;
  --haze-radius-xl: 12px;
  --haze-radius-2xl: 16px;
  --haze-radius-full: 9999px;

  --haze-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --haze-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --haze-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --haze-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);

${zIndexDeclarations()}
`;
