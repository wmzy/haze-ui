import {css} from '@linaria/core';

import { chipSizeMd, chipSizeSm } from '../../utils/chip-size-skin';
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

/* The sm/md padding + font-size ladder is the shared chip size skin
 * (utils/chip-size-skin.ts) — the pair Tag's tagSizes wears identically;
 * interpolated here so badge.css keeps emitting its own rules. */
export const sizes = {
  sm: css`
    ${chipSizeSm}
  `,
  md: css`
    ${chipSizeMd}
  `,
} as const;
