/*
 * Text-zoom preset contract (WCAG 1.4.4): remScale re-declares exactly
 * the space / text-size / radius token keys the base scales declare, at
 * an exact 16px = 1rem conversion — no key dropped, none invented, no
 * value drifting off its px source. Mirrors the density checks in
 * ./tokens.test.ts (constant assertions plus fs source assertions, since
 * vitest runs with css:false and the Linaria template text is not
 * observable at runtime).
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SPACING_DEFAULTS } from './spacing';
import { REM_RADII, REM_SPACE_OVERRIDES, REM_TEXT_SIZES, remDeclarations } from './zoom';

const tokenDir = path.dirname(fileURLToPath(import.meta.url));
const spacingSource = readFileSync(path.join(tokenDir, 'spacing.ts'), 'utf8');
const typographySource = readFileSync(path.join(tokenDir, 'typography.ts'), 'utf8');
const zoomSource = readFileSync(path.join(tokenDir, 'zoom.ts'), 'utf8');

const px = (value: string): number => Number.parseFloat(value);
const toRem = (value: string): string =>
  value.trim() === '0' ? '0' : `${px(value) / 16}rem`;

const REM_VALUE = /^(0|\d+(\.\d+)?rem)$/;

describe('REM_SPACE_OVERRIDES', () => {
  it('answers every default space step through the density indirection', () => {
    expect(Object.keys(REM_SPACE_OVERRIDES).sort()).toEqual(
      Object.keys(SPACING_DEFAULTS)
        .map((token) => token.replace('--haze-space-', '--haze-density-space-'))
        .sort()
    );
  });

  it('converts every step at an exact 16px = 1rem base', () => {
    for (const [token, value] of Object.entries(SPACING_DEFAULTS)) {
      expect(REM_SPACE_OVERRIDES[token.replace('--haze-space-', '--haze-density-space-') as keyof typeof REM_SPACE_OVERRIDES]).toBe(toRem(value));
    }
  });
});

describe('REM_TEXT_SIZES', () => {
  it('re-declares exactly the text-size tokens typography declares, in rem', () => {
    const declared = [...typographySource.matchAll(/(--haze-text-[a-z0-9]+):\s*([\d.]+)px;/g)];
    expect(declared).toHaveLength(7);
    expect(Object.keys(REM_TEXT_SIZES).sort()).toEqual(declared.map((m) => m[1]).sort());
    for (const m of declared) {
      expect(REM_TEXT_SIZES[m[1] as keyof typeof REM_TEXT_SIZES]).toBe(toRem(`${m[2]}px`));
    }
  });
});

describe('REM_RADII', () => {
  it('re-declares exactly the radius tokens spacing declares, in rem', () => {
    const declared = [...spacingSource.matchAll(/(--haze-radius-[a-z0-9]+):\s*([^;]+);/g)];
    expect(declared).toHaveLength(7);
    expect(Object.keys(REM_RADII).sort()).toEqual(declared.map((m) => m[1]).sort());
    for (const m of declared) {
      expect(REM_RADII[m[1] as keyof typeof REM_RADII]).toBe(toRem(m[2]!));
    }
  });
});

describe('remDeclarations', () => {
  it('emits exactly one declaration per re-declared token, all rem', () => {
    const declarations = remDeclarations().split('\n');
    expect(declarations).toHaveLength(
      Object.keys(REM_SPACE_OVERRIDES).length +
        Object.keys(REM_TEXT_SIZES).length +
        Object.keys(REM_RADII).length
    );
    for (const declaration of declarations) {
      expect(declaration).toMatch(/--haze-[a-z0-9-]+: (0|\d+(\.\d+)?rem);/);
    }
  });
});

describe('zoom.ts source (css template wiring and scope)', () => {
  it('interpolates remDeclarations() inside the remScale css template', () => {
    expect(zoomSource).toMatch(
      /export const remScale = css`[^`]*\$\{remDeclarations\(\)\}/
    );
  });

  it('re-declares no shadow token and no px value', () => {
    expect(zoomSource).not.toMatch(/--haze-shadow/);
    expect(zoomSource).not.toMatch(/'--haze-[a-z0-9-]+':\s*'[^']*px'/);
    for (const value of [...Object.values(REM_SPACE_OVERRIDES), ...Object.values(REM_TEXT_SIZES), ...Object.values(REM_RADII)]) {
      expect(value).toMatch(REM_VALUE);
    }
  });
});
