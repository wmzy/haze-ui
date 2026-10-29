import { css } from '@linaria/core';

import { statusSubtleColors } from './status-skin';

/**
 * Shared callout skin — the surface box model, padding and body
 * typography plus the flexing message column that the structural-mirror
 * callout pair (Alert, Banner) both wear: consumers compose
 * `x-class={[calloutSurface, <local layout delta>, ...]}` on the root
 * and `calloutContent` on the message column (the Alert/Banner JSX is
 * a mirror — icon/glyph optional, title+content, trailing dismiss —
 * only their public API semantics differ: inline message vs page
 * header strip).
 *
 * What deliberately stays local in alert-styles.ts / banner-styles.ts:
 * the layout axis — Alert is a flex-start icon column with a gap and
 * normal leading, Banner a centered space-between trigger row — a
 * genuine geometry difference, not spelling drift; plus Banner's
 * forced-colors CanvasText boundary and roomier 2.5rem dismiss box
 * (Alert takes the shared color-mix border below; AsyncSection's error
 * box composes the danger tint+edge pair with a stacked-column delta).
 * The dismiss (×) chrome itself already lives in status-skin
 * (`dismissBtn`). Every property set here is disjoint from every
 * consumer delta, so dev-server injection order and dist split-css
 * order cannot change the computed result.
 *
 * Pure Linaria class constants plus one css map (`calloutBorders`) and
 * one plain record of already-shared classes — the
 * one-css-map-per-module rule has nothing to collide on; no hooks, no
 * DOM access (RSC-safe by
 * inspection; nothing RSC-listed imports it, so no rsc-safe.mjs entry
 * — the css rides with the alert/banner/async-section groups via
 * split-css sharedLayers).
 */

/** The callout surface: flex box, page-gutter padding, radius and the
 *  sm body type every callout renders its message in. */
export const calloutSurface = css`
  display: flex;
  padding: var(--haze-space-3) var(--haze-space-4);
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
`;

/** The message column: flexes to the remaining row so the trailing
 * dismiss button keeps its intrinsic width instead of wrapping under
 * the text. */
export const calloutContent = css`
  flex: 1;
`;

/* The status tint pair under both components' public variants shape —
 * re-exported by alert-styles/banner-styles as `colors` and surfaced
 * as `alertVariants`/`bannerVariants` from the barrels. The classes
 * are the status-skin subtle axis; key order is API (pinned by the
 * variant tests): default, primary, info, success, warning, danger. */
export const calloutColors = {
  default: statusSubtleColors.default,
  primary: statusSubtleColors.primary,
  info: statusSubtleColors.info,
  success: statusSubtleColors.success,
  warning: statusSubtleColors.warning,
  danger: statusSubtleColors.danger,
} as const;

/* The border layer composed over the subtle skin — the 25% color-mix
 * edge that frames the message with its accent. Born as Alert's own
 * layer; moved here when AsyncSection's error box needed the identical
 * danger pair (subtle background + 25% danger border), and re-exported
 * by alert-styles as `borders` (local const binding — see the colors
 * note there). Key order mirrors calloutColors; properties are
 * disjoint from the surface, the tint and every consumer delta. */
export const calloutBorders = {
  default: css`
    border: 1px solid var(--haze-color-border);
  `,
  primary: css`
    border: 1px solid
      color-mix(in srgb, var(--haze-color-primary) 25%, transparent);
  `,
  info: css`
    border: 1px solid
      color-mix(in srgb, var(--haze-color-info) 25%, transparent);
  `,
  success: css`
    border: 1px solid
      color-mix(in srgb, var(--haze-color-success) 25%, transparent);
  `,
  warning: css`
    border: 1px solid
      color-mix(in srgb, var(--haze-color-warning) 25%, transparent);
  `,
  danger: css`
    border: 1px solid
      color-mix(in srgb, var(--haze-color-danger) 25%, transparent);
  `,
} as const;
