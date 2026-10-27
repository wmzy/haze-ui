import {css} from '@linaria/core';

import {fieldSizes} from '../../utils/field-skin';

/**
 * Shared NumberInput size skin — the per-size stepper-button classes
 * and the input's size map. The input map is the shared field size map
 * (`utils/field-skin.ts` `fieldSizes`) — NumberInput's old one-value
 * paddings (space-1/2/3 all around) were an optical inconsistency
 * against Input's two-value map and are reconciled onto it: md now
 * pads `var(--haze-space-2) var(--haze-space-3)` like Input md. Living
 * in their own module keeps the component file free of style internals
 * (react-refresh boundary) and lets the size maps ship as public
 * constants (`inputSizes` / `btnSizes`, the shadcn `buttonVariants`
 * precedent) for consumers composing custom elements with the same
 * skin; split-css groups the emitted CSS into `haze-ui/css/number-input.css`
 * with them.
 */
export const inputSizes = fieldSizes;

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

export const btnSizes = {
  sm: btnSm,
  md: btnMd,
  lg: btnLg,
} as const;
