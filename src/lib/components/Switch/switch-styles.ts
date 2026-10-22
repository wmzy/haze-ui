import {css} from '@linaria/core';

/**
 * Shared Switch size skin — the per-size track/thumb classes the
 * `SwitchCore` component wears (the `Switch` sugar delegates to it).
 * Living in their own module keeps the component file free of style
 * internals (react-refresh boundary) and lets the size maps ship as
 * public constants (`trackSizes` / `thumbSizes`, the shadcn
 * `buttonVariants` precedent) for consumers composing custom elements
 * with the same skin; split-css groups the emitted CSS into
 * `haze-ui/css/switch.css` with them.
 */

/* Track heights sit at the --haze-space-6 (24px) floor for every size —
   WCAG 2.5.8 target size: the track is the switch's only pointer
   target, so the sm/md variants must not dip below it. */
const trackSm = css`
  width: 2.25rem;
  height: var(--haze-space-6);
`;

const trackMd = css`
  width: 40px;
  height: var(--haze-space-6);
`;

const trackLg = css`
  width: 48px;
  height: 26px;
`;

const thumbSm = css`
  width: 1rem;
  height: 1rem;
`;

const thumbMd = css`
  width: 18px;
  height: 18px;
`;

const thumbLg = css`
  width: 22px;
  height: 22px;
`;

const thumbCheckedSm = css`
  transform: translateX(1rem);
`;

const thumbCheckedMd = css`
  transform: translateX(18px);
`;

const thumbCheckedLg = css`
  transform: translateX(22px);
`;

export const trackSizes = {
  sm: trackSm,
  md: trackMd,
  lg: trackLg,
} as const;

export const thumbSizes = {
  sm: thumbSm,
  md: thumbMd,
  lg: thumbLg,
} as const;

export const thumbCheckedSizes = {
  sm: thumbCheckedSm,
  md: thumbCheckedMd,
  lg: thumbCheckedLg,
} as const;
