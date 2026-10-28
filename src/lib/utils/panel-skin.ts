import { css } from '@linaria/core';

/**
 * Shared floating-panel chrome. Formerly the "Visual skin applied on
 * every rendering tier of the panel" recipe copy-pasted per overlay
 * component — a drift that already cost ColorPicker its forced-colors
 * border arm. Width bounds and padding stay call-site deltas (each
 * panel sizes itself); the surface itself is one class.
 *
 * The bare variant is the picker-panel subset (border + radius + bg +
 * shadow, no typography) Cascader/TreeSelect/date panels carry.
 *
 * Linaria CSS — every consumer family must be registered under
 * 'utils/panel-skin' in scripts/split-css.mjs `sharedLayers`.
 */

/** Full surface recipe: typography + border + elevation + FC border. */
export const panelSurface = css`
  box-sizing: border-box;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  box-shadow: var(--haze-shadow-lg);

  /* Forced-colors: the UA keeps the author border visible by forcing
     its color to CanvasText — restated so the panel stays separated
     from the Canvas behind it deterministically. */
  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

/** Bare surface: border + radius + bg + elevation, no typography. */
export const panelSurfaceBare = css`
  box-sizing: border-box;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);

  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

/**
 * Author display for a popover-tier panel must outrank the UA sheet's
 * closed-state rule — pinned here so every popover panel restates the
 * same contract (Cascader/TreeSelect precedent).
 */
export const popoverPanelHidden = css`
  &[popover]:not(:popover-open) {
    display: none;
  }
`;
