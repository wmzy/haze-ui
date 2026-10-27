import { css } from '@linaria/core';

/**
 * Shared preset shortcut rows (SelectFloating's option-row style):
 * full-width quiet rows on the panel's list surface, a hairline
 * separating them from the calendar(s) below. Formerly copy-pasted
 * between DatepickerCore and DateRangePickerCore.
 */

/** The shortcut block heading a picker panel. */
export const presetList = css`
  display: flex;
  flex-direction: column;
  padding-block: var(--haze-space-1) 0;
  margin-block-end: var(--haze-space-2);
  border-block-end: 1px solid var(--haze-color-border);
`;

/** One shortcut row: quiet until hovered, pressed or focused. */
export const presetRow = css`
  display: flex;
  align-items: center;
  width: 100%;
  appearance: none;
  border: none;
  background: transparent;
  padding: var(--haze-space-1) var(--haze-space-3);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  cursor: pointer;
  text-align: start;

  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  &:active {
    background: var(--haze-color-bg-muted);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;
