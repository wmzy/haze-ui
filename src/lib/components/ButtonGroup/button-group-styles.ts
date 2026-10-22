import { css } from '@linaria/core';

/**
 * Shared ButtonGroup skin — the attached-bar merging rules the group
 * wrapper wears, plus the divider classes `ButtonGroupSeparator`
 * applies. Living in its own module keeps the component files free of
 * style internals (react-refresh boundary); split-css groups the
 * emitted CSS into `haze-ui/css/button-group.css`.
 *
 * ## Merging model
 *
 * Adjacent buttons merge into one bar with pure CSS — the group never
 * rewraps its children (real `Button` elements render as-authored):
 *
 * - every child except the first loses its leading edge: a -1px margin
 *   pulls it over the previous child's trailing border (two 1px borders
 *   collapse onto the same seam pixel) and the leading border turns
 *   transparent, so only the previous child's border ever paints the
 *   seam — deterministic no matter which sibling is hovered, because
 *   the two rules never touch the same element;
 * - every child except the last loses its trailing corner radii, so the
 *   bar keeps the rounded profile of a single button at both ends;
 * - `role='separator'` children ride the same -1px pull: a 1px rule
 *   lands exactly on the seam pixel it replaces.
 *
 * Orientation rides a `data-orientation` attribute on the wrapper. The
 * `:not([data-orientation='vertical'])` / `[data-orientation='vertical']`
 * branches are mutually exclusive, so no cascade order is ever
 * load-bearing between them.
 */

export const group = css`
  display: inline-flex;
  align-items: stretch;

  /* The focus ring is a box-shadow — later siblings would paint over
   * its seam edge, so a focused button lifts above the row (z-index
   * works on flex items even when statically positioned). */
  & > *:focus-visible {
    z-index: 1;
  }

  /* Horizontal bar: the seam runs on the inline axis. */
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

  /* Vertical bar: same recipe on the block axis, cross-sized buttons. */
  &[data-orientation='vertical'] {
    flex-direction: column;
  }

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

  /* Dividers size with the bar's cross axis and never shrink it. The
   * concrete rule/glyph classes live on the separator element itself
   * (see separatorBase below) because whether a rule or a glyph renders
   * is component state, not group state. */
  & > [data-slot='separator'] {
    flex: none;
    align-self: stretch;
  }
`;

/** Shared divider chassis: centred content, takes no bar space beyond
 * its own box. The 1px rule mode and the glyph mode both start here. */
export const separatorBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

/** Rule mode inside a horizontal bar: a vertical rule, inset from the
 * button edges so it reads as a divider, not a broken border. */
export const separatorRule = css`
  inline-size: 1px;
  margin-block: var(--haze-space-1);
  background: var(--haze-color-border);
`;

/** Rule mode inside a vertical bar: the rule runs horizontally. */
export const separatorRuleHorizontal = css`
  inline-size: auto;
  block-size: 1px;
  margin-block: 0;
  margin-inline: var(--haze-space-1);
`;

/** Glyph mode: the divider is its children (an icon, a short "or"
 * label). Sits between the merged buttons as its own cell. */
export const separatorIcon = css`
  padding-inline: var(--haze-space-1);
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-tight);
  white-space: nowrap;
`;

/** Solid-bar ink: on a primary-colored field the border-colored rule
 * would vanish, so the seam turns inverse with a dimmed opacity. */
export const separatorInverse = css`
  background: var(--haze-color-text-inverse);
  opacity: 0.35;
`;

/** Glyph-mode counterpart of the inverse rule. */
export const separatorIconInverse = css`
  color: var(--haze-color-text-inverse);
  opacity: 0.8;
`;
