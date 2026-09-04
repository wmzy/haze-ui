/**
 * Build-time WCAG contrast gate for the OKLCH token system.
 *
 * Every ratio below is computed from SEMANTIC_COLOR_TOKENS resolved values,
 * so the gate runs in CI (`pnpm test`) — palette regressions fail the build
 * upstream of what axe can only catch on already-rendered pages.
 *
 * The math itself is cross-validated against culori in oklch.test.ts.
 */

import type {Mode} from './palette';
import type {Oklch} from './oklch';

import {expect} from 'vitest';

import {clampChroma, formatOklch, wcagContrast} from './oklch';
import {SEMANTIC_COLOR_TOKENS} from './palette';
import {TOKEN_REGISTRY} from './registry';

const MODES: readonly Mode[] = ['light', 'dark'];
const SURFACES: readonly string[] = ['bg', 'bg-subtle', 'bg-muted'];

const TOKENS_BY_NAME = new Map(SEMANTIC_COLOR_TOKENS.map((token) => [token.name, token]));

/** Resolve a semantic token by its short name ('text', 'primary-subtle', …). */
function resolve(name: string, mode: Mode): Oklch {
  const token = TOKENS_BY_NAME.get(`--haze-color-${name}`);
  if (token === undefined) {
    throw new Error(`Unknown color token: --haze-color-${name}`);
  }
  return token.resolved[mode];
}

function contrast(foreground: string, background: string, mode: Mode): number {
  return wcagContrast(resolve(foreground, mode), resolve(background, mode));
}

/** Assert a pair clears its floor with a message naming the pair and ratio. */
function expectContrastAtLeast(foreground: string, background: string, mode: Mode, floor: number) {
  const ratio = contrast(foreground, background, mode);
  expect(
    ratio,
    `${foreground} on ${background} (${mode}): computed ${ratio.toFixed(3)} < floor ${floor}`,
  ).toBeGreaterThanOrEqual(floor);
}

describe('body text contrast (WCAG AA, 4.5:1)', () => {
  it.each(
    MODES.flatMap((mode) =>
      ['text', 'text-secondary'].flatMap((foreground) =>
        SURFACES.map((background) => ({background, foreground, mode})),
      ),
    ),
  )('$foreground on $background ($mode)', ({background, foreground, mode}) => {
    expectContrastAtLeast(foreground, background, mode, 4.5);
  });
});

describe('muted text contrast (3.0:1)', () => {
  // text-muted carries placeholder/decorative copy only, so it is held to the
  // 3:1 floor rather than AA body-text 4.5. The gray-9 seed carries a small
  // lightness nudge (TEXT_MUTED_ADJUST) specifically to clear this floor on
  // bg-muted in both modes — before the nudge light mode measured 3.026.
  it.each(MODES.flatMap((mode) => SURFACES.map((background) => ({background, mode}))))(
    'text-muted on $background ($mode)',
    ({background, mode}) => {
      expectContrastAtLeast('text-muted', background, mode, 3.0);
    },
  );
});

describe('inverse text on solid status fills (WCAG AA, 4.5:1)', () => {
  // warning is excluded: it is never used as a solid fill under inverse text,
  // and amber physically cannot carry white text at 4.5:1 anyway (see the
  // amber bound comment in the subtle-ratchet table below).
  const FILLS: readonly string[] = ['primary', 'success', 'danger', 'info'];

  it.each(MODES.flatMap((mode) => FILLS.map((fill) => ({fill, mode}))))(
    'text-inverse on $fill ($mode)',
    ({fill, mode}) => {
      expectContrastAtLeast('text-inverse', fill, mode, 4.5);
    },
  );
});

describe('primary as link/anchor text (WCAG AA, 4.5:1)', () => {
  it.each(MODES)('primary on bg (%s)', (mode) => {
    expectContrastAtLeast('primary', 'bg', mode, 4.5);
  });
});

describe('status color on its own subtle background (ratchet floors)', () => {
  // Ratchet floors, not uniform WCAG floors: each floor is the Wave-1
  // measured ratio minus 0.15 headroom, pinning every pair to (at least)
  // what the palette delivers today. Any palette change that drops a pair
  // below its floor — e.g. a seed swap that lightens a status color — fails
  // the build and forces a conscious decision about the accessibility
  // trade-off. Improvements only ratchet these numbers up.
  //
  // The amber bound: warning can never reach 4.5:1 on its own subtle
  // background in light mode. Subtle tints sit at l = 0.945 (≈ #f2f3f5) and
  // even pure-seed amber #f59e0b on pure white only reaches 2.15:1 —
  // darkening amber far enough to pass 4.5 on a near-white tint would leave
  // the amber hue family entirely and stop reading as "warning". Hence the
  // 1.7 floor (measured 1.82) for light mode, while dark-mode amber on its
  // dark tint comfortably clears 9:1.
  const SUBTLE_FLOORS: readonly {dark: number; light: number; status: string}[] = [
    {dark: 5.05, light: 4.0, status: 'primary'},
    {dark: 6.5, light: 4.15, status: 'success'},
    {dark: 4.1, light: 3.95, status: 'danger'},
    {dark: 4.1, light: 4.25, status: 'info'},
    {dark: 9.2, light: 1.7, status: 'warning'},
  ];

  it.each(SUBTLE_FLOORS.flatMap(({status, ...floors}) => MODES.map((mode) => ({floor: floors[mode], mode, status}))))(
    '$status on $status-subtle ($mode) ≥ $floor',
    ({floor, mode, status}) => {
      expectContrastAtLeast(status, `${status}-subtle`, mode, floor);
    },
  );
});

