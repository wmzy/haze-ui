// Contract: Tooltip's bubble and Slider's value bubble interpolate the
// shared chip declarations (the nine-declaration surface and the
// forced-colors restatement) instead of re-declaring each side — the two
// had drifted into byte-identical copies that only differ in positioning.
//
// A source-text scan (no rendering — css is not processed in tests), the
// rest-forward.test.ts precedent.

import { readFileSync } from 'node:fs';

import {
  tooltipBubbleDeclarations,
  tooltipBubbleForcedColors,
} from './tooltip-bubble-skin';

const source = (file: string): string =>
  readFileSync(new URL(file, import.meta.url), 'utf8');

/** The two bubbles; each interpolates both strings in order. */
const BUBBLE_MODULES = [
  '../components/Tooltip/Tooltip.tsx',
  '../components/Slider/SliderCore.tsx',
] as const;

describe('tooltip-bubble-skin', () => {
  it('is a zero-CSS module: the declarations strings and no css call', () => {
    // A css call here would emit module CSS that no family registers —
    // split-css.mjs's sharedLayers refuses a zero-CSS key, and a module
    // that grows one silently stops shipping until it is registered.
    expect(source('./tooltip-bubble-skin.ts')).not.toContain('@linaria/core');
  });

  it('carries the chip surface and the forced-colors restatement', () => {
    expect(tooltipBubbleDeclarations.match(/;/g)).toHaveLength(9);
    expect(tooltipBubbleDeclarations).toContain(
      'background: var(--haze-color-text);',
    );
    expect(tooltipBubbleForcedColors).toContain(
      '@media (forced-colors: active) {',
    );
    expect(tooltipBubbleForcedColors).toContain(
      'border: 1px solid CanvasText;',
    );
  });

  it.each(BUBBLE_MODULES)(
    '%s interpolates both strings, surface before forced colors, and re-declares neither',
    (file) => {
      const text = source(file);
      const surfaceAt = text.indexOf('${tooltipBubbleDeclarations}');
      const forcedColorsAt = text.indexOf('${tooltipBubbleForcedColors}');
      // The forced-colors block restates background/color: inside the
      // same rule it must follow the surface declarations.
      expect(surfaceAt).toBeGreaterThanOrEqual(0);
      expect(forcedColorsAt).toBeGreaterThan(surfaceAt);
      expect(text).not.toContain('border: 1px solid CanvasText');
      expect(text).not.toContain('background: var(--haze-color-text);');
    },
  );
});
