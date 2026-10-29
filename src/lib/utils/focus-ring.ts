import { css } from '@linaria/core';

/**
 * Shared keyboard focus ring — the `outline: none` + box-shadow ring
 * pair (and its forced-colors Highlight fallback) that 40+ component
 * files wore as byte-identical copies; drift had already begun
 * (TabBar's `--haze-space-1` width variant). Compose on interactive
 * elements: `x-class={[btn, focusRingVisible]}`.
 *
 * Scope: the pure `:focus-visible` shape. Field-flavored sites whose
 * focus arm also repaints the border (`:focus { border-color: primary;
 * box-shadow: … }`) compose `fieldFocusRing` from utils/field-skin.ts
 * instead; genuinely different indicators (pseudo-element thumbs,
 * glyph-specific forced-colors treatments) stay local.
 *
 * Per-site forced-colors deltas compose additively: a site needing
 * `outline-offset` keeps a local arm declaring only the offset.
 *
 * Linaria CSS — every consumer family must be registered under
 * 'utils/focus-ring' in scripts/split-css.mjs `sharedLayers`.
 */
export const focusRingVisible = css`
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);

    /* Forced-colors: the box-shadow ring is dropped by the UA — a
       Highlight outline replaces it. */
    @media (forced-colors: active) {
      outline: 2px solid Highlight;
    }
  }
`;
