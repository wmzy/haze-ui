/**
 * The tooltip-bubble surface as declarations strings — the dark chip
 * Tooltip's bubble and Slider's value bubble both paint: the
 * padding/radius shell, the text-token fill with inverse ink, the
 * sans/xs/normal typography, the single-line clamp and the
 * pointer-through, plus the forced-colors restatement. Two strings
 * because a bubble interleaves its own behavior between them (Slider's
 * data-state reveal sits after the surface and before the forced-colors
 * block), and the forced-colors block must stay after the surface
 * declarations of the same rule — it restates background/color.
 *
 * Each side interpolates the strings into its own class and keeps what
 * is genuinely its own: Tooltip's placement and animated lifecycle ride
 * utils/floating's panel classes composed at the call site; Slider's
 * absolute anchoring, data-state reveal and transition stay in
 * SliderCore. Neither side ships a shadow or an arrow, and no visible
 * token differs between them.
 *
 * Plain strings in a module with NO `css` call, on purpose.
 * Interpolating a `css` class instead silently drops its declarations
 * (the ColorPicker thumbRing note). And because this module emits no
 * CSS of its own, no css family gains the other's rules — there is no
 * sharedLayers entry for it in scripts/split-css.mjs (registering a
 * zero-CSS key trips the "emitted no module CSS" guard).
 *
 * Pure constants with zero imports — RSC-safe by construction; nothing
 * on scripts/rsc-safe.mjs's list imports them.
 */

/** The surface, the typography and the pointer-through single line. */
export const tooltipBubbleDeclarations = `
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-text);
  color: var(--haze-color-text-inverse);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  line-height: var(--haze-leading-normal);
  white-space: nowrap;
  pointer-events: none;
`;

/**
 * Forced-colors restatement: the dark bubble and its inverse text
 * flatten onto Canvas/CanvasText — the tooltip would float as
 * unbounded text. The Windows-native shape renders instead: Canvas
 * background, CanvasText text, CanvasText boundary.
 */
export const tooltipBubbleForcedColors = `
  @media (forced-colors: active) {
    background: Canvas;
    color: CanvasText;
    border: 1px solid CanvasText;
  }
`;
