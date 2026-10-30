/* Calendar's Linaria classes — extracted verbatim from Calendar.tsx
 * (wave-6). One css module for the whole family: the component file and
 * the grid renderers (grids.tsx) share every class here, so no bare
 * class declaration is ever split across modules (dev CSS injection
 * order and the dist split disagree; only same-file rules may cascade).
 * Sibling of Calendar.tsx — split-css groups this dir into the
 * 'calendar' family automatically.
 *
 * No keyboard focus ring lives here: headerBtn/titleBtn/dayBtn wear
 * focusRingVisible (utils/focus-ring.ts) composed at their x-class
 * sites in Calendar.tsx and grids.tsx. */
import { css } from '@linaria/core';

export const calendarWrapper = css`
  padding: var(--haze-space-3);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
`;

export const header = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--haze-space-2);
  margin-block-end: var(--haze-space-2);
`;

export const headerBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  color: var(--haze-color-text);
  cursor: pointer;
  padding: var(--haze-space-1);
  border-radius: var(--haze-radius-sm);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  line-height: 1;

  &:hover {
    background: var(--haze-color-bg-subtle);
  }
`;

export const headerTitle = css`
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
`;

/* The date-mode header carries two drill-down titles (month and year);
   they sit inline in the header's center slot, ordered per the locale's
   own month/year part order. */
export const headerTitles = css`
  display: inline-flex;
  align-items: baseline;
  gap: var(--haze-space-1);
`;

/* The month title doubles as the quick-select trigger. Inheriting the
   font longhands and zeroing padding keeps the button's box identical to
   the plain span it replaced, so the default rendering is visually
   unchanged; headerTitle keeps owning weight and color. */
export const titleBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  margin: 0;
  padding: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  cursor: pointer;
  border-radius: var(--haze-radius-sm);

  &:hover {
    background: var(--haze-color-bg-subtle);
  }
`;

export const headerTrailing = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
`;

export const grid = css`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  text-align: center;
`;

/* Rows and cells participate in the parent grid through `display: contents`
   so the 7-column layout stays driven by the grid container while the ARIA
   tree gets the row → columnheader/gridcell structure `role="grid"`
   requires (axe aria-required-children). */
export const rowContents = css`
  display: contents;
`;

export const cellContents = css`
  display: contents;
`;

export const weekday = css`
  padding: var(--haze-space-1);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
`;

export const weekNumber = css`
  padding: var(--haze-space-2);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
`;

/* Week mode: the row label of the selected week picks up the primary
   color to match the filled day cells beside it. */
export const weekNumberSelected = css`
  color: var(--haze-color-primary);
  font-weight: var(--haze-weight-medium);
`;

/* cellRender slot: stacks the custom content under the day number.
   Only mounted when a cellRender is provided, so default cells keep
   their plain text-only content. */
export const dayContent = css`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--haze-space-1);
`;

export const dayBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  color: var(--haze-color-text);
  cursor: pointer;
  padding: var(--haze-space-2);
  border-radius: var(--haze-radius-sm);
  font-size: var(--haze-text-sm);
  line-height: 1.5;
  transition: background var(--haze-duration-fast) var(--haze-ease);

  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const daySelected = css`
  background: var(--haze-color-primary);
  color: var(--haze-color-text-inverse);

  &:hover {
    background: var(--haze-color-primary-hover);
  }
`;

export const dayInRange = css`
  background: var(--haze-color-primary-subtle);
`;

export const dayOutside = css`
  color: var(--haze-color-text-muted);
`;

/* Two-grid layout (months={2}): panes sit side by side, each keeping the
   header + grid column structure of the single-month calendar. */
export const monthPanels = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-4);
`;

export const monthPanel = css`
  display: flex;
  flex-direction: column;
`;

/* Static label above the second pane — centered like pane 1's title
   sits between its nav buttons. */
export const paneHeader = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--haze-space-2);
  margin-block-end: var(--haze-space-2);
`;

/* Quick-select view: shared year toolbar above a 3×4 month grid. */
export const quickSelect = css`
  display: flex;
  flex-direction: column;
`;

export const quickToolbar = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--haze-space-2);
  margin-block-end: var(--haze-space-2);
`;

export const quickGrid = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  text-align: center;
`;

/* Quarter picker grid: one row of four quarter cells (same cell
   chrome as the month grid, one column per quarter). */
export const quarterGrid = css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  text-align: center;
`;
