import { css } from '@linaria/core';

/**
 * Shared InputGroup skin — the attached-field merging rules the group
 * wrapper wears, plus the addon classes `InputGroupAddon` applies.
 * Living in its own module keeps the component files free of style
 * internals (react-refresh boundary); split-css groups the emitted CSS
 * into `haze-ui/css/input-group.css`.
 *
 * ## Merging model
 *
 * Same recipe as ButtonGroup, applied to a field row: every child
 * except the first loses its leading edge (a -1px margin pulls it over
 * the previous child's trailing border and its leading border turns
 * transparent, so exactly one 1px seam paints) and every child except
 * the last loses its trailing corner radii. Addons therefore attach to
 * `Input`/`Select`/`Button` children without either side knowing about
 * the other — the children render as-authored.
 *
 * Sizing mirrors `InputCore`'s per-size paddings (see addonSizes), so
 * an addon and the field it hugs are the same height at every step.
 */

export const group = css`
  display: inline-flex;
  align-items: stretch;
  inline-size: 100%;

  /* The field's focus ring is a box-shadow — a trailing sibling would
   * paint over its seam edge, so the focused child lifts above the row
   * (z-index works on flex items even when statically positioned). */
  & > *:focus,
  & > *:focus-visible {
    z-index: var(--haze-z-local-1);
  }

  & > *:not(:first-child) {
    margin-inline-start: -1px;
    border-inline-start-color: transparent;
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  & > *:not(:last-child) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
`;

/**
 * The addon surface: a tinted, bordered cell distinct from the field,
 * sized by its own paddings (addonSizes) so text/icons align with the
 * field's content box. Corner rounding is positional — the group's
 * merging rules keep the outer edges rounded and suppress the inner
 * ones, whatever side the addon sits on.
 */
export const addon = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  padding-inline: var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  background: var(--haze-color-bg-muted);
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-sans);
  line-height: var(--haze-leading-normal);
  white-space: nowrap;

  /* Forced-colors: the UA forces the author border back to CanvasText,
   * including the transparent seam side — the -1px overlap collapses
   * the pair onto one pixel, so the seam stays a single rule. */
  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

/**
 * Per-size addon paddings — byte-mirroring `InputCore`'s per-size
 * block paddings and font steps (not NumberInput's stepper sizes,
 * which serve a different frame), so addon and field heights match at
 * every step when the group's size flows to both.
 */
const addonSm = css`
  padding-block: var(--haze-space-1);
  font-size: var(--haze-text-sm);
`;

const addonMd = css`
  padding-block: var(--haze-space-2);
  font-size: var(--haze-text-sm);
`;

const addonLg = css`
  padding-block: var(--haze-space-3);
  font-size: var(--haze-text-base);
`;

export const addonSizes = {
  sm: addonSm,
  md: addonMd,
  lg: addonLg,
} as const;
