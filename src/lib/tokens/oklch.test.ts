/**
 * Cross-validation of the hand-rolled OKLCH math in ./oklch against culori
 * (the reference implementation for OKLab in the JS ecosystem). These tests
 * are the reason culori is a devDependency: if the zero-dependency math ever
 * drifts from the reference — a typo'd matrix coefficient, a wrong transfer
 * function — the contrast gate in contrast.test.ts would silently assert
 * against wrong numbers.
 */

import type {Oklch as CuloriOklch} from 'culori';
import type {Oklch} from './oklch';

import {oklch as toOklch, wcagContrast as culoriContrast} from 'culori';
import {expect} from 'vitest';

import {deltaE, formatOklch, oklchToHex, parseHex, parseOklch, wcagContrast} from './oklch';

/**
 * Corpus: every seed hex from the previous hand-tuned token system
 * (palette.ts SEEDS), the previous derived-state hexes the interaction
 * parameters reproduce, plus sRGB extremes, gamut edges and short/alpha
 * hex forms.
 */
const HEX_CORPUS: readonly string[] = [
  // Old light-mode seeds.
  '#ffffff', '#f7f8fa', '#eef0f4', '#e0e0e0', '#8a8a8a', '#4a4a4a', '#1a1a1a',
  '#0066ff', '#2563eb', '#16a34a', '#f59e0b', '#dc2626',
  // Old dark-mode seeds.
  '#121212', '#1e1e1e', '#2a2a2a', '#333333', '#707070', '#b0b0b0', '#e8e8e8',
  '#3b82f6', '#4d94ff', '#22c55e', '#fbbf24', '#ef4444',
  // Old derived-state hexes (primary hover/active/subtle, both modes).
  '#0052cc', '#003d99', '#e6f0ff', '#6aa6ff', '#80b3ff', '#1a2e4a',
  // Current green seed (contrast-fixed in a later wave).
  '#15803d',
  // Extremes and gamut edges.
  '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#808080', '#fed7aa', '#7c2d12', '#052e16', '#1e3a8a', '#fde68a',
  // Short (#rgb) and alpha (#rrggbbaa) forms.
  '#abc', '#9cf', '#0066ff80',
];

/** Parse with culori, failing loudly on inputs culori cannot handle. */
function culoriParsed(hex: string): CuloriOklch {
  // culori's converter returns null at runtime for unparseable input (its
  // types say undefined) — normalize both to a thrown error.
  const parsed: CuloriOklch | undefined = toOklch(hex) ?? undefined;
  if (parsed === undefined) {
    throw new Error(`culori failed to parse ${hex}`);
  }
  return parsed;
}

/**
 * Adapt a culori oklch color to our Oklch shape: culori leaves hue undefined
 * (or NaN) for achromatic colors, where our convention is h = 0.
 */
function asOurOklch(color: CuloriOklch): Oklch {
  const h = color.h;
  return {l: color.l, c: color.c, h: h !== undefined && Number.isFinite(h) ? h : 0};
}

describe('parseHex vs culori oklch()', () => {
  it.each(HEX_CORPUS)('parseHex(%s) matches culori within ΔE 0.01', (hex) => {
    const ours = parseHex(hex);
    const theirs = asOurOklch(culoriParsed(hex));
    expect(
      deltaE(ours, theirs),
      `${hex}: ours ${formatOklch(ours)} vs culori ${formatOklch(theirs)}`,
    ).toBeLessThan(0.01);
  });
});

describe('oklchToHex round-trip', () => {
  it.each(HEX_CORPUS)('%s survives a hex → oklch → hex cycle', (hex) => {
    const original = parseHex(hex);
    const once = oklchToHex(original);
    // One quantizing round-trip must stay perceptually identical to the source.
    expect(
      deltaE(parseHex(once), original),
      `${hex} → ${once}: ΔE ${deltaE(parseHex(once), original).toFixed(4)} ≥ 0.15`,
    ).toBeLessThan(0.15);
    // A second cycle is a fixed point: the conversion of an 8-bit value never
    // lands on a different 8-bit value.
    const twice = oklchToHex(parseHex(once));
    expect(twice, `${once} → ${twice}`).toBe(once);
  });
});

describe('wcagContrast vs culori wcagContrast()', () => {
  const PAIRS: readonly (readonly [string, string])[] = [
    // Extremes: 1:1 and the 21:1 ceiling.
    ['#ffffff', '#ffffff'],
    ['#000000', '#ffffff'],
    ['#000000', '#000000'],
    // Palette-relevant pairs.
    ['#0066ff', '#ffffff'],
    ['#0066ff', '#121212'],
    ['#f59e0b', '#ffffff'],
    ['#15803d', '#eef0f4'],
    ['#dc2626', '#1a1a1a'],
    ['#8a8a8a', '#ffffff'],
    ['#4d94ff', '#121212'],
    ['#e6f0ff', '#0052cc'],
  ];

  it.each(PAIRS)('wcagContrast(%s, %s) matches culori within 0.01', (foreground, background) => {
    const ours = wcagContrast(parseHex(foreground), parseHex(background));
    const theirs = culoriContrast(culoriParsed(foreground), culoriParsed(background));
    expect(
      Math.abs(ours - theirs),
      `ours ${ours.toFixed(4)} vs culori ${theirs.toFixed(4)}`,
    ).toBeLessThan(0.01);
  });
});

describe('formatOklch ∘ parseOklch idempotence', () => {
  const INPUTS: readonly string[] = [
    'oklch(0.585 0.199 262)',
    'oklch(62% 0.2 260 / 0.4)',
    'oklch(72.4% 0.12 155)',
    'oklch(0.7 0.1 30deg)',
  ];

  it.each(INPUTS)('%s formats to a stable canonical form', (input) => {
    const once = formatOklch(parseOklch(input));
    const twice = formatOklch(parseOklch(once));
    expect(twice, `${once} → ${twice}`).toBe(once);
  });

  it('normalizes percent lightness, deg hue and alpha to canonical decimals', () => {
    expect(formatOklch(parseOklch('oklch(62% 0.2 260 / 0.4)'))).toBe('oklch(0.620 0.200 260.0 / 0.400)');
    expect(formatOklch(parseOklch('oklch(0.7 0.1 30deg)'))).toBe('oklch(0.700 0.100 30.0)');
  });
});
