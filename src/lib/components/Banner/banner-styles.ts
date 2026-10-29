import {css} from '@linaria/core';

import { calloutColors } from '../../utils/callout-skin';

/**
 * Shared Banner skin — the Banner-specific layers composed over the
 * common callout surface (utils/callout-skin.ts: box model, padding,
 * body typography, the flexing content column and the status tint
 * map; the mirror Alert keeps only its own deltas there too). Living
 * in their own module keeps the component file free of style
 * internals (react-refresh boundary) and lets the colors map ship as
 * a public constant (`bannerVariants`, the shadcn `buttonVariants`
 * precedent) for consumers composing custom elements with the same
 * skin; split-css groups the emitted CSS into `haze-ui/css/banner.css`
 * with them.
 */

/** Banner's layout delta over the shared callout surface: a centered
 *  space-between trigger row — the dismiss button hangs right on the
 *  message's baseline instead of in its own column. */
export const banner = css`
  align-items: center;
  justify-content: space-between;

  /* Forced-colors: the tinted variant backgrounds flatten onto Canvas
     with no border declared — a full-width banner would dissolve into
     the page. A CanvasText boundary keeps the prominent-message
     shape. */
  @media (forced-colors: active) {
    border: 1px solid CanvasText;
  }
`;

/* The tinted surface/text pair is the shared callout status map
 * (utils/callout-skin.ts — the status-skin subtle axis under the
 * public `bannerVariants` shape; key order is API). */
// Local const (not a bare re-export) — rolls up as a real binding so
// css-manifest attributes bannerVariants to the banner family; a pure
// `export { calloutColors as colors }` gets flattened to the utils
// origin and breaks generate-registry (badge-styles precedent).
export const colors = calloutColors;

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
