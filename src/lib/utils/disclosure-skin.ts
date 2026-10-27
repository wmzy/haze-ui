import { css } from '@linaria/core';

/**
 * Shared details/summary disclosure skins — the summary header (layout,
 * typography, hover wash, focus ring, marker suppression and the
 * rotated-border chevron) plus the content typography, formerly
 * copy-pasted between Disclosure and AccordionItem.
 *
 * Merge-order contract: skins are listed in each part's `x-class` array
 * before the consumer's slot class and className. Consumers keep their
 * state deltas local and must outrank the shared `:hover` wash by
 * specificity, not stylesheet order — dev-server injection (import
 * order) and dist split-css (shared layers appended after the group's
 * own modules) emit these classes in opposite orders.
 */

/** The `<summary>` header skin: interactive row with the open/close chevron. */
export const disclosureSummary = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--haze-space-3) var(--haze-space-4);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition: background var(--haze-duration-fast);

  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 3px var(--haze-color-focus-ring);
  }

  &::marker,
  &::-webkit-details-marker {
    display: none;
  }

  &::after {
    content: '';
    width: 8px;
    height: 8px;
    /* physical: the chevron is a rotated glyph drawn from physical
       borders — swapping them for logical ones would corrupt the shape
       (rotation itself stays physical either way). */
    border-right: 2px solid var(--haze-color-text-muted);
    border-bottom: 2px solid var(--haze-color-text-muted);
    transform: rotate(-45deg);
    transition: transform var(--haze-duration-normal);
    flex-shrink: 0;
  }

  details[open] > &::after {
    transform: rotate(45deg);
  }
`;

/** The disclosure body typography; spacing/borders stay per-consumer. */
export const disclosureContent = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  line-height: var(--haze-leading-normal);
`;
