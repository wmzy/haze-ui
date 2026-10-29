import {css} from '@linaria/core';

import { calloutColors } from '../../utils/callout-skin';

/**
 * Shared Alert skin — the Alert-specific layers composed over the
 * common callout surface (utils/callout-skin.ts: box model, padding,
 * body typography, the flexing content column and the status tint
 * map; the mirror Banner keeps only its own deltas there too). Living
 * in their own module keeps the component file free of style
 * internals (react-refresh boundary) and lets the colors map ship as
 * a public constant (`alertVariants`, the shadcn `buttonVariants`
 * precedent) for consumers composing custom elements with the same
 * skin; split-css groups the emitted CSS into `haze-ui/css/alert.css`
 * with them.
 */

/** Alert's layout delta over the shared callout surface: a flex-start
 *  icon column — multi-line content hangs left under the glyph — with
 *  a gap, and body copy keeps the normal leading Banner's single-line
 *  trigger row does not need. */
export const base = css`
  align-items: flex-start;
  gap: var(--haze-space-3);
  line-height: var(--haze-leading-normal);
`;

/* The tinted surface/text pair is the shared callout status map
 * (utils/callout-skin.ts — the status-skin subtle axis under the
 * public `alertVariants` shape; key order is API). Alert's own layer
 * below is the color-mix border composed on top. */
// Local const (not a bare re-export) — rolls up as a real binding so
// css-manifest attributes alertVariants to the alert family; a pure
// `export { calloutColors as colors }` gets flattened to the utils
// origin and breaks generate-registry (badge-styles precedent).
export const colors = calloutColors;

/** The border layer Alert composes over the shared subtle skin — the
 *  25% color-mix edge that frames the message with its accent. */
export const borders = {
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
