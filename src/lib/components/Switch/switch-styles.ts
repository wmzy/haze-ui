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
  /* 2.25rem (36px) sits between the space steps (32/40) — literal on
     purpose (InlineEdit's 1.75rem precedent). */
  width: 2.25rem;
  height: var(--haze-space-6);
`;

const trackMd = css`
  width: var(--haze-space-10);
  height: var(--haze-space-6);
`;

const trackLg = css`
  width: var(--haze-space-12);
  /* 26px sits between the space steps (24/32) — literal on purpose. */
  height: 26px;
`;

/* The checked thumb travels exactly its own width (track padding is
   symmetric: inner width − thumb = thumb), so both read one custom
   property — a size tweak can never drift the travel from the box. */
const thumbSm = css`
  --haze-switch-thumb-w: var(--haze-space-4);
  width: var(--haze-switch-thumb-w);
  height: var(--haze-switch-thumb-w);
`;

const thumbMd = css`
  /* 18px sits between the space steps (16/20) — literal on purpose. */
  --haze-switch-thumb-w: 18px;
  width: var(--haze-switch-thumb-w);
  height: var(--haze-switch-thumb-w);
`;

const thumbLg = css`
  /* 22px sits between the space steps (20/24) — literal on purpose. */
  --haze-switch-thumb-w: 22px;
  width: var(--haze-switch-thumb-w);
  height: var(--haze-switch-thumb-w);
`;

const thumbCheckedSm = css`
  transform: translateX(var(--haze-switch-thumb-w));
`;

const thumbCheckedMd = css`
  transform: translateX(var(--haze-switch-thumb-w));
`;

const thumbCheckedLg = css`
  transform: translateX(var(--haze-switch-thumb-w));
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
