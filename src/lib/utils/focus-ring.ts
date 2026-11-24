import { css } from '@linaria/core';

import { focusRingDeclarations } from './focus-ring-delta';

/**
 * Shared keyboard focus ring — the `outline: none` + box-shadow ring
 * pair (and its forced-colors Highlight fallback) that 40+ component
 * files wore as byte-identical copies; drift had already begun
 * (TabBar's `--haze-space-1` width variant). Compose on interactive
 * elements: `x-class={[btn, focusRingVisible]}`.
 *
 * The arm's body is utils/focus-ring-delta's declarations string — the
 * same source the skins that own a ring arm of their own interpolate
 * (quiet-button-skin, preset-list-skin, timeline-skin, picker-trigger),
 * so the pair and its fallback cannot drift apart again.
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
${focusRingDeclarations}
  }
`;

/**
 * Outline-only focus indicator — the bare `:focus-visible` outline
 * arm that five families (Schedule, Upload, JsonView, Splitter, Toast)
 * wore as byte-identical copies. Compose where the box-shadow ring
 * would repaint the surface (dense grids, overlaid glyphs) or where
 * the site already paints its own box-shadow:
 * `x-class={[cell, outlineFocusVisible]}`.
 *
 * Per-site extras (UploadList's focus-reveal `opacity`, any
 * `outline-offset`) stay local as additive arms — they don't conflict
 * with the outline declaration, so rule order never matters.
 *
 * No forced-colors arm on purpose: the incumbent sites never declared
 * one and forced-colors already forces outlines to system colors.
 *
 * Linaria CSS — every consumer family must be registered under
 * 'utils/focus-ring' in scripts/split-css.mjs `sharedLayers`.
 */
export const outlineFocusVisible = css`
  &:focus-visible {
    outline: 2px solid var(--haze-color-focus-ring);
  }
`;
