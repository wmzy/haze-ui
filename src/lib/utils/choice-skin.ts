import { css } from '@linaria/core';

/**
 * Shared skins for the choice inputs (Checkbox, Radio): the 24px box
 * geometry (space-6 box + space-1 margin — the WCAG 2.5.8 target-size
 * floor, with the 32px optical footprint of the old 18px+14px pairing),
 * the idle/hover/focus-visible/disabled chrome, the forced-colors
 * baseline and the label base — formerly copy-pasted per component
 * directory.
 *
 * What deliberately stays local per component and composes via x-class
 * after `choiceBase`: the border-radius (Checkbox sm vs Radio full) and
 * every :checked decoration — the checkmark vs the dot plus their
 * forced-colors arms. No selector's declarations are split across the
 * shared and local classes, so the pair stays immune to stylesheet
 * emission-order flips between dev and dist.
 */
export const choiceBase = css`
  appearance: none;
  width: var(--haze-space-6);
  height: var(--haze-space-6);
  border: 1px solid var(--haze-color-border);
  background: var(--haze-color-bg);
  cursor: pointer;
  margin: var(--haze-space-1);
  transition:
    background var(--haze-duration-fast),
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);
  flex-shrink: 0;
  position: relative;

  &:hover {
    border-color: var(--haze-color-border-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Forced-colors baseline: the box keeps a CanvasText boundary and
     disabled boxes drop the dim and render GrayText; the box-shadow
     focus ring is dropped by the UA — a Highlight outline replaces it.
     The :checked/::after arms ride with each component's local skin. */
  @media (forced-colors: active) {
    border-color: CanvasText;

    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 1;
      border-color: GrayText;
    }
  }
`;

/**
 * Label base shared by the choice inputs: the inline row with the
 * space-2 input-to-text gap. Typography stays per component
 * (Checkbox's bare label vs Radio's sm text chrome) and composes via
 * x-class after this base.
 */
export const choiceLabel = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  cursor: pointer;
`;
