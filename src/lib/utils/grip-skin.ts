import { css } from '@linaria/core';

/**
 * Shared resize-grip skin: the 24px hit strip (WCAG 2.5.8) carrying a
 * 2px hairline that Splitter's dividers and Resizable's handles both
 * wear — formerly two near-verbatim CSS triples. The bar paints only
 * the content box (background-clip) while the padded element keeps the
 * minimum target; hover and focus flood the whole strip with a subtle
 * wash and center a primary hairline, so the drag affordance reads
 * clearly without widening the grip. Coarse pointers get 44px
 * (WCAG 2.5.5).
 *
 * The strip relies on the default content-box sizing — border-box
 * would clamp it to the 2px hairline; see css-box-sizing.test.ts
 * REMOVED_FAMILIES (splitter).
 *
 * Both focus arms are declared because the two consumers focus
 * differently: Resizable's bar IS the separator (`:focus-visible`),
 * while Splitter's bar is an inert wrapper whose drag-handle child
 * carries focus (`:has(> :focus-visible)`). The non-matching arm is
 * inert for each consumer, so a single class serves both without
 * parameterizing the selector.
 *
 * Linaria CSS — every consumer family must be registered under
 * 'utils/grip-skin' in scripts/split-css.mjs `sharedLayers`.
 */

/** Grip chrome shared by both orientations: hairline + hover/focus
 * wash, focus ring and the forced-colors baseline. */
export const gripBase = css`
  flex: 0 0 auto;
  background: var(--haze-color-border);
  background-clip: content-box;
  transition: background var(--haze-duration-fast);

  &:hover,
  &:focus-visible,
  &:has(> :focus-visible) {
    background:
      linear-gradient(
          to right,
          transparent 0,
          var(--haze-color-primary) 50%,
          transparent 100%
        )
        center / 2px 100% no-repeat,
      var(--haze-color-bg-subtle);
  }

  &:focus-visible,
  &:has(> :focus-visible) {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--haze-color-focus-ring);
  }

  @media (forced-colors: active) {
    background: CanvasText;
    background-clip: content-box;

    &:hover,
    &:focus-visible,
    &:has(> :focus-visible) {
      background: Highlight;
      background-clip: content-box;
    }

    &:focus-visible,
    &:has(> :focus-visible) {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }
`;

/** Grip of a horizontally laid-out group: a vertical 2px hairline
 * (col-resize) whose hit strip pads inline. */
export const gripHorizontal = css`
  width: 2px;
  height: 100%;
  padding-inline: calc((var(--haze-space-6) - 2px) / 2);
  cursor: col-resize;

  @media (pointer: coarse) {
    padding-inline: calc((44px - 2px) / 2);
  }
`;

/** Grip of a vertically laid-out group: a horizontal 2px hairline
 * (row-resize) whose hit strip pads block. */
export const gripVertical = css`
  height: 2px;
  width: 100%;
  padding-block: calc((var(--haze-space-6) - 2px) / 2);
  cursor: row-resize;

  /* Horizontal grip: the centered hairline runs along the inline
   * axis, so the gradient is vertical. Declared after gripBase on
   * purpose — same-specificity source order lets this hover/focus
   * wash win over the base gradient. */
  &:hover,
  &:focus-visible,
  &:has(> :focus-visible) {
    background:
      linear-gradient(
          to bottom,
          transparent 0,
          var(--haze-color-primary) 50%,
          transparent 100%
        )
        center / 100% 2px no-repeat,
      var(--haze-color-bg-subtle);
  }

  @media (pointer: coarse) {
    padding-block: calc((44px - 2px) / 2);
  }
`;
