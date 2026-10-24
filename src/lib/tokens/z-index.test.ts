/*
 * Z-index token contract: the stacking ladder in ./z-index is the single
 * truth for every layered surface's paint order.
 *
 * vitest runs with css:false, so the Linaria template text is not
 * observable at runtime. The emitted declarations are therefore asserted
 * through zIndexDeclarations() — the exact function the spacing css
 * template interpolates and Linaria evaluates at build time
 * (spacingDeclarations precedent) — plus source-level checks that the
 * template actually interpolates it and that no non-test source under
 * src/lib declares a literal z-index anymore (the hardcode-zero contract;
 * fs source assertions follow the tokens.test.ts / rest-forward.test.tsx
 * precedent).
 */

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOKEN_REGISTRY } from './registry';
import { Z_INDEX_TOKENS, zIndexDeclarations } from './z-index';

const LADDER_NAMES = Z_INDEX_TOKENS.map((token) => token.name);

describe('Z_INDEX_TOKENS (stacking ladder)', () => {
  it('defines the six tiers, ascending through the ladder', () => {
    expect(LADDER_NAMES).toEqual([
      '--haze-z-local-1',
      '--haze-z-local-2',
      '--haze-z-local-3',
      '--haze-z-overlay',
      '--haze-z-overlay-fallback',
      '--haze-z-toast',
    ]);
  });

  it('keeps every higher tier strictly above the one before it', () => {
    const values = Z_INDEX_TOKENS.map((token) => Number(token.value));
    const ascending = values.every(
      (value, i) => i === 0 || value > values[i - 1]!
    );
    expect(ascending).toBe(true);
  });

  it('declares plain positive integers only', () => {
    for (const token of Z_INDEX_TOKENS) {
      expect(token.value).toMatch(/^\d+$/);
    }
  });
});

describe('zIndexDeclarations (single truth)', () => {
  it('emits one declaration per tier carrying the ladder value', () => {
    const declarations = zIndexDeclarations();
    for (const token of Z_INDEX_TOKENS) {
      expect(declarations).toContain(`${token.name}: ${token.value};`);
    }
  });

  it('emits exactly one declaration per tier', () => {
    expect(zIndexDeclarations().split('\n')).toHaveLength(LADDER_NAMES.length);
  });
});

describe('TOKEN_REGISTRY (z-index registration)', () => {
  it('registers every ladder tier exactly once with matching values', () => {
    for (const token of Z_INDEX_TOKENS) {
      const entries = TOKEN_REGISTRY.filter(
        (entry) => entry.name === token.name
      );
      expect(entries).toHaveLength(1);
      const entry = entries[0];
      if (!entry) throw new Error(`unregistered z-index token ${token.name}`);
      expect(entry).toMatchObject({
        category: 'z-index',
        type: 'number',
        light: token.value,
        dark: token.value,
      });
    }
  });

  it('registers no z-index tokens beyond the ladder', () => {
    const registered = TOKEN_REGISTRY.filter(
      (entry) => entry.category === 'z-index'
    ).map((entry) => entry.name);
    expect([...registered].sort()).toEqual([...LADDER_NAMES].sort());
  });
});

describe('source wiring (spacing template + hardcode-zero contract)', () => {
  const tokensDir = path.dirname(fileURLToPath(import.meta.url));
  const libDir = path.resolve(tokensDir, '..');
  const spacingSource = readFileSync(path.join(tokensDir, 'spacing.ts'), 'utf8');

  it('interpolates zIndexDeclarations() inside the spacing css template', () => {
    expect(spacingSource).toMatch(
      /export const spacing = css`[^`]*\$\{zIndexDeclarations\(\)\}/
    );
  });

  /** Non-test lib sources (comments stripped) keyed by src/lib-relative path. */
  const libSources = collectSources(libDir);

  it('declares no literal z-index outside the token system', () => {
    const offenders: string[] = [];
    for (const {rel, code} of libSources) {
      for (const match of code.matchAll(/z-index\s*:\s*([^;}]+)/g)) {
        const value = match[1]!.trim();
        if (!value.includes('var(--haze-z-')) {
          offenders.push(`${rel}: z-index: ${value}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('references only ladder tokens in var(--haze-z-*) usages', () => {
    const used = new Set<string>();
    for (const {code} of libSources) {
      for (const match of code.matchAll(/var\((--haze-z-[a-z0-9-]+)/g)) {
        used.add(match[1]!);
      }
    }
    expect([...used].sort()).toEqual([...new Set(LADDER_NAMES)].sort());
  });
});

/** Walk a directory for non-test .ts/.tsx sources with comments stripped. */
function collectSources(root: string): {rel: string; code: string}[] {
  const files: {rel: string; code: string}[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (
        /\.(ts|tsx)$/.test(entry.name) &&
        !/\.test\.(ts|tsx)$/.test(entry.name)
      ) {
        files.push({
          rel: path.relative(root, full).replaceAll('\\', '/'),
          code: stripComments(readFileSync(full, 'utf8')),
        });
      }
    }
  };
  walk(root);
  return files;
}

/**
 * Drop block comments and line comments. A `//` directly preceded by `:`
 * (a URL scheme) is not a comment and survives.
 */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '');
}
