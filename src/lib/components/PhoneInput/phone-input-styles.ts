import { css } from '@linaria/core';

import { attachedRow } from '../../utils/seam-skin';

/**
 * PhoneInput skin — the joined-field rows composing the country Select
 * and the number InputCore into one attached control. The merge recipe
 * is the shared attached-row seam skin (`utils/seam-skin.ts`
 * `attachedRow` — the -1px overlap seam, the positional corner rounding
 * and the focus z-lift) composed with the local row geometry into the
 * single `row` class: PhoneInput owns exactly two cells and never sets
 * `data-orientation`, so it rides the horizontal seam arms only.
 */

export const root = css`
  display: block;
  inline-size: 100%;
`;

/** The row geometry — container declarations only; the seam, corner
 * and focus-lift arms live in utils/seam-skin. */
const rowBox = css`
  display: inline-flex;
  align-items: stretch;
  inline-size: 100%;
`;

/** The field row's one class: shared seam recipe + local geometry,
 * space-joined the way `x-class` would compose them. */
export const row = `${attachedRow} ${rowBox}`;

/* Wide enough for the longest dial codes ('+1 684') plus a short region
 * name, narrow enough to leave the number the room — space-12 × 2. */
export const countrySelect = css`
  flex: none;
  inline-size: calc(var(--haze-space-12) * 2);
  text-overflow: ellipsis;
`;
