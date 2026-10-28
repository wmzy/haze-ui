import {css} from '@linaria/core';

import { statusSubtleColors } from '../../utils/status-skin';

/**
 * Shared Tag skin — the base, color and size classes the `Tag`
 * component wears. Living in their own module keeps the component file
 * free of style internals (react-refresh boundary) and lets the
 * colors/sizes maps ship as public constants (`tagVariants` /
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

/* The tinted surface/text pair comes from the shared status skin
 * (utils/status-skin.ts) — the same subtle axis Tag historically
 * declared inline; re-exported under the public `tagVariants`
 * name. */
export const colors = statusSubtleColors;

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

/** The link shape (`as` set): anchors get a UA underline the tag skin
 * never asked for — reset it (the color classes already own the ink;
 * Button's `link` class does the same for its anchor shape). Applies to
 * every explicit `as`, including router Links that render anchors. */
export const linkShape = css`
  text-decoration: none;
`;

/** Tag-local dismiss sizing layered over the shared dismiss skin
 * (utils/status-skin.ts): a tag's × follows the tag's own font size
 * (sm/md), not the shared text-lg default. The compound
 * `&[data-slot]` selector keeps the override winning in any cascade
 * order — a plain later class is not enough, dev-server injection
 * order and dist split-css order disagree. */
export const closeBtn = css`
  &[data-slot='remove-button'] {
    font-size: inherit;
  }
`;
