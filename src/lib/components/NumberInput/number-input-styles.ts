import {css} from '@linaria/core';

/**
 * Shared NumberInput size skin — the per-size input and stepper-button
 * classes the `NumberInputCore` component wears (the `NumberInput`
 * sugar delegates to it). Living in their own module keeps the
 * component file free of style internals (react-refresh boundary) and
 * lets the size maps ship as public constants (`inputSizes` /
 * `btnSizes`, the shadcn `buttonVariants` precedent) for consumers
 * composing custom elements with the same skin; split-css groups the
 * emitted CSS into `haze-ui/css/number-input.css` with them.
 */

const inputSm = css`
  padding: var(--haze-space-1);
  font-size: var(--haze-text-sm);
`;

const inputMd = css`
  padding: var(--haze-space-2);
  font-size: var(--haze-text-sm);
`;

const inputLg = css`
  padding: var(--haze-space-3);
  font-size: var(--haze-text-base);
`;

const btnSm = css`
  padding: 0 var(--haze-space-2);
  font-size: var(--haze-text-sm);
`;

const btnMd = css`
  padding: 0 var(--haze-space-3);
  font-size: var(--haze-text-sm);
`;

const btnLg = css`
  padding: 0 var(--haze-space-3);
  font-size: var(--haze-text-base);
`;

export const inputSizes = {
  sm: inputSm,
  md: inputMd,
  lg: inputLg,
} as const;

export const btnSizes = {
  sm: btnSm,
  md: btnMd,
  lg: btnLg,
} as const;
