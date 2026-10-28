import { css } from '@linaria/core';

/**
 * Shared citation chrome: the mono `[N]` index badge and the
 * outbound-title link that Sources' list rows and InlineCitation's
 * card header both render (identical declarations on both sides at
 * extraction time). Call-site deltas stay local — InlineCitation
 * composes its medium title weight on top of `citationLink` via a
 * one-declaration class, which is order-independent because
 * `citationLink` declares no font-weight.
 */
export const citationIndexBadge = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  flex-shrink: 0;
  user-select: none;
`;

export const citationLink = css`
  color: var(--haze-color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
