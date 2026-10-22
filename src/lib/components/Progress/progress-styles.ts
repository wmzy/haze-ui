import {css} from '@linaria/core';

/**
 * Shared Progress skin — the bar and circle chrome (base, per-size and
 * per-color classes) the `Progress` component wears. Living in their
 * own module keeps the component file free of style internals
 * (react-refresh boundary) and lets the size maps ship as public
 * constants (`barSizes` / `circleSizes`, the shadcn `buttonVariants`
 * precedent) for consumers composing custom elements with the same
 * skin; split-css groups the emitted CSS into `haze-ui/css/progress.css`
 * with them.
 */

export const barBase = css`
  width: 100%;
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-full);
  overflow: hidden;

  /* Forced-colors: every fill color flattens onto Canvas — the
     progress would vanish. Targeting the fill by its data-slot (not
     the colorMap classes) keeps one rule ahead of them in the
     cascade; the fill renders Highlight, the Windows-native
     determinate-progress color. */
  @media (forced-colors: active) {
    & > [data-slot='fill'] {
      background: Highlight;
    }
  }
`;

export const barSizes = {
  sm: css`height: 4px;`,
  md: css`height: 8px;`,
  lg: css`height: 12px;`,
} as const;

export const barFill = css`
  height: 100%;
  border-radius: var(--haze-radius-full);
  transition: width var(--haze-duration-slow) ease;
`;

export const colorMap = {
  primary: css`background: var(--haze-color-primary);`,
  success: css`background: var(--haze-color-success);`,
  warning: css`background: var(--haze-color-warning);`,
  danger: css`background: var(--haze-color-danger);`,
} as const;

export const circleBase = css`
  transform: rotate(-90deg);

  /* Forced-colors: both strokes flatten onto Canvas — the ring would
     vanish. The track renders GrayText and the arc Highlight,
     targeted by data-slot so one rule outranks the colorMap classes
     in the cascade. */
  @media (forced-colors: active) {
    & [data-slot='track'] {
      stroke: GrayText;
    }

    & [data-slot='fill'] {
      stroke: Highlight;
    }
  }
`;

export const circleSizes = {
  sm: css`width: 32px; height: 32px;`,
  md: css`width: 48px; height: 48px;`,
  lg: css`width: 64px; height: 64px;`,
} as const;

export const circleBg = css`
  fill: none;
  stroke: var(--haze-color-bg-muted);
`;

export const circleFill = css`
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--haze-duration-slow) ease;
`;

export const circleColorMap = {
  primary: css`stroke: var(--haze-color-primary);`,
  success: css`stroke: var(--haze-color-success);`,
  warning: css`stroke: var(--haze-color-warning);`,
  danger: css`stroke: var(--haze-color-danger);`,
} as const;
