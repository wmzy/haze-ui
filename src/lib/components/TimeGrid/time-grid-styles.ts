import {css} from '@linaria/core';

/**
 * Shared TimeGrid skin — the slot-picker chrome (group grid and the
 * per-slot button in its idle and selected states) the `TimeGrid`
 * component wears. Living in its own module keeps the component file
 * free of style internals (react-refresh boundary); split-css groups
 * the emitted CSS into `haze-ui/css/time-grid.css`. The grid's column
 * count is layout data (the `columns` prop) and rides the root as an
 * inline `grid-template-columns`, not a class.
 */

export const timeGridBase = css`
  display: grid;
  gap: var(--haze-space-1);
  font-family: var(--haze-font-sans);
`;

export const timeGridButton = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-bg-subtle);
  color: var(--haze-color-text-secondary);
  font-family: inherit;
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  font-variant-numeric: tabular-nums;
  padding: var(--haze-space-1) var(--haze-space-2);
  /* WCAG 2.5.8 target-size floor. */
  min-height: var(--haze-space-6);
  min-width: var(--haze-space-16);
  cursor: pointer;
  transition:
    background var(--haze-duration-fast),
    border-color var(--haze-duration-fast),
    color var(--haze-duration-fast);

  &:hover:not(:disabled) {
    background: var(--haze-color-bg-muted);
    border-color: var(--haze-color-border-hover);
    color: var(--haze-color-text);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--haze-color-focus-ring);
  }

  /* Forced-colors: subtle-on-subtle squares flatten onto Canvas. The
     Windows-native Highlight chip renders the selection; an inset
     CanvasText hairline bounds the rest, and keyboard focus upgrades
     to the Highlight ring. */
  @media (forced-colors: active) {
    outline: 1px solid CanvasText;
    outline-offset: -1px;

    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }
`;

/** The checked slot — must follow `timeGridButton` in the class list. */
export const timeGridButtonSelected = css`
  background: var(--haze-color-primary);
  border-color: var(--haze-color-primary);
  color: var(--haze-color-text-inverse);

  &:hover:not(:disabled) {
    background: var(--haze-color-primary-hover);
    border-color: var(--haze-color-primary-hover);
    color: var(--haze-color-text-inverse);
  }

  @media (forced-colors: active) {
    background: Highlight;
    border-color: Highlight;
    color: HighlightText;
  }
`;
