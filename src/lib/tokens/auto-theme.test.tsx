/*
 * autoTheme contract: the zero-JS system-following theme class. vitest
 * runs with css:false, so — spacing.test / tokens.test precedent — the
 * emitted declarations are asserted through themeDeclarations(), the
 * exact function the css template interpolates (byte-parity with what
 * colors.ts emits is anchored in brand-theme.test.ts), plus source-level
 * fs checks that the template wires BOTH mode blocks and the
 * prefers-color-scheme media query around the dark one. The rendered
 * class application is asserted against the transformed export itself:
 * if the Linaria pipeline rejected the template, importing ./colors
 * would throw at runtime ("css tag in runtime is not supported").
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { render } from '@testing-library/react';

import { autoTheme, darkTheme, lightTheme } from './colors';
import { PRIMITIVES, SEMANTIC_COLOR_TOKENS, themeDeclarations } from './palette';

const colorsSource = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'colors.ts'),
  'utf8'
);

const lightBlock = themeDeclarations('light', PRIMITIVES, SEMANTIC_COLOR_TOKENS);
const darkBlock = themeDeclarations('dark', PRIMITIVES, SEMANTIC_COLOR_TOKENS);

/** `--haze-*` custom-property names declared by one block, in order. */
const declaredNames = (block: string): string[] =>
  block
    .split('\n')
    .flatMap((line) => /^--haze-[a-z0-9-]+: /.exec(line) ?? [])
    .map((line) => line.slice(0, line.indexOf(':')));

describe('autoTheme — source wiring (css template)', () => {
  it('declares the light set at top level and the dark set inside prefers-color-scheme: dark', () => {
    expect(
      colorsSource
    ).toMatch(
      /export const autoTheme = css`\n\$\{themeDeclarations\('light'\)\}\n\n@media \(prefers-color-scheme: dark\) \{\n\$\{themeDeclarations\('dark'\)\}\n\}\n`;/
    );
  });

  it('uses exactly one media query — the same prefers-color-scheme: dark query useDarkMode follows', () => {
    const queries = colorsSource.match(/@media \(prefers-color-scheme: dark\)/g) ?? [];
    expect(queries).toHaveLength(1);
  });

  it('keeps lightTheme/darkTheme single-interpolation templates (no media wrapping)', () => {
    expect(colorsSource).toMatch(
      /export const lightTheme = css`\n\$\{themeDeclarations\('light'\)\}\n`;/
    );
    expect(colorsSource).toMatch(
      /export const darkTheme = css`\n\$\{themeDeclarations\('dark'\)\}\n`;/
    );
  });
});

describe('autoTheme — both var sets are complete (counts match light + dark)', () => {
  it('each block declares every primitive step and every semantic token', () => {
    const expected = [
      ...Object.entries(PRIMITIVES.light).flatMap(([family, steps]) =>
        steps.map((_value, index) => `--haze-${family}-${index + 1}`)
      ),
      ...SEMANTIC_COLOR_TOKENS.map((token) => token.name),
    ];
    expect(declaredNames(lightBlock)).toEqual(expected);
    expect(declaredNames(darkBlock)).toEqual(expected);
  });

  it('the two sets carry identical names but a real dark resolution', () => {
    expect(declaredNames(darkBlock)).toEqual(declaredNames(lightBlock));
    expect(darkBlock).not.toBe(lightBlock);
    // Neutral aliases keep their step (bg = gray-1 in both modes) — dark
    // mode inverts the scale itself: dark gray-1 is near-black, not white.
    expect(lightBlock).toContain('--haze-color-bg: var(--haze-gray-1);');
    expect(darkBlock).toContain('--haze-color-bg: var(--haze-gray-1);');
    expect(PRIMITIVES.light.gray[0]).not.toBe(PRIMITIVES.dark.gray[0]);
    expect(lightBlock).toContain(`--haze-gray-1: ${PRIMITIVES.light.gray[0]};`);
    expect(darkBlock).toContain(`--haze-gray-1: ${PRIMITIVES.dark.gray[0]};`);
  });

  it('relative-color interaction formulas re-derive inside the dark set too', () => {
    for (const block of [lightBlock, darkBlock]) {
      expect(block).toContain('--haze-color-primary-hover: oklch(from var(--haze-color-primary) calc(l');
      expect(block).toContain('--haze-color-primary-active: oklch(from var(--haze-color-primary) calc(l');
      expect(block).toContain('--haze-color-primary-subtle: oklch(from var(--haze-color-primary)');
      expect(block).toContain('--haze-color-focus-ring: oklch(from var(--haze-color-primary) l c h / 0.4);');
    }
  });
});

describe('autoTheme — applies to any container like the existing theme classes', () => {
  it('is a Linaria class name string, like lightTheme/darkTheme', () => {
    expect(typeof autoTheme).toBe('string');
    expect(autoTheme.length).toBeGreaterThan(0);
    expect(autoTheme).toContain('autoTheme');
    expect(typeof lightTheme).toBe('string');
    expect(typeof darkTheme).toBe('string');
  });

  it('lands on a rendered container without interfering with sibling classes', () => {
    const {container} = render(<div className={`app-root ${autoTheme}`}>zero-JS</div>);
    expect(container.firstElementChild?.className).toContain('app-root');
    expect(container.firstElementChild?.className).toContain(autoTheme);
  });
});
