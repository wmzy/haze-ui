/**
 * The keyboard focus ring as declarations strings — the body of a
 * `:focus-visible` (or `:focus`) arm, split in two:
 * `focusRingDeclarations` is the whole body (the `outline: none` + 3px
 * box-shadow pair AND its forced-colors Highlight fallback);
 * `focusRingForcedColors` is the fallback alone, for an arm whose ring
 * is not the standard pair.
 *
 * One source for the pair and the fallback: the ring had been
 * hand-copied arm by arm (focusRingVisible in utils/focus-ring.ts, and
 * the skins that own a ring arm of their own — quiet-button-skin,
 * preset-list-skin, timeline-skin, picker-trigger, field-skin's leaf
 * arms, ColorPicker's text/number inputs), and every copy outside
 * focus-ring.ts had dropped the fallback, which left those controls
 * with no focus indicator under forced colors (the UA drops the
 * box-shadow ring).
 *
 * A skin interpolates `focusRingDeclarations` into its own arm and
 * keeps what is genuinely its own next to it:
 *
 *   &:focus-visible {
 * ${focusRingDeclarations}
 *     border-color: var(--haze-color-primary);
 *   }
 *
 * Per-site extras stay additive and outside the string — a border
 * repaint (`border-color`, the picker flavor), an `outline-offset`, a
 * transition. The fallback mirrors its arm's trigger: an arm on
 * `:focus` (picker-trigger's native select and search input) shows the
 * Highlight outline on every focus, exactly as it shows the ring.
 *
 * `focusRingForcedColors` alone is for an arm that paints a box-shadow
 * of another shape and must keep it — a wrapper's `:focus-within` ring
 * (field-skin's focusWithinRing, segmented-field's field), an inset
 * ring (time-picker-styles' columnList), a ring layered on an
 * elevation shadow (Tour's card). The arm interpolates only the
 * fallback, after its own declarations:
 *
 *   &:focus-within {
 *     border-color: var(--haze-color-primary);
 *     box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
 * ${focusRingForcedColors}
 *   }
 *
 * The block restates `outline`, so it must follow any `outline: none`
 * of the same rule. The wrapper form is for a field whose FOCUSED
 * element is a chromeless inner control (`outline: none` — field-skin's
 * fieldBareInner, a local reset, an sr-only native input): the UA
 * outline cannot stand in for the dropped ring there, so the wrapper
 * wears the Highlight outline exactly as it wears the ring.
 *
 * Plain strings in a module with NO `css` call, on purpose.
 * Interpolating a `css` class instead silently drops its declarations
 * (the ColorPicker thumbRing note). And because this module emits no
 * CSS of its own, the declarations land inside each consumer's class:
 * no css family gains focus-ring's classes, and there is no
 * sharedLayers entry for it in scripts/split-css.mjs (registering a
 * zero-CSS key trips the "emitted no module CSS" guard).
 *
 * Pure constants with zero imports. They are consumed only inside css
 * templates, so Linaria evaluates them at build time and no module of
 * theirs reaches dist — RSC-neutral by construction, and deliberately
 * absent from scripts/rsc-safe.mjs (that list requires a dist module;
 * its RSC-listed importers — focus-ring, timeline-skin, preset-list-skin,
 * field-skin, disclosure-skin — never import them at runtime).
 */

/**
 * The forced-colors fallback alone: under forced colors the UA drops
 * the box-shadow ring, so a Highlight outline replaces it.
 */
export const focusRingForcedColors = `  /* Forced-colors: the box-shadow ring is dropped by the UA — a
     Highlight outline replaces it. */
  @media (forced-colors: active) {
    outline: 2px solid Highlight;
  }
`;

/** The whole ring body: the `outline: none` + box-shadow pair, then
 * {@link focusRingForcedColors}. */
export const focusRingDeclarations = `
  outline: none;
  box-shadow: 0 0 0 3px var(--haze-color-focus-ring);

${focusRingForcedColors}`;
