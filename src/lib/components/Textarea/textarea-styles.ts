import {css} from '@linaria/core';

/**
 * Shared Textarea size skin — the per-size padding/typography classes
 * the `TextareaCore` component wears (the `Textarea` sugar delegates to
 * it). Sibling styles module per the react-refresh boundary convention
 * (Input `input-styles` / NumberInput `number-input-styles` precedent);
 * split-css groups the module with the Textarea family's css.
 */
export const sizes = {
  sm: css`
    padding: var(--haze-space-1) var(--haze-space-2);
    font-size: var(--haze-text-sm);
  `,
  md: css`
    padding: var(--haze-space-2) var(--haze-space-3);
    font-size: var(--haze-text-sm);
  `,
  lg: css`
    padding: var(--haze-space-3) var(--haze-space-4);
    font-size: var(--haze-text-base);
  `,
} as const;
