import {css} from '@linaria/core';

import { statusSubtleColors } from '../../utils/status-skin';

/**
 * Shared Banner skin — the base and color classes the `Banner`
 * component wears. Living in their own module keeps the component file
 * free of style internals (react-refresh boundary) and lets the
 * colors map ship as a public constant (`bannerVariants`, the shadcn
 * `buttonVariants` precedent) for consumers composing custom elements
 * with the same skin; split-css groups the emitted CSS into
 * `haze-ui/css/banner.css` with them.
 */

export const banner = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--haze-space-3) var(--haze-space-4);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  border-radius: var(--haze-radius-md);

  /* Forced-colors: the tinted variant backgrounds flatten onto Canvas
     with no border declared — a full-width banner would dissolve into
     the page. A CanvasText boundary keeps the prominent-message
     shape. */
  @media (forced-colors: active) {
    border: 1px solid CanvasText;
  }
`;

/* The tinted surface/text pair comes from the shared status skin
 * (utils/status-skin.ts — byte-identical to Badge/Tag/Chip's subtle
 * axis). Key order preserved from the historical map (the public
 * `bannerVariants` shape). */
export const colors = {
  default: statusSubtleColors.default,
  primary: statusSubtleColors.primary,
  info: statusSubtleColors.info,
  success: statusSubtleColors.success,
  warning: statusSubtleColors.warning,
  danger: statusSubtleColors.danger,
} as const;

/** Banner-local dismiss geometry layered over the shared dismiss skin
 * (utils/status-skin.ts): the roomier 2.5rem trigger-row box with its
 * generous padding. The compound `&[data-slot]` selector keeps the
 * override winning in any cascade order — a plain later class is not
 * enough, dev-server injection order and dist split-css order
 * disagree. */
export const closeBtnSize = css`
  &[data-slot='close'] {
    padding: var(--haze-space-2);
    min-width: 2.5rem;
    min-height: 2.5rem;
  }
`;

export const content = css`
  flex: 1;
`;
