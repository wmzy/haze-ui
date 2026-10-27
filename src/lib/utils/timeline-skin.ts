import { css } from '@linaria/core';

/**
 * Shared timeline skeleton — the flex-column list, the connector row
 * layout, the dot geometry and the muted text skins, formerly
 * copy-pasted between Timeline and StepTimeline. Consumers keep their
 * deltas local: Timeline's in-flow connector line vs StepTimeline's
 * absolutely positioned `::before`, each family's row spacing, and the
 * status-specific marker/dot fills.
 */

/** The list shell: items stack in one column on the sans baseline. */
export const timelineList = css`
  display: flex;
  flex-direction: column;
  font-family: var(--haze-font-sans);
`;

/**
 * The row skeleton: dot column + content laid out with the shared gap.
 * The `:last-child` reset pairs with each consumer's own
 * `padding-block-end` (its higher specificity wins regardless of
 * stylesheet order).
 */
export const timelineRow = css`
  display: flex;
  gap: var(--haze-space-3);
  position: relative;

  &:last-child {
    padding-block-end: 0;
  }
`;

/**
 * Dot/marker geometry shared by Timeline's plain dot and StepTimeline's
 * status ring: round, never squeezed by the content column, and stacked
 * above the connector line.
 */
export const timelineDot = css`
  border-radius: var(--haze-radius-full);
  flex-shrink: 0;
  z-index: var(--haze-z-local-1);
`;

/** The row label/title: medium-weight body text. */
export const timelineLabel = css`
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
`;

/** Muted secondary text below the label: descriptions and timestamps. */
export const timelineDescription = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  margin-top: var(--haze-space-1);
`;
