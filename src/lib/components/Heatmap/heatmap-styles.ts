import {css} from '@linaria/core';

/**
 * Shared Heatmap skin — the GitHub-style activity calendar chrome the
 * `Heatmap` component wears. Living in its own module keeps the
 * component file free of style internals (react-refresh boundary) and
 * lets it register as RSC-safe (the module is hook-free and only
 * re-exports Linaria constants). split-css groups the emitted CSS into
 * `haze-ui/css/heatmap.css`.
 *
 * Intensity bins are a single class, not one class per level: every
 * cell carries its own `--haze-heatmap-mix` percentage (inline style,
 * level / levels · 100%) and the `color-mix()` background recomputes
 * against whatever `--haze-color-primary` / `--haze-color-bg-subtle`
 * resolve to — light, dark and brand-preset themes all follow for
 * free, at any `levels` count, with zero per-level classes.
 */

/** The calendar grid: row 1 = month labels, rows 2-8 = Sun..Sat. */
export const heatmapBase = css`
  display: grid;
  grid-template-rows: auto repeat(7, var(--haze-space-4));
  column-gap: var(--haze-space-1);
  row-gap: var(--haze-space-1);
  width: max-content;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
`;

/** A month label spanning its week columns along the top row — the
 * single-line clipping contract rides the shared truncate class
 * (utils/truncate), composed in Heatmap.tsx. */
export const heatmapMonth = css`
  align-self: end;
  padding-bottom: var(--haze-space-1);
  min-width: 0;
`;

/** The Sun..Sat gutter labels down the first column. */
export const heatmapWeekday = css`
  align-self: center;
  padding-right: var(--haze-space-2);
  text-align: right;
  white-space: nowrap;
`;

/** One day square; `data-level` carries the bin, the mix % the tint. */
export const heatmapCell = css`
  width: var(--haze-space-4);
  height: var(--haze-space-4);
  border-radius: var(--haze-radius-sm);
  background: color-mix(
    in oklab,
    var(--haze-color-primary) var(--haze-heatmap-mix, 0%),
    var(--haze-color-bg-subtle)
  );

  /* Forced-colors: the whole color scale flattens onto Canvas — every
     square would vanish. Hairline insets keep the 7-row lattice
     readable; darker GrayText marks the empty squares. */
  @media (forced-colors: active) {
    outline: 1px solid CanvasText;
    outline-offset: -1px;
  }
`;

/** Dates with no activity (or value 0) — the flat faint square. */
export const heatmapCellEmpty = css`
  background: var(--haze-color-bg-muted);

  @media (forced-colors: active) {
    outline-color: GrayText;
  }
`;
