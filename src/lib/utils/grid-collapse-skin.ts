/**
 * Shared grid-row collapse — the `grid-template-rows: 1fr ↔ 0fr` height
 * animation Collapsible's content wrapper and FloatButtonGroup's
 * expand/collapse menu both run. The outer element is a single-row grid
 * whose track animates (no content-height knowledge needed); its one
 * structural child (`gridCollapseChild`) clips while shrinking.
 * `visibility` keeps collapsed content out of the tab order and the
 * accessibility tree through CSS alone: delayed by the full duration on
 * close so the collapse finishes first, immediate on open. Presence
 * drives the `data-state` both closed-state selectors key on.
 *
 * `ease` is the motion-token curve the caller animates with. The two
 * consumers keep their own on purpose: Collapsible's reveal is a
 * reversible state change (`--haze-ease-in-out`), the FloatButtonGroup
 * menu an overlay-style enter/exit (`--haze-ease`, the curve its item
 * transforms share). Both are tokens/motion.ts curves already —
 * unifying them would only retime one family's animation.
 *
 * Plain strings, not css classes: each consumer interpolates them into
 * its own Linaria class, so collapsible.css and float-button.css each
 * keep emitting their own rule and neither family inlines the other's
 * css (no sharedLayers entry). A shared css class would not do —
 * interpolating a css class inside a css template silently drops that
 * class's declarations. Pure function, zero runtime state.
 */

/** The collapsing grid row itself; `ease` is a timing-function token. */
export const gridCollapse = (ease: string): string => `
  display: grid;
  grid-template-rows: 1fr;
  transition:
    grid-template-rows var(--haze-duration-normal) ${ease},
    visibility 0s linear 0s;

  &[data-state='closed'] {
    grid-template-rows: 0fr;
    visibility: hidden;
    transition:
      grid-template-rows var(--haze-duration-normal) ${ease},
      visibility 0s linear var(--haze-duration-normal);
  }
`;

/** The grid's structural child: clips the content and may shrink below it. */
export const gridCollapseChild = `
  overflow: hidden;
  min-height: 0;
`;
