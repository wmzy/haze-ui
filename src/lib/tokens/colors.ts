import type {Mode} from './palette';

import {css} from '@linaria/core';

import {PRIMITIVES, SEMANTIC_COLOR_TOKENS} from './palette';

/**
 * Theme classes are generated from the OKLCH palette: primitive 12-step
 * scales first (`--haze-{family}-{1..12}`), then semantic aliases and their
 * runtime-derived interaction states (CSS relative color syntax, so consumer
 * overrides of a base color propagate to hover/active/subtle/focus-ring).
 */

function themeDeclarations(mode: Mode): string {
  const primitives = Object.entries(PRIMITIVES[mode])
    .flatMap(([family, steps]) => steps.map((value, index) => `--haze-${family}-${index + 1}: ${value};`))
    .join('\n');
  const semantic = SEMANTIC_COLOR_TOKENS.map((token) => `${token.name}: ${token.css[mode]};`).join('\n');
  return `${primitives}\n\n${semantic}`;
}

export const lightTheme = css`
${themeDeclarations('light')}
`;

export const darkTheme = css`
${themeDeclarations('dark')}
`;
