import {css} from '@linaria/core';

/**
 * Shared Tag skin — the base, variant and size classes the `Tag`
 * component wears. Living in their own module keeps the component file
 * free of style internals (react-refresh boundary) and lets the
 * variants/sizes maps ship as public constants (`tagVariants` /
 * `tagSizes`, the shadcn `buttonVariants` precedent) for consumers
 * composing custom elements with the same skin; split-css groups the
 * emitted CSS into `haze-ui/css/tag.css` with them.
 */

export const base = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
  line-height: var(--haze-leading-tight);
  white-space: nowrap;
`;

export const variants = {
  default: css`
    background: var(--haze-color-bg-muted);
    color: var(--haze-color-text-secondary);
  `,
  primary: css`
    background: var(--haze-color-primary-subtle);
    color: var(--haze-color-primary);
  `,
  success: css`
    background: var(--haze-color-success-subtle);
    color: var(--haze-color-success);
  `,
  warning: css`
    background: var(--haze-color-warning-subtle);
    color: var(--haze-color-warning);
  `,
  danger: css`
    background: var(--haze-color-danger-subtle);
    color: var(--haze-color-danger);
  `,
} as const;

export const tagSizes = {
  sm: css`
    padding: var(--haze-space-0) var(--haze-space-2);
    font-size: var(--haze-text-xs);
  `,
  md: css`
    padding: var(--haze-space-1) var(--haze-space-3);
    font-size: var(--haze-text-sm);
  `,
} as const;

export const closeBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
  /* The × glyph alone is far under the WCAG 2.5.8 target-size floor —
     the button box itself carries the 24px minimum target. */
  min-width: var(--haze-space-6);
  min-height: var(--haze-space-6);
  font-size: inherit;
  line-height: 1;
  opacity: 0.6;
  transition: opacity var(--haze-duration-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
    border-radius: var(--haze-radius-sm);
  }
`;
