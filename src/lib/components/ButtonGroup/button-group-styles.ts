import { css } from '@linaria/core';

import { attachedRow } from '../../utils/seam-skin';

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
 * rewraps its children (real `Button` elements render as-authored).
 * The seam, corner and focus-lift arms are the shared attached-row
 * recipe (`utils/seam-skin.ts` `attachedRow`), composed with the local
 * bar geometry below into the single `group` class; `role='separator'`
 * children ride the same -1px pull: a 1px rule lands exactly on the
 * seam pixel it replaces.
 *
 * Orientation rides a `data-orientation` attribute on the wrapper; the
 * seam skin's orientation branches are mutually exclusive (see its
 * header).
 */

/** The bar geometry — container declarations only: the inline stretch
 * box, the vertical column flip and the separator cross-sizing. The
 * seam, corner and focus-lift arms live in utils/seam-skin. */
const groupBox = css`
  display: inline-flex;
  align-items: stretch;

  /* Vertical bar: cross-sized buttons down the block axis. */
  &[data-orientation='vertical'] {
    flex-direction: column;
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

/** The wrapper's one class: shared seam recipe + local bar geometry,
 * space-joined the way `x-class` would compose them. */
export const group = `${attachedRow} ${groupBox}`;

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
