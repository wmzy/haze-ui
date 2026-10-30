import {css} from '@linaria/core';

/**
 * Shared Meter skin — the labeled gauge chrome (root, header row with
 * label/value, track and bar classes) the `Meter` component wears.
 * The bar's geometry/motion is delegated to utils/meter-skin's
 * meterFill (composed in Meter.tsx); only its tone axis lives here.
 * Living in its own module keeps the component file free of style
 * internals (react-refresh boundary); split-css groups the emitted CSS
 * into `haze-ui/css/meter.css` with them.
 *
 * ## Threshold coloring
 *
 * The resolved color rides a `data-color` attribute on the root, track
 * and bar; the track washes with the color's `-subtle` token while the
 * bar inks the full color — attribute selectors (not per-color classes)
 * so consumers can retarget bands with plain `[data-color]` CSS.
 */

export const root = css`
  display: block;
  width: 100%;
`;

export const header = css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--haze-space-3);
  margin-block-end: var(--haze-space-2);
`;

export const label = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
`;

export const value = css`
  font-size: var(--haze-text-sm);
  font-variant-numeric: tabular-nums;
  color: var(--haze-color-text-secondary);
`;

export const track = css`
  width: 100%;
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-full);
  overflow: hidden;

  /* The threshold band's color washes the track (subtle variant); the
   * default (no band matched) keeps the neutral muted track. */
  &[data-color='success'] {
    background: var(--haze-color-success-subtle);
  }

  &[data-color='warning'] {
    background: var(--haze-color-warning-subtle);
  }

  &[data-color='danger'] {
    background: var(--haze-color-danger-subtle);
  }

  &[data-color='info'] {
    background: var(--haze-color-info-subtle);
  }

  /* Forced-colors: every fill color flattens onto Canvas — the meter
   * would vanish. Targeting the bar by its data-slot keeps one rule
   * ahead of the tone attribute selectors; the bar renders Highlight,
   * the Windows-native determinate-progress color. */
  @media (forced-colors: active) {
    & > [data-slot='bar'] {
      background: Highlight;
    }
  }
`;

/* Same three steps as Progress's barSizes — the read-only gauge keeps
 * the determinate bar's track profile so the two compose visually. */
export const trackSizes = {
  sm: css`height: 4px;`,
  md: css`height: 8px;`,
  lg: css`height: 12px;`,
} as const;

/* The fill's geometry and motion ride the shared linear-meter skin
 * (utils/meter-skin's meterFill, worn beside this class: full height,
 * radius inherited from the pill track, width transition on the shared
 * normal + haze-ease curve). Meter historically animated on slow + a
 * bare ease; converging on the shared curve is the same intentional
 * unification TokenCounter already made — only the tone axis stays
 * local here. */
export const bar = css`
  background: var(--haze-color-primary);

  &[data-color='default'] {
    background: var(--haze-color-text-secondary);
  }

  &[data-color='success'] {
    background: var(--haze-color-success);
  }

  &[data-color='warning'] {
    background: var(--haze-color-warning);
  }

  &[data-color='danger'] {
    background: var(--haze-color-danger);
  }

  &[data-color='info'] {
    background: var(--haze-color-info);
  }
`;
