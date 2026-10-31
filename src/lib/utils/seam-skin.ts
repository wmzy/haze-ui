import { css } from '@linaria/core';

/**
 * Shared attached-row seam skin — the merging recipe a row of
 * border-carrying children wears to read as one control: ButtonGroup's
 * bar, InputGroup's field row, PhoneInput's country+number row. Only
 * the child-relative rules live here, plus the stretched-row geometry
 * plain rows share (`attachedRowStretched` below); consumers with a
 * genuinely different container (ButtonGroup's orientation-aware bar)
 * keep their own geometry as a local companion class, and the styles
 * modules ship the composed pair as their single exported class
 * (space-joined — the same string `x-class` would compose). The
 * classes ride with every consuming family's css via sharedLayers
 * (split-css.mjs).
 *
 * ## Merging model
 *
 * Adjacent children merge into one attached row with pure CSS — the
 * container never rewraps its children (they render as-authored):
 *
 * - every child except the first loses its leading edge: a -1px margin
 *   pulls it over the previous child's trailing border (two 1px borders
 *   collapse onto the same seam pixel) and the leading border turns
 *   transparent, so only the previous child's border ever paints the
 *   seam — deterministic no matter which sibling is hovered, because
 *   the two rules never touch the same element;
 * - every child except the last loses its trailing corner radii, so the
 *   row keeps the rounded profile of a single control at both ends.
 *
 * Orientation rides a `data-orientation` attribute on the wrapper: the
 * horizontal arms are gated with `:not([data-orientation='vertical'])`
 * and the vertical arms with `[data-orientation='vertical']`, so the
 * two branches are mutually exclusive (no cascade order is ever
 * load-bearing between them) and rows that never set the attribute
 * (InputGroup's, PhoneInput's) simply ride the horizontal seam.
 *
 * ## Focus lift
 *
 * The focus ring is a box-shadow — a trailing sibling would paint over
 * its seam edge, so any focused child lifts above the row (z-index
 * works on flex items even when statically positioned). `:focus` and
 * `:focus-visible` match as one arm so every focus mode clears the
 * seam, not just keyboard focus.
 */
export const attachedRow = css`
  & > *:focus,
  & > *:focus-visible {
    z-index: var(--haze-z-local-1);
  }

  /* Horizontal row: the seam runs on the inline axis. */
  &:not([data-orientation='vertical']) > *:not(:first-child) {
    margin-inline-start: -1px;
    border-inline-start-color: transparent;
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  &:not([data-orientation='vertical']) > *:not(:last-child) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  /* Vertical row: same recipe on the block axis. */
  &[data-orientation='vertical'] > *:not(:first-child) {
    margin-block-start: -1px;
    border-block-start-color: transparent;
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  &[data-orientation='vertical'] > *:not(:last-child) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
`;

/**
 * The row geometry every plain attached row wears: an inline-flex
 * strip of stretch-aligned children filling the container's inline
 * size (InputGroup's field row, PhoneInput's country+number row —
 * neither ever goes vertical). ButtonGroup keeps a local companion
 * instead: its bar adds the vertical flex-direction arm, a genuine
 * geometry difference rather than spelling drift.
 */
export const stretchedRow = css`
  display: inline-flex;
  align-items: stretch;
  inline-size: 100%;
`;

/** The default horizontal attached row: seam recipe + stretched-row
 * geometry, space-joined the way `x-class` would compose them. */
export const attachedRowStretched = `${attachedRow} ${stretchedRow}`;
