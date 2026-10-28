import {css} from '@linaria/core';

import { statusSubtleColors } from '../../utils/status-skin';

/**
 * Shared Badge skin — the base, color and size classes the `Badge`
 * component wears. Living in their own module keeps the component file
 * free of style internals (react-refresh boundary) and lets the
 * colors/sizes maps ship as public constants (`badgeVariants` /
 * `badgeSizes`, the shadcn `buttonVariants` precedent) for consumers
 * composing custom elements with the same skin; split-css groups the
 * emitted CSS into `haze-ui/css/badge.css` with them.
 */

export const base = css`
  display: inline-flex;
  align-items: center;
  border-radius: var(--haze-radius-full);
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
  line-height: var(--haze-leading-tight);
  white-space: nowrap;
`;

/* The tinted surface/text pair comes from the shared status skin
 * (utils/status-skin.ts) — the same subtle axis Badge historically
 * declared inline; re-exported under the public `badgeVariants`
 * name. */
export const colors = statusSubtleColors;

export const sizes = {
  sm: css`
    padding: var(--haze-space-0) var(--haze-space-2);
    font-size: var(--haze-text-xs);
  `,
  md: css`
    padding: var(--haze-space-1) var(--haze-space-3);
    font-size: var(--haze-text-sm);
  `,
} as const;
