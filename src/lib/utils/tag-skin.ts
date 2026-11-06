import { css } from '@linaria/core';

/**
 * Shared tag skin — the tag list, tag chip, remove-button and
 * chip-field-container classes TagInput and PromptInput both wear
 * (PromptInput grew from a copy of TagInput's styles; the remove
 * button keeps PromptInput's disabled arms, the stricter of the two).
 * The classes ride with both families' css via sharedLayers
 * (split-css.mjs); the sortable-mode drag classes stay in TagInput's
 * own `tag-input-styles.ts`.
 */

/* Tags flow inline with the field's input/textarea: the list itself
   wraps while staying a flex participant of the container. */
export const listWrap = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const tag = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  padding: var(--haze-space-0) var(--haze-space-2);
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-sm);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-relaxed);
`;

export const removeBtn = css`
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
  padding: var(--haze-space-1);
  /* WCAG 2.5.8 target-size floor, on the space scale (space-6 = 24px). */
  min-width: var(--haze-space-6);
  min-height: var(--haze-space-6);

  &:hover:not(:disabled) {
    color: var(--haze-color-text);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

/**
 * The chip-holding field container TagInput and PromptInput share:
 * the wrapping flex flow, the field padding, the sans face, the
 * always-2.25rem floor on the space scale (space-6 + space-3 = 36px)
 * and the border/shadow transition. The surface chrome and the
 * :focus-within ring are composed from utils/field-skin.ts at the
 * site; PromptInput's anchor/box/typography deltas (position, width,
 * box-sizing, sm font, ink) and its hover arm stay local, TagInput's
 * container wears this as-is. Property-disjoint from every companion
 * delta — no cascade-order dependence.
 */
export const tagFieldContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-1);
  padding: var(--haze-space-2) var(--haze-space-3);
  font-family: var(--haze-font-sans);
  min-height: calc(var(--haze-space-6) + var(--haze-space-3));
  align-items: center;
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);
`;
