import { css } from '@linaria/core';

import { attachedRow } from '../../utils/seam-skin';

/**
 * Shared InputGroup skin — the attached-field merging rules the group
 * wrapper wears, plus the addon classes `InputGroupAddon` applies.
 * Living in its own module keeps the component files free of style
 * internals (react-refresh boundary); split-css groups the emitted CSS
 * into `haze-ui/css/input-group.css`.
 *
 * ## Merging model
 *
 * The group wrapper wears the shared attached-row seam recipe
 * (`utils/seam-skin.ts` `attachedRow` — the -1px overlap seam, the
 * positional corner rounding and the focus z-lift) composed with the
 * local row geometry below into the single `group` class. Addons
 * therefore attach to `Input`/`Select`/`Button` children without
 * either side knowing about the other — the children render
 * as-authored.
 *
 * Sizing mirrors `InputCore`'s per-size paddings (see addonSizes), so
 * an addon and the field it hugs are the same height at every step.
 */

/** The row geometry — container declarations only; the seam, corner
 * and focus-lift arms live in utils/seam-skin. */
const groupBox = css`
  display: inline-flex;
  align-items: stretch;
  inline-size: 100%;
`;

/** The wrapper's one class: shared seam recipe + local geometry,
 * space-joined the way `x-class` would compose them. */
export const group = `${attachedRow} ${groupBox}`;

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
