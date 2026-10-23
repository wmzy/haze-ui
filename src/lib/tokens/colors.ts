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

/**
 * Zero-JS system-following theme: the full light token set at top level,
 * then the full dark token set re-declared on the same class inside a
 * `prefers-color-scheme: dark` media block (Linaria hoists the media
 * query and re-wraps it with this class selector, so no CSS nesting
 * support is required). Both sets are complete replacements — the
 * relative-color interaction formulas re-derive inside the media block
 * because it re-declares the custom properties they read from.
 *
 * Use it alone on any container (`<html class={autoTheme}>`): the subtree
 * follows the OS color scheme with no JS. Swapping to `lightTheme` /
 * `darkTheme` (e.g. via `useDarkMode`) is a replacement, not a stack —
 * never combine theme classes on one element.
 */
export const autoTheme = css`
${themeDeclarations('light')}

@media (prefers-color-scheme: dark) {
${themeDeclarations('dark')}
}
`;
