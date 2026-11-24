// Contract: every skin that owns a keyboard-ring arm interpolates the shared
// strings (the box-shadow ring AND its forced-colors Highlight fallback)
// instead of hand-copying the ring. Each hand-copied arm had dropped the
// fallback, which left the control with no focus indicator under forced
// colors (the UA drops the box-shadow ring).
//
// Two shapes, one source: an arm wearing the standard pair interpolates the
// whole declarations string; an arm painting a box-shadow of another shape
// (a wrapper's :focus-within ring, an inset ring, a ring layered on an
// elevation shadow) interpolates the fallback alone, after its own ring.
//
// A source-text scan (no rendering — css is not processed in tests), the
// rest-forward.test.ts precedent.

import { readFileSync } from 'node:fs';

import {
  focusRingDeclarations,
  focusRingForcedColors,
} from './focus-ring-delta';

const source = (file: string): string =>
  readFileSync(new URL(file, import.meta.url), 'utf8');

/** Every module owning a standard-pair ring arm; each wears the shared
 * declarations and keeps no literal ring (field-skin excepted below). */
const RING_ARM_MODULES = [
  './focus-ring.ts',
  './quiet-button-skin.ts',
  './preset-list-skin.ts',
  './timeline-skin.ts',
  './picker-trigger.tsx',
  // pickerFieldInput, pickerFieldInputSm and fieldFocusRing.
  './field-skin.ts',
  // valueInput and numberInput.
  '../components/ColorPicker/color-picker-styles.ts',
] as const;

/** Every module whose ring arm keeps a box-shadow of another shape and
 * interpolates only the forced-colors fallback, after its own ring. */
const FALLBACK_ARM_MODULES = [
  // focusWithinRing — the wrapper :focus-within ring.
  './field-skin.ts',
  // field — the segmented group's :focus-within ring.
  './segmented-field.tsx',
  // columnList — the inset ring on the scrolling option list.
  '../components/TimePicker/time-picker-styles.ts',
  // card — the ring layered on the elevation shadow.
  '../components/Tour/Tour.tsx',
] as const;

const RING = 'box-shadow: 0 0 0 3px var(--haze-color-focus-ring)';

/** The css template an interpolation marker sits in: from the nearest
 * preceding `css` call up to the marker (empty when absent). */
const templateUpTo = (text: string, marker: string): string => {
  const at = text.indexOf(marker);
  return at < 0 ? '' : text.slice(text.lastIndexOf('css`', at), at);
};

describe('focus-ring-delta', () => {
  it('is a zero-CSS module: the declarations strings and no css call', () => {
    // A css call here would emit module CSS that no family registers —
    // split-css.mjs's sharedLayers refuses a zero-CSS key, and a module
    // that grows one silently stops shipping until it is registered.
    expect(source('./focus-ring-delta.ts')).not.toContain('@linaria/core');
  });

  it('carries the ring, and builds on the standalone forced-colors fallback', () => {
    expect(focusRingDeclarations).toContain(RING);
    expect(focusRingForcedColors).not.toContain(RING);
    expect(focusRingForcedColors).not.toMatch(/box-shadow:/);
    expect(focusRingForcedColors).toMatch(
      /@media \(forced-colors: active\) {\s*outline: 2px solid Highlight;/,
    );
    // One source: the pair's fallback IS the standalone string, so an
    // arm wearing either shape gets the same forced-colors outline.
    expect(focusRingDeclarations.endsWith(focusRingForcedColors)).toBe(true);
  });

  it.each(RING_ARM_MODULES)(
    '%s interpolates the declarations and hand-copies no ring',
    (file) => {
      const text = source(file);
      expect(text).toContain('${focusRingDeclarations}');
      // field-skin keeps two literal rings, each covered below; every
      // other ring-arm module keeps none.
      const literalRings = text.split(RING).length - 1;
      expect(literalRings).toBe(file === './field-skin.ts' ? 2 : 0);
    },
  );

  it('keeps both literal rings of field-skin under a forced-colors fallback', () => {
    const text = source('./field-skin.ts');
    // focusWithinRing — the wrapper arm, in FALLBACK_ARM_MODULES — and
    // nativeFieldChrome (Input/Textarea), the one inline arm sanctioned
    // to carry its own forced-colors block.
    expect(templateUpTo(text, '${focusRingForcedColors}')).toContain(RING);
    expect(text).toMatch(
      /@media \(forced-colors: active\) {\s*border-color: CanvasText;\s*&:focus {\s*outline: 2px solid Highlight;/,
    );
  });

  it.each(FALLBACK_ARM_MODULES)(
    '%s interpolates the fallback after the ring its own template paints',
    (file) => {
      const arm = templateUpTo(source(file), '${focusRingForcedColors}');
      // The block restates `outline`: it is appended inside the arm's
      // template, behind that template's own ring — never ahead of it.
      expect(arm).not.toBe('');
      expect(arm).toContain('0 0 0 3px var(--haze-color-focus-ring)');
    },
  );
});
