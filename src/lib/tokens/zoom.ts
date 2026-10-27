import type { DensitySpaceTokenName } from './spacing';

import { css } from '@linaria/core';

import { SPACE_PX } from './spacing';
import { TEXT_SIZE_PX } from './typography';

/*
 * Text-zoom preset (WCAG 1.4.4 resize text): re-declares the spacing,
 * text-size and radius scales at a 16px = 1rem base so the whole metric
 * system follows the root font size.
 *
 * Why: full-page browser zoom scales px layouts fine, but text-only zoom
 * (browser text-zoom modes, OS font-size settings that surface as rem)
 * scales rem/em only. The default scales are px, so at 200% text zoom the
 * glyphs grow while paddings, gaps and radii stay put — text clips and
 * containers stop tracking their content. remScale opts a subtree into
 * zoom-following metrics: every value below is exactly <px>/16 rem, so at
 * the default 16px root font size nothing changes visually.
 *
 * Usage — mount on the SAME element that carries the token classes
 * (x-class={[lightTheme, spacing, typography, remScale]} or a className
 * string). Chromium substitutes var() inside unregistered custom
 * properties eagerly, on the element where the property is declared, so
 * a remScale on a descendant cannot retroactively re-resolve the px
 * values the theme root already baked. For a zoomable island inside a
 * default page, re-declare the scales on the subtree itself (the
 * compact-island pattern from the Density guide):
 *
 *   <section className={`${spacing} ${typography} ${remScale}`}>…</section>
 *
 * How it wins, per family:
 * - Space rides the --haze-density-space-N indirection that the spacing
 *   class resolves --haze-space-* through (same trick as ./density):
 *   remScale and spacing never write the same property name, so no
 *   stylesheet emission order is involved.
 * - Text sizes and radii have no indirection layer; remScale re-declares
 *   the public names directly, so its rule must come after the spacing /
 *   typography classes. That is guaranteed by construction: the token
 *   barrels export ./zoom last and the package exports map only exposes
 *   the barrels, so every supported import order evaluates zoom after
 *   the base scales and its declarations win the same-specificity tie.
 * - Do not combine with compact: both answer the density indirection, so
 *   together their winner would be emission-order-dependent. Pick one
 *   per subtree.
 *
 * Deliberately untouched: shadow tokens stay px (cosmetic depth should
 * not inflate with text zoom), and --haze-leading-* is unitless by
 * design — line-height multipliers scale with the font size they
 * multiply.
 *
 * Pure constants — no hooks, no DOM access (RSC-safe; see
 * scripts/rsc-safe.mjs). The ./spacing and ./typography imports are pure
 * integer records; both modules are in the RSC-safe group, so the
 * closure stays in-group.
 */

/** `<px>` at a 16px = 1rem base, as an exact rem string (12 → `0.75rem`). */
const toRem = (px: number): string => `${px / 16}rem`;

/** The spacing scale at a 16px = 1rem base, answered through the density indirection. */
export const REM_SPACE_OVERRIDES: Record<DensitySpaceTokenName, string> =
  Object.fromEntries(
    Object.entries(SPACE_PX).map(([token, px]) => [
      token.replace('--haze-space-', '--haze-density-space-'),
      toRem(px),
    ] as const)
  ) as Record<DensitySpaceTokenName, string>;

/** The text-size scale at a 16px = 1rem base (leading is unitless already). */
export const REM_TEXT_SIZES = Object.fromEntries(
  Object.entries(TEXT_SIZE_PX).map(([token, px]) => [token, toRem(px)] as const)
) as Record<keyof typeof TEXT_SIZE_PX, string>;

export type TextSizeTokenName = keyof typeof REM_TEXT_SIZES;

/**
 * The radius scale at a 16px = 1rem base (9999px = 624.9375rem exactly).
 * Kept literal on purpose: the radius values are template-only data in
 * tokens/spacing.ts (no numeric record to derive from), so each entry
 * mirrors its `--haze-radius-*` px declaration there by hand.
 */
export const REM_RADII = {
  '--haze-radius-none': '0',
  '--haze-radius-sm': '0.25rem',
  '--haze-radius-md': '0.375rem',
  '--haze-radius-lg': '0.5rem',
  '--haze-radius-xl': '0.75rem',
  '--haze-radius-2xl': '1rem',
  '--haze-radius-full': '624.9375rem',
} as const;

export type RadiusTokenName = keyof typeof REM_RADII;

/**
 * The declarations the remScale class emits, one per re-declared token.
 * Exported for the token tests — the css template interpolates this exact
 * function and Linaria evaluates it at build time (spacingDeclarations /
 * compactDeclarations precedent).
 */
export function remDeclarations(): string {
  return [
    ...Object.entries(REM_SPACE_OVERRIDES),
    ...Object.entries(REM_TEXT_SIZES),
    ...Object.entries(REM_RADII),
  ]
    .map(([token, value]) => `${token}: ${value};`)
    .join('\n');
}

export const remScale = css`
${remDeclarations()}
`;
