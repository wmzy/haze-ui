import {css} from '@linaria/core';

/**
 * Shared Input size skin — the per-size padding/typography classes the
 * `InputCore` component wears (the `Input` sugar delegates to it).
 * Living in their own module keeps the component file free of style
 * internals (react-refresh boundary) and lets the size map ship as a
 * public constant for consumers and tests asserting the ConfigProvider
 * `Input.size` tier (the shadcn `buttonVariants` / NumberInput
 * `inputSizes` precedent); split-css groups the module with the Input
 * family's css.
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
