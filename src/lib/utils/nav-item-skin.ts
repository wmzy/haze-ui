import { css } from '@linaria/core';

/**
 * Shared navigation-item chrome for the two icon-nav item surfaces —
 * TabBar's TabBarItem (icon-over-label bottom bar) and ActivityRail's
 * ActivityRailItem (square icon rail item): the muted item base with
 * its hover wash and color/background transition, the fixed-size icon
 * slot, the corner badge anchor and the parameterized active skin —
 * formerly copy-pasted per component directory.
 *
 * What stays family-local (additive deltas composed after the shared
 * arms in the x-class array): each family's sizing/typography (TabBar's
 * label-under-icon column and track-filling flex; ActivityRail's 44px
 * square target), the indicator geometry (TabBar's top-edge bar vs
 * ActivityRail's rail-side pill), the active color pair — navItemActive
 * reads --haze-nav-item-active-color / --haze-nav-item-active-hover-bg,
 * set by each family's local active-token delta (TabBar the primary
 * pair, ActivityRail the text pair), so the arm structure is shared
 * while the tokens stay per-family — and TabBar's position: relative
 * anchor on the icon slot (its badge overlays the icon corner;
 * ActivityRail anchors the badge on the item itself). The keyboard
 * ring is not part of this skin: both families compose
 * utils/focus-ring's focusRingVisible.
 *
 * Merge-order contract (same as utils/menu-skins.ts): navItemBase is
 * authored before navItemActive so the active hover arm wins the
 * equal-specificity tie with the base hover wash — keep that order if
 * this module grows more arms.
 *
 * Same-key map rule: at most one css map per key set per module (the
 * Linaria display-name collision rule) — this module exports plain
 * class constants only, no variant maps; a second axis would go to a
 * sibling module (status-skin family precedent).
 *
 * RSC-safe: pure Linaria class constants — no hooks, no DOM access.
 * Imported by the RSC-safe TabBar, so the module is listed in
 * scripts/rsc-safe.mjs, and every consumer family must be registered
 * under 'utils/nav-item-skin' in scripts/split-css.mjs sharedLayers.
 */

/**
 * Item base: the muted icon-nav item — transparent surface, muted text,
 * the color/background transition and the hover wash (text color over a
 * bg-muted surface). Compose with each family's sizing delta and
 * focusRingVisible.
 */
export const navItemBase = css`
  box-sizing: border-box;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--haze-color-text-muted);
  cursor: pointer;
  transition:
    color var(--haze-duration-fast) var(--haze-ease),
    background var(--haze-duration-fast) var(--haze-ease);

  &:hover {
    color: var(--haze-color-text);
    background: var(--haze-color-bg-muted);
  }
`;

/**
 * Active skin, parameterized: pins the family's active color through
 * hover and swaps the hover wash, so the base hover arm cannot flash
 * the muted color back onto the current item. The two custom properties
 * are set by each family's local active-token delta (TabBar wears the
 * primary pair, ActivityRail the text pair); authored after navItemBase
 * so the hover arm wins the equal-specificity tie.
 */
export const navItemActive = css`
  color: var(--haze-nav-item-active-color);

  &:hover {
    color: var(--haze-nav-item-active-color);
    background: var(--haze-nav-item-active-hover-bg);
  }
`;

/**
 * Fixed-size icon slot: a space-5 square that centers its glyph and
 * sizes bare svg children to 100% — an svg without intrinsic
 * dimensions collapses inside flex.
 */
export const navItemIcon = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--haze-space-5);
  height: var(--haze-space-5);

  & > svg {
    width: 100%;
    height: 100%;
  }
`;

/**
 * Corner badge anchor: rides the icon slot (TabBar) or the item itself
 * (ActivityRail) at half a space-1 outset and stays out of pointer
 * hit-testing — the Badge underneath owns interaction.
 */
export const navItemBadge = css`
  position: absolute;
  inset-block-start: calc(var(--haze-space-1) / -2);
  inset-inline-end: calc(var(--haze-space-1) / -2);
  pointer-events: none;
`;
