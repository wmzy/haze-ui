import {css} from '@linaria/core';

/**
 * Shared Banner skin — the base and variant classes the `Banner`
 * component wears. Living in their own module keeps the component file
 * free of style internals (react-refresh boundary) and lets the
 * variants map ship as a public constant (`bannerVariants`, the shadcn
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

export const variants = {
  info: css`
    background: var(--haze-color-info-subtle);
    color: var(--haze-color-info);
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
};

export const closeBtn = css`
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  font-size: var(--haze-text-lg);
  padding: var(--haze-space-2);
  min-width: 2.5rem;
  min-height: 2.5rem;
  line-height: 1;

  &:hover {
    opacity: 1;
  }

  /* Forced-colors: the × glyph keeps its CanvasText rendering through
     color:inherit; the UA drops nothing here except a focus ring this
     button never had — give keyboard focus a media-gated Highlight
     outline (normal rendering untouched). */
  @media (forced-colors: active) {
    &:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;

export const content = css`
  flex: 1;
`;
