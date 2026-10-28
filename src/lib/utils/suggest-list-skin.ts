import { css } from '@linaria/core';

/**
 * Shared suggestion-listbox skin — the anchored trigger-token panel
 * PromptInput and Mentions render over a textarea. The option trio
 * (row / keyboard highlight / non-selectable hint rows) and the panel
 * chrome were byte-identical copies in both components; the classes
 * ride with both families' css via sharedLayers (split-css.mjs).
 * Per-site deltas stay local: the height cap (PromptInput's is
 * token-overridable, Mentions' is a fixed cap) composes as a
 * companion class next to `suggestListbox`.
 */

/**
 * Panel chrome minus the height cap: scrolling, border, radius, surface
 * and shadow, layered under the tier-aware width cascade
 * (`pickerPanelWidth`, utils/picker-trigger.tsx — the fallback tier's
 * containing block is the textarea-width wrapper, so `100%` matches it,
 * while the anchored tier's containing block is the viewport-wide
 * position-area region, so the cascade's second declaration re-pins the
 * panel to the trigger's border-box width).
 */
export const suggestListbox = css`
  overflow-y: auto;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);
`;

/** A selectable suggestion row; hover/active preview the highlight. */
export const suggestOption = css`
  display: flex;
  align-items: center;
  padding: var(--haze-space-2) var(--haze-space-3);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  cursor: pointer;
  transition: background var(--haze-duration-fast);

  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  &:active {
    background: var(--haze-color-bg-muted);
  }
`;

/** The keyboard highlight on the aria-activedescendant target row. */
export const suggestOptionHighlighted = css`
  background: var(--haze-color-bg-subtle);
`;

/**
 * The non-selectable hint rows (loading / no match): they carry
 * role="option" to keep the listbox's required owned elements
 * satisfied while nothing is actually selectable.
 */
export const suggestHintRow = css`
  display: flex;
  align-items: center;
  padding: var(--haze-space-2) var(--haze-space-3);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
`;
