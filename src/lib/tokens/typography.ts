import { css } from '@linaria/core';

/**
 * The text-size scale's numeric source of truth (px). The typography
 * class below and the 16px = 1rem text-zoom scale (./zoom) both derive
 * from these integers — same pattern as spacing's SPACE_PX.
 */
export const TEXT_SIZE_PX = {
  '--haze-text-xs': 12,
  '--haze-text-sm': 14,
  '--haze-text-base': 16,
  '--haze-text-lg': 18,
  '--haze-text-xl': 20,
  '--haze-text-2xl': 24,
  '--haze-text-3xl': 30,
} as const;

/**
 * The text-size declarations the typography class emits, one per size
 * step. Exported for the token tests — the css template interpolates
 * this exact function and Linaria evaluates it at build time
 * (spacingDeclarations precedent).
 */
export function textSizeDeclarations(): string {
  return Object.entries(TEXT_SIZE_PX)
    .map(([token, px]) => `  ${token}: ${px}px;`)
    .join('\n');
}

export const typography = css`
  --haze-font-sans:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  --haze-font-mono:
    'SF Mono', SFMono-Regular, ui-monospace, 'DejaVu Sans Mono', Menlo,
    Consolas, monospace;

${textSizeDeclarations()}

  --haze-leading-tight: 1.25;
  --haze-leading-normal: 1.5;
  --haze-leading-relaxed: 1.75;

  --haze-weight-normal: 400;
  --haze-weight-medium: 500;
  --haze-weight-semibold: 600;
  --haze-weight-bold: 700;
`;
