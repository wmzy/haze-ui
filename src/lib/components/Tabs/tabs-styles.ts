import type { TabsVariant } from './TabsContext';

import { css } from '@linaria/core';

/**
 * Shared Tabs variant chrome — the per-variant strip and tab classes
 * `TabList` / `Tab` wear (the `variant` declared once on `<Tabs>` rides
 * the context). Living in their own module keeps the component files
 * free of style internals (react-refresh boundary) and lets the two
 * maps ship as public constants (`tabVariants` / `listVariants`, the
 * shadcn `buttonVariants` precedent) for consumers composing custom
 * strips that still match the design system; split-css groups the
 * emitted CSS into `haze-ui/css/tabs.css` with them.
 */

/* ─── line (default): the classic underline strip ─────────────────── */

/** Line chrome: the transparent 2px underline slot (the selection
 * fills it) overlapping the strip's separator by its own 1px — the
 * active underline reads as piercing the rule. */
const lineTab = css`
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
`;

const lineTabActive = css`
  color: var(--haze-color-primary);
  border-bottom-color: var(--haze-color-primary);

  /* Forced-colors: the primary underline and text flatten onto
     CanvasText — the selected tab would be indistinguishable.
     The Windows-native selection renders instead: a Highlight
     chip with HighlightText content. The aria-selected arm raises
     specificity above Tab's base background reset: a media query
     does not, and dev-server CSS injection order puts the sibling
     styles module before Tab.tsx (dist order is the reverse — the
     bare class wins in one world and loses in the other). */
  @media (forced-colors: active) {
    &[aria-selected='true'] {
      background: Highlight;
      color: HighlightText;
      border-bottom-color: Highlight;
    }
  }
`;

/* ─── card: flat antd-style cards ─────────────────────────────────── */

/** Card chrome: a transparent full border reserves the selected card's
 * stroke (border-box — activating never reflows the row), rounded top
 * corners where the card would meet the panel below. */
const cardTab = css`
  border: 1px solid transparent;
  border-radius: var(--haze-radius-md) var(--haze-radius-md) var(--haze-radius-none) var(--haze-radius-none);

  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  /* Forced-colors: a transparent border does not survive — an inset
     1px CanvasText outline bounds each card (keyboard focus still
     upgrades to the base class's Highlight ring). */
  @media (forced-colors: active) {
    outline: 1px solid CanvasText;
    outline-offset: -1px;
  }
`;

/** The raised flat card: the selection signal is the tab's own surface
 * + stroke, not an underline (the strip carries no separator in this
 * variant). */
const cardTabActive = css`
  background: var(--haze-color-bg);
  border-color: var(--haze-color-border);
  color: var(--haze-color-text);

  /* Forced-colors: the bg-surface selection flattens to Canvas — the
     Windows-native Highlight chip renders instead. The aria-selected
     arm outranks Tab's base background reset regardless of CSS
     emission order (see the lineTabActive note). */
  @media (forced-colors: active) {
    &[aria-selected='true'] {
      background: Highlight;
      color: HighlightText;
      border-color: Highlight;
    }
  }
`;

/* ─── pill: the Segmented-style capsule ───────────────────────────── */

/** Pill chrome: fully rounded tabs riding in the strip's muted trough
 * (the pill strip skin paints the trough). */
const pillTab = css`
  border-radius: var(--haze-radius-full);

  /* Forced-colors: an unselected pill is a transparent no-border
     button — an inset 1px CanvasText outline bounds it inside the
     trough (the Segmented button precedent). */
  @media (forced-colors: active) {
    outline: 1px solid CanvasText;
    outline-offset: -1px;
  }
`;

/** The lifted capsule — mirrors SegmentedCore's active segment: onto
 * the bg surface with the small elevation shadow. */
const pillTabActive = css`
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  box-shadow: var(--haze-shadow-sm);

  /* Forced-colors: the white-on-muted selection flattens with the
     shadow dropped — the Windows-native Highlight chip renders
     instead. The aria-selected arm outranks Tab's base background
     reset regardless of CSS emission order (see the lineTabActive
     note). */
  @media (forced-colors: active) {
    &[aria-selected='true'] {
      background: Highlight;
      color: HighlightText;
    }
  }
`;

/** Per-variant skin pair — `idle` rides every tab of the variant,
 * `active` only the selected one (after the shared active floor). */
export const tabVariants: Record<TabsVariant, { idle: string; active: string }> = {
  line: { idle: lineTab, active: lineTabActive },
  card: { idle: cardTab, active: cardTabActive },
  pill: { idle: pillTab, active: pillTabActive },
};

/** Per-variant strip chrome — the tabs carry the matching skins (see
 * `tabVariants`). `variant` rides the Tabs context. */
export const listVariants: Record<TabsVariant, string> = {
  /* line: the classic underline strip — the full-width separator the
   * active tab's underline pierces (Tab overlaps it by -1px). */
  line: css`
    border-bottom: 1px solid var(--haze-color-border);
  `,
  /* card: flat cards with breathing room — no strip separator; the
   * selected tab's own surface + stroke is the selection signal. */
  card: css`
    gap: var(--haze-space-2);
  `,
  /* pill: the Segmented-style capsule — a muted trough the selected
   * pill lifts out of. The 2px chrome mirrors SegmentedCore's
   * container (no 2px step exists in the spacing scale). */
  pill: css`
    gap: 2px;
    padding: 2px;
    background: var(--haze-color-bg-muted);
    border-radius: var(--haze-radius-full);
  `,
};
