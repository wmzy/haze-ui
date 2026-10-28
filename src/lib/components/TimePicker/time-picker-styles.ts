/**
 * Linaria classes for the TimePicker panel form (TimePicker.tsx /
 * TimePickerPanel.tsx). Lives in a sibling file — component files only
 * export components and types (react-refresh/only-export-components).
 */

import { css } from '@linaria/core';

import { classnames } from '../../utils/classnames';
import { pickerFieldInput } from '../../utils/field-skin';
import { panelSurfaceBare, popoverPanelHidden } from '../../utils/panel-skin';

export const wrapper = css`
  position: relative;
  display: inline-block;
`;

/* Trigger deltas over the shared picker field skin
   (utils/field-skin.ts): the readonly combobox sizes like a full-width
   block field, shows the pointer cursor a picker trigger earns, and
   keeps its figures tabular so the panel's columns align on focus.
   `trigger` composes the shared class ahead of these — additive
   properties only, both classes riding the time-picker family css
   through the sharedLayers registration. */
const triggerDeltas = css`
  display: block;
  width: 100%;
  line-height: var(--haze-leading-normal);
  cursor: pointer;
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--haze-color-text-muted);
  }
`;

/** Readonly trigger input — the shared picker field skin plus the
 * deltas above. */
export const trigger = classnames(pickerFieldInput, triggerDeltas);

/* Panel chrome deltas over the shared bare panel surface
   (utils/panel-skin.ts): the column layout and its inset. */
const panelDeltas = css`
  display: flex;
  flex-direction: column;
  padding: var(--haze-space-2);
`;

/** Panel visual skin applied on every rendering tier — the shared bare
 * panel surface plus the deltas above. `popoverPanelHidden` restates
 * the UA closed-state hiding because `panelDeltas`' author `display`
 * would otherwise outrank the UA sheet and paint the closed popover
 * as an invisible hit-targetable box (Cascader/TreeSelect precedent). */
export const panel = classnames(panelSurfaceBare, popoverPanelHidden, panelDeltas);

export const columns = css`
  display: flex;
  gap: var(--haze-space-1);
`;

/**
 * One column frame: fixed height (7 option rows), the highlight band
 * behind the center row, and the scrolling list on top of it. The band
 * is where a committed selection scrolls to, so it stays put while the
 * list moves under it.
 */
export const columnWrap = css`
  position: relative;
  flex: 1;
  min-width: var(--haze-space-12);
  height: calc(var(--haze-space-8) * 7);

  &::before {
    content: '';
    position: absolute;
    inset-inline: var(--haze-space-1);
    /* One option row tall, vertically centered. */
    top: calc(50% - var(--haze-space-8) / 2);
    height: var(--haze-space-8);
    border-radius: var(--haze-radius-sm);
    background: var(--haze-color-bg-subtle);
    pointer-events: none;
  }
`;

/**
 * The scrolling option list. Padding of three rows lets the first and
 * last options center in the band like every other row. Positioned
 * above the wrap's ::before band.
 */
export const columnList = css`
  position: relative;
  z-index: var(--haze-z-local-1);
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  overscroll-behavior: contain;
  padding-block: calc(var(--haze-space-8) * 3);
  outline: none;

  &:focus-visible {
    box-shadow: inset 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

export const columnOption = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--haze-space-8);
  border-radius: var(--haze-radius-sm);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  font-variant-numeric: tabular-nums;
  cursor: pointer;

  &:hover {
    background: var(--haze-color-bg-subtle);
  }
`;

export const columnOptionSelected = css`
  color: var(--haze-color-primary);
  font-weight: var(--haze-weight-medium);
`;

export const columnOptionDisabled = css`
  color: var(--haze-color-text-muted);
  cursor: not-allowed;

  &:hover {
    background: transparent;
  }
`;

/** Panel footer: the "Now" action row. */
export const footer = css`
  display: flex;
  justify-content: flex-end;
  margin-block-start: var(--haze-space-2);
`;

export const nowButton = css`
  appearance: none;
  border: none;
  background: transparent;
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-sm);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-primary);
  cursor: pointer;

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
