import {css} from '@linaria/core';

import {statusStrokeColors} from '../../utils/status-stroke-skin';

/**
 * Shared Sparkline skin — the base class plus color→stroke / color→fill
 * variant maps the `Sparkline` component wears. Living in their own module
 * keeps the component file free of style internals (react-refresh
 * boundary) and lets the maps ship as public constants
 * (`sparklineToneStrokes` / `sparklineToneFills`) for consumers composing
 * custom SVG elements with the same skin; split-css groups the emitted
 * CSS into `haze-ui/css/sparkline.css` with them.
 */

export const base = css`
  display: inline-block;
  vertical-align: middle;
  /* Round linecaps extend past the viewBox ends; keep them visible. */
  overflow: visible;
`;

/**
 * Stroke color per semantic color; worn by the line path. Delegates to
 * the shared status stroke axis — identical per-key values, including
 * the neutral `default` → text-secondary — so Progress's circle track
 * and the Sparkline line wear one skin. Re-bound as a local const: a
 * bare re-export would flatten to the utils source module in the
 * rollup output and break split-css family grouping.
 */
export const colorStrokes = statusStrokeColors;

/** Translucent area fill per semantic color; worn by the fill path of the `area` variant. */
export const colorFills = {
  default: css`fill: color-mix(in oklab, var(--haze-color-text-secondary) 12%, transparent);`,
  primary: css`fill: color-mix(in oklab, var(--haze-color-primary) 12%, transparent);`,
  success: css`fill: color-mix(in oklab, var(--haze-color-success) 12%, transparent);`,
  danger: css`fill: color-mix(in oklab, var(--haze-color-danger) 12%, transparent);`,
  warning: css`fill: color-mix(in oklab, var(--haze-color-warning) 12%, transparent);`,
  info: css`fill: color-mix(in oklab, var(--haze-color-info) 12%, transparent);`,
} as const;
