import { css } from '@linaria/core';

/**
 * PhoneInput skin — the joined-field rows composing the country Select
 * and the number InputCore into one attached control. The merge recipe
 * is InputGroup's (`& > *` seam and corner rules) inlined on purpose:
 * PhoneInput owns exactly two cells, so the generic cluster component
 * would be indirection without a consumer-facing win.
 */

export const root = css`
  display: block;
  inline-size: 100%;
`;

export const row = css`
  display: inline-flex;
  align-items: stretch;
  inline-size: 100%;

  /* The focused field's box-shadow ring must paint above the row —
   * z-index works on flex items even when statically positioned. */
  & > *:focus,
  & > *:focus-visible {
    z-index: var(--haze-z-local-1);
  }

  /* One 1px seam: the trailing cell pulls over the leading cell's
   * border and turns its own leading border transparent; corners merge
   * at each join. */
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

/* Wide enough for the longest dial codes ('+1 684') plus a short region
 * name, narrow enough to leave the number the room — space-12 × 2. */
export const countrySelect = css`
  flex: none;
  inline-size: calc(var(--haze-space-12) * 2);
  text-overflow: ellipsis;
`;

export const numberField = css`
  flex: 1;
  min-width: 0;
`;