describe('derived-token formula parity (DERIVED_PARAMS math)', () => {
  type DerivedKind = 'hover' | 'active' | 'subtle' | 'border-hover' | 'focus-ring';

  // Mirror of DERIVED_PARAMS / FOCUS_RING_ALPHA from palette.ts (not
  // exported). If palette.ts changes a parameter, these tests fail until the
  // mirror is updated — that is the point: the emitted CSS formulas and the
  // TS resolved values can never silently diverge.
  const DERIVED_PARAMS: Record<Mode, {active: number; borderHover: number; hover: number; subtleC: number; subtleL: number}> = {
    light: {active: -0.09, borderHover: -0.09, hover: -0.045, subtleC: 0.2, subtleL: 0.945},
    dark: {active: 0.09, borderHover: 0.08, hover: 0.05, subtleC: 0.35, subtleL: 0.26},
  };
  const FOCUS_RING_ALPHA = 0.4;

  function kindOf(name: string): DerivedKind | null {
    if (name.endsWith('-focus-ring')) return 'focus-ring';
    if (name.endsWith('-border-hover')) return 'border-hover';
    if (name.endsWith('-hover')) return 'hover';
    if (name.endsWith('-active')) return 'active';
    if (name.endsWith('-subtle')) return 'subtle';
    return null;
  }

  /** Same ops the emitted CSS relative-color formula performs. */
  function expectedDerived(mode: Mode, base: Oklch, kind: DerivedKind): Oklch {
    const params = DERIVED_PARAMS[mode];
    switch (kind) {
      case 'hover':
        return clampChroma({l: base.l + params.hover, c: base.c, h: base.h});
      case 'active':
        return clampChroma({l: base.l + params.active, c: base.c, h: base.h});
      case 'subtle':
        return clampChroma({l: params.subtleL, c: base.c * params.subtleC, h: base.h});
      case 'border-hover':
        return clampChroma({l: base.l + params.borderHover, c: base.c, h: base.h});
      case 'focus-ring':
        return {l: base.l, c: base.c, h: base.h, alpha: FOCUS_RING_ALPHA};
    }
  }

  // Derived tokens are the ones emitted as relative-color formulas; aliases
  // reference a primitive var() instead.
  const DERIVED_TOKENS = SEMANTIC_COLOR_TOKENS.filter((token) => token.css.light.startsWith('oklch(from'));

  it('the derived set is exactly the -hover/-active/-subtle/border-hover/focus-ring tokens', () => {
    // bg-subtle matches the -subtle suffix but is a primitive alias (gray-2),
    // not a relative-color formula — everything else suffix-shaped is derived.
    const bySuffix = SEMANTIC_COLOR_TOKENS.filter(
      (token) => kindOf(token.name) !== null && token.name !== '--haze-color-bg-subtle',
    ).map((token) => token.name);
    expect(
      DERIVED_TOKENS.map((token) => token.name),
      'name-suffix-derived set ≠ css-formula-derived set',
    ).toEqual(bySuffix);
  });

  it.each(
    DERIVED_TOKENS.flatMap((token) => {
      const kind = kindOf(token.name);
      if (kind === null) {
        throw new Error(`Derived token ${token.name} has no recognized suffix`);
      }
      return MODES.map((mode) => ({kind, mode, name: token.name}));
    }),
  )('$name ($mode) resolved matches DERIVED_PARAMS applied to its base', ({kind, mode, name}) => {
    const token = TOKENS_BY_NAME.get(name);
    if (token === undefined) {
      throw new Error(`Unknown color token: ${name}`);
    }
    // The formula must be wired to the base token the parity math uses.
    // border-hover strips only '-hover' (its base is --haze-color-border);
    // focus-ring is derived from primary per palette.ts, which its name
    // does not encode.
    const marker = kind === 'border-hover' ? '-hover' : `-${kind}`;
    const baseName = kind === 'focus-ring' ? '--haze-color-primary' : name.slice(0, name.length - marker.length);
    const base = TOKENS_BY_NAME.get(baseName);
    if (base === undefined) {
      throw new Error(`Derived token ${name} has no base token ${baseName}`);
    }
    expect(token.css[mode], `${name} (${mode}) css formula is not based on ${baseName}`).toContain(
      `var(${baseName})`,
    );

    const expected = expectedDerived(mode, base.resolved[mode], kind);
    const resolved = token.resolved[mode];
    expect(resolved.l, `${name} (${mode}) l`).toBeCloseTo(expected.l, 9);
    expect(resolved.c, `${name} (${mode}) c`).toBeCloseTo(expected.c, 9);
    expect(resolved.h, `${name} (${mode}) h`).toBeCloseTo(expected.h, 9);
    expect(resolved.alpha, `${name} (${mode}) alpha`).toBe(expected.alpha);
  });
});

describe('registry consistency (TOKEN_REGISTRY ↔ SEMANTIC_COLOR_TOKENS)', () => {
  const registryColors = TOKEN_REGISTRY.filter((entry) => entry.category === 'color');

  it('color name sets match exactly', () => {
    expect(
      registryColors.map((entry) => entry.name).sort(),
      'TOKEN_REGISTRY color entries ≠ SEMANTIC_COLOR_TOKENS names',
    ).toEqual([...SEMANTIC_COLOR_TOKENS.map((token) => token.name)].sort());
  });

  it.each(SEMANTIC_COLOR_TOKENS)('$name registry strings equal formatOklch(resolved)', (token) => {
    const entry = registryColors.find((candidate) => candidate.name === token.name);
    if (entry === undefined) {
      throw new Error(`${token.name} missing from TOKEN_REGISTRY color entries`);
    }
    expect(entry.light, `${token.name} light`).toBe(formatOklch(token.resolved.light));
    expect(entry.dark, `${token.name} dark`).toBe(formatOklch(token.resolved.dark));
  });
});
