import {css} from '@linaria/core';

/**
 * Shared Alert skin — the base and variant classes the `Alert`
 * component wears. Living in their own module keeps the component file
 * free of style internals (react-refresh boundary) and lets the
 * variants map ship as a public constant (`alertVariants`, the shadcn
 * `buttonVariants` precedent) for consumers composing custom elements
 * with the same skin; split-css groups the emitted CSS into
 * `haze-ui/css/alert.css` with them.
 */

export const base = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-3);
  padding: var(--haze-space-3) var(--haze-space-4);
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);
`;

export const variants = {
  info: css`
    background: var(--haze-color-info-subtle);
    color: var(--haze-color-info);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-info) 25%, transparent);
  `,
  success: css`
    background: var(--haze-color-success-subtle);
    color: var(--haze-color-success);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-success) 25%, transparent);
  `,
  warning: css`
    background: var(--haze-color-warning-subtle);
    color: var(--haze-color-warning);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-warning) 25%, transparent);
  `,
  danger: css`
    background: var(--haze-color-danger-subtle);
    color: var(--haze-color-danger);
    border: 1px solid
      color-mix(in srgb, var(--haze-color-danger) 25%, transparent);
  `,
} as const;

export const contentStyle = css`
  flex: 1;
`;

export const closeBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: var(--haze-text-lg);
  line-height: 1;
  opacity: 0.6;
  transition: opacity var(--haze-duration-fast);

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
    border-radius: var(--haze-radius-sm);
  }

  /* Forced-colors: the box-shadow focus ring is dropped by the UA —
     a Highlight outline replaces it (media-gated, normal rendering
     untouched). */
  @media (forced-colors: active) {
    &:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;
