import { css } from '@linaria/core';

/**
 * Shared skins for the three menu families (Menu, DropdownMenu,
 * ContextMenu) plus the option-item interaction states of the
 * menu-adjacent pickers (Cascader's column options, Command's palette
 * items): the item base skeleton, each family's interaction-state
 * skin, the item slot/variant skins (danger/icon/kbd/indicator/group
 * label), the panel surfaces and the divider — formerly copy-pasted per
 * component directory.
 *
 * Merge-order contract (same as the old per-directory item-styles
 * modules): skins are listed in each part's x-class array before the
 * consumer's slot class and className; `menuItemDanger` is authored
 * after the state skins so its hover/active overrides win on equal
 * specificity in every consuming stylesheet.
 *
 * The two interaction skins below are NOT interchangeable and preserve
 * each family's shipped behavior: the Menu family (resident list menu)
 * washes hover lighter than press and carries the keyboard focus ring;
 * the popup families (DropdownMenu, ContextMenu) keep rounded items and
 * their own hover/press order, deferring focus styling to the UA.
 */

/**
 * Core item skeleton shared by every item surface in the three
 * families: plain items, checkbox/radio items and submenu triggers.
 */
export const menuItemBase = css`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--haze-space-2) var(--haze-space-3);
  border: none;
  background: transparent;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  text-align: start;
  cursor: pointer;
  transition: background var(--haze-duration-fast);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Menu-family item states (MenuItem, MenuCheckboxItem, MenuRadioItem,
 * MenuSubTrigger): hover and the open submenu state share one wash,
 * press goes one step stronger, keyboard focus draws the inset ring.
 * The aria-expanded arm is live only on submenu triggers; the anchor
 * rules (text-decoration, aria-disabled) are live only on MenuItem
 * rendered as an anchor — a plain button has no UA underline to kill
 * and reports disabled through [disabled], so both stay inert there.
 */
export const menuItemStates = css`
  &:hover,
  &[aria-expanded='true'] {
    background: var(--haze-color-bg-subtle);
  }

  &:active {
    background: var(--haze-color-bg-muted);
  }

  &:focus-visible {
    outline: none;
    background: var(--haze-color-bg-subtle);
    box-shadow: inset 0 0 0 2px var(--haze-color-focus-ring);
  }

  /* anchor menuitems (MenuItem as='a') bring a UA underline; the item
   * skin owns text/underline. aria-disabled is the anchor-shaped
   * disabled (an anchor has no [disabled]). */
  text-decoration: none;

  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Forced-colors: the inset focus ring is a box-shadow — dropped by
     the UA — and the subtle background flattens onto Canvas, so the
     keyboard-focused item would vanish. An inset Highlight outline
     restores the focus indication. */
  @media (forced-colors: active) {
    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }
`;

/**
 * Popup-family item skin (DropdownMenu, ContextMenu and their item
 * types): rounded item corners and the popup hover/press wash order —
 * hover and the open submenu state share the stronger wash, press the
 * lighter one. The aria-expanded arm is live only on submenu triggers.
 */
export const menuPopupItem = css`
  border-radius: var(--haze-radius-sm);

  &:hover,
  &[aria-expanded='true'] {
    background: var(--haze-color-bg-muted);
  }

  &:active {
    background: var(--haze-color-bg-subtle);
  }
`;

/**
 * Option-item interaction states for the item surfaces outside the
 * three menu families — Cascader's column options and Command's
 * palette items. The plain trio those two shipped verbatim twice:
 * hover washes subtle, press one step stronger, keyboard focus draws
 * the inset ring. Authored as state arms of the class itself (the
 * `pickerNativeSelect` contract) so consumer deltas — which keep the
 * padding/radius/typography differences — can never flip them by
 * injection order: the arms out-specify any unconditional local
 * declaration. Unlike `menuItemStates` there is no aria-expanded arm
 * (Cascader's in-path decoration rides its own class), no anchor
 * handling and no forced-colors restatement — this is exactly the two
 * consumers' shipped trio, nothing more.
 */
export const menuOptionStates = css`
  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  &:active {
    background: var(--haze-color-bg-muted);
  }

  &:focus-visible {
    outline: none;
    background: var(--haze-color-bg-subtle);
    box-shadow: inset 0 0 0 2px var(--haze-color-focus-ring);
  }
