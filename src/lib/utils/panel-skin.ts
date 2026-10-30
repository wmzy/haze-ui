import { css } from '@linaria/core';

/**
 * Shared floating-panel chrome. Formerly the "Visual skin applied on
 * every rendering tier of the panel" recipe copy-pasted per overlay
 * component — a drift that already cost ColorPicker its forced-colors
 * border arm. Width bounds and padding stay call-site deltas (each
 * panel sizes itself); the surface itself is one class.
 *
 * The bare variant is the picker-panel subset (border + radius + bg +
 * shadow, no typography) Cascader/TreeSelect/date panels carry, and the
 * lifted variant is the modal tier (Dialog) — see panelSurfaceLifted.
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
 * Lifted surface: the modal-tier recipe one elevation step above
 * `panelSurface` — radius-xl + shadow-xl, borderless in normal mode (a
 * showModal panel sits in the top layer above every lg-tier popover,
 * so it takes the higher step instead of layering an override on the
 * lg chrome, which would resolve by stylesheet order and differ
 * between dev injection and the css split). The radius keeps Dialog's
 * component-token chain (`--haze-dialog-radius`) so per-component
 * retheming survives the move; any other consumer leaves the variable
 * unset and resolves to the xl step. Padding and width bounds stay
 * call-site deltas.
 */
export const panelSurfaceLifted = css`
  box-sizing: border-box;
  border: none;
  border-radius: var(--haze-dialog-radius, var(--haze-radius-xl));
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  box-shadow: var(--haze-shadow-xl);

  &:focus-visible {
    outline: none;
    box-shadow:
      var(--haze-shadow-xl),
      0 0 0 3px var(--haze-color-focus-ring);
  }

  /* Forced-colors: the panel's opaque background flattens onto Canvas
     and the surface declares border:none — an open modal would blend
     into the page. A CanvasText boundary separates the panel from the
     Canvas behind it (the box-shadow is dropped by the UA), and the
     squashed focus ring is replaced by a Highlight outline. */
  @media (forced-colors: active) {
    border: 1px solid CanvasText;

    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
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

/**
 * Trigger/panel pair host: the relative inline-flex wrapper every
 * floating pair (Popover/Tooltip/HoverCard/Popconfirm) anchors its
 * panel against — the four components wore it as identical local
 * two-declaration classes. Composition deltas (gap, display tweaks)
 * stay local with raised specificity if they must override.
 */
export const floatingPairHost = css`
  position: relative;
  display: inline-flex;
`;
