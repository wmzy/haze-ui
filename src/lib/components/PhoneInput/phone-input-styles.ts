import { css } from '@linaria/core';

import { attachedRowStretched } from '../../utils/seam-skin';

/**
 * PhoneInput skin — the joined-field rows composing the country Select
 * and the number InputCore into one attached control. The row is the
 * shared attached-row recipe (`utils/seam-skin.ts` `attachedRow` — the
 * -1px overlap seam, the positional corner rounding and the focus
 * z-lift) composed with the stretched row geometry
 * (`attachedRowStretched`, same module) into the single `row` class:
 * PhoneInput owns exactly two cells and never sets `data-orientation`,
 * so it rides the horizontal seam arms only.
 */

export const root = css`
  display: block;
  inline-size: 100%;
`;

/** The field row's one class: shared seam recipe + stretched row
 * geometry (utils/seam-skin `attachedRowStretched`). */
export const row = attachedRowStretched;

/* Wide enough for the longest dial codes ('+1 684') plus a short region
 * name, narrow enough to leave the number the room — space-12 × 2. */
export const countrySelect = css`
  flex: none;
  inline-size: calc(var(--haze-space-12) * 2);
  text-overflow: ellipsis;
`;