`;

/**
 * Submenu-trigger affordance: an inline-end chevron pushed to the
 * item's end, mirrored under dir='rtl'.
 */
export const menuChevron = css`
  &::after {
    content: '›';
    margin-inline-start: auto;
    color: var(--haze-color-text-muted);
  }

  [dir='rtl'] &::after {
    content: '‹';
  }
`;

/**
 * Danger skin for destructive actions: danger-colored text with a
 * danger-subtle interaction background. Authored after the state skins
 * so it overrides their hover/active on equal specificity.
 */
export const menuItemDanger = css`
  color: var(--haze-color-danger);

  &:hover,
  &:active {
    background: var(--haze-color-danger-subtle);
  }
`;

/**
 * Inline-start icon slot. The slot sizes bare svg children to 1em —
 * an svg without intrinsic dimensions collapses to 0x0 inside flex.
 */
export const menuItemIcon = css`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  margin-inline-end: var(--haze-space-2);

  & svg {
    width: 1em;
    height: 1em;
  }
`;

/**
 * Inline-end shortcut hint (e.g. '⌘C'): muted, monospaced, pushed to
 * the item's inline end.
 */
export const menuItemKbd = css`
  margin-inline-start: auto;
  padding-inline-start: var(--haze-space-3);
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
`;

/**
 * Fixed-size state indicator box (check/dot) for checkbox and radio
 * items: reserves its square whether or not the glyph renders, so
 * labels align across mixed items.
 */
export const menuItemIndicator = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  margin-inline-end: var(--haze-space-2);
`;

/** Group wrapper box: a plain block section container. Shared by the
 * Group and RadioGroup parts of the Menu and DropdownMenu families
 * (each family used to carry its own local copy of this class). */
export const menuGroup = css`
  display: block;
`;

/** Group heading: muted, one step smaller than item text. Shared by the
 * Group and RadioGroup parts of all three families. */
export const menuGroupLabel = css`
  padding: var(--haze-space-2) var(--haze-space-3) var(--haze-space-1);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-muted);
`;

/**
 * Popup panel surface (DropdownMenuContent, DropdownMenuSubContent,
 * ContextMenuContent): radius-md / shadow-md elevation over the page.
 */
export const menuPanel = css`
  /* min-width pairs with padding + border: border-box keeps the floor
   * covering the padding too (panel-family box-sizing contract). */
  box-sizing: border-box;
  min-width: 10rem;
  padding: var(--haze-space-1);
  background: var(--haze-color-bg);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  box-shadow: var(--haze-shadow-md);

  /* Forced-colors: the UA keeps the author border visible by forcing
     its color to CanvasText — restated so the panel stays separated
     from the Canvas behind it deterministically. */
  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

/**
 * Menu-family panel surface (Menu's own panel and MenuSubContent):
 * the larger radius-lg / shadow-lg elevation, vertical-only panel
 * padding and the themeable width floor. The floor is a size custom
 * property consumed with a fallback — Drawer's --haze-drawer-width
 * precedent — so an inline style or a classNames.panel rule setting
 * --haze-menu-min-width resizes the panel without fighting the skin.
 */
export const menuPanelLg = css`
  /* min-width pairs with padding + border: border-box keeps the floor
   * covering the padding too (panel-family box-sizing contract). */
  box-sizing: border-box;
  min-width: var(--haze-menu-min-width, 160px);
  padding: var(--haze-space-1) 0;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);

  /* Forced-colors: CanvasText boundary restated (see menuPanel). */
  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

/** Separator between menu sections, shared by the three families. */
export const menuDivider = css`
  height: 1px;
  margin: var(--haze-space-1) 0;
  background: var(--haze-color-border);
`;
