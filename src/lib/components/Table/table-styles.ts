import {css} from '@linaria/core';

/**
 * Table's shared table-element classes — exported so tests (and
 * consumers) can assert the ConfigProvider `Table.striped` /
 * `Table.bordered` tiers the same way Button's size map does. Sibling
 * styles module per the react-refresh boundary convention (Input
 * `input-styles` precedent); split-css groups the module with the
 * Table family's css.
 */

/** The `<table>` base every table element wears: full-width collapsed
 * borders plus the body typography trio. DataTable composes it on its
 * sibling header/row tables too — the data-table css family already
 * depends on table.css (its Table part imports), so the class rides
 * along via the css-manifest dependency closure. */
export const baseStyle = css`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
`;

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
