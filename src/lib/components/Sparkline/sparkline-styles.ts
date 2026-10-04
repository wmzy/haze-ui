import {css} from '@linaria/core';

/**
 * Shared Sparkline skin — the base class plus tone→stroke / tone→fill
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

/** Stroke color per tone; worn by the line path. */
export const toneStrokes = {
  primary: css`stroke: var(--haze-color-primary);`,
  success: css`stroke: var(--haze-color-success);`,
  danger: css`stroke: var(--haze-color-danger);`,
  warning: css`stroke: var(--haze-color-warning);`,
  info: css`stroke: var(--haze-color-info);`,
} as const;

/** Translucent area fill per tone; worn by the fill path of the `area` variant. */
export const toneFills = {
  primary: css`fill: color-mix(in oklab, var(--haze-color-primary) 12%, transparent);`,
  success: css`fill: color-mix(in oklab, var(--haze-color-success) 12%, transparent);`,
  danger: css`fill: color-mix(in oklab, var(--haze-color-danger) 12%, transparent);`,
  warning: css`fill: color-mix(in oklab, var(--haze-color-warning) 12%, transparent);`,
  info: css`fill: color-mix(in oklab, var(--haze-color-info) 12%, transparent);`,
} as const;
