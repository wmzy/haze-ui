import {css} from '@linaria/core';

/**
 * Table's boolean skin classes — exported so tests (and consumers)
 * can assert the ConfigProvider `Table.striped` / `Table.bordered`
 * tiers the same way Button's size map does. Sibling styles module
 * per the react-refresh boundary convention (Input `input-styles`
 * precedent); split-css groups the module with the Table family's css.
 */
export const stripedStyle = css`
  & tbody tr:nth-child(even) {
    background: var(--haze-color-bg-subtle);
  }
`;

export const borderedStyle = css`
  & th,
  & td {
    border: 1px solid var(--haze-color-border);
  }
`;
