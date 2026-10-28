import type { AgenticStatus } from './agentic-status';

import { css } from '@linaria/core';

/**
 * Shared timeline skeleton — the flex-column list, the connector row
 * layout, the dot geometry, the muted text skins, the status-marker
 * ring family and the expandable-disclosure layer, formerly
 * copy-pasted between Timeline, StepTimeline, Trace and Plan.
 * Consumers keep their deltas local: Timeline's in-flow connector
 * line vs StepTimeline's absolutely positioned `::before`, each
 * family's row spacing, Plan's optical nudge and dashed `skipped`
 * ring, and ToolCallCard's borderless header discs.
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

/**
 * Status-marker geometry shared by the agentic line families (Trace,
 * StepTimeline, Plan): the round 20px ring cell that centers its
 * glyph. The size rides space-5 so compact density scales marker,
 * connector and panel indent together. The 0.5rem glyph size is a
 * documented keep — no type token that small exists (text-xs is the
 * floor); the ✓/! marks are intentionally sub-token. The base
 * declares no border on purpose: every arm carries the full border
 * shorthand, so base and arms never contest the same longhand and
 * their relative stylesheet order cannot matter.
 */
export const statusDot = css`
  width: var(--haze-space-5);
  height: var(--haze-space-5);
  border-radius: var(--haze-radius-full);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  line-height: 1;
`;

/** Waiting: the resting ring on the border tone over the page bg. */
export const statusDotPending = css`
  border: 2px solid var(--haze-color-border);
  background: var(--haze-color-bg);
`;

/** Current without motion (StepTimeline/Plan's non-running emphasis). */
export const statusDotActive = css`
  border: 2px solid var(--haze-color-primary);
  background: var(--haze-color-primary);
`;

/**
 * In flight: the solid primary dot with a pulsing halo ring.
 * Multi-second cycle on purpose: the motion tokens model transition
 * durations (120/200/300ms), not loops — same call as Spinner's spin
 * period; reduced-motion parks it below.
 */
export const statusDotRunning = css`
  border: 2px solid var(--haze-color-primary);
  background: var(--haze-color-primary);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -0.3125rem;
    border-radius: var(--haze-radius-full);
    border: 2px solid var(--haze-color-primary);
    animation: timeline-pulse 1.6s var(--haze-ease) infinite;
  }

  /* WCAG 2.3.3: a single 0.01ms iteration parks the pulse at its rest
     frame — the ring settles as a static halo around the solid dot, so
     the step still reads as in-flight without motion. */
  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation-duration: 0.01ms;
      animation-iteration-count: 1;
    }
  }

  @keyframes timeline-pulse {
    0% {
      transform: scale(0.6);
      opacity: 0.8;
    }

    70%,
    100% {
      transform: scale(1.4);
      opacity: 0;
    }
  }
`;

/** Terminal success: solid ring with the inverse-tone ✓ glyph. */
export const statusDotDone = css`
  border: 2px solid var(--haze-color-success);
  background: var(--haze-color-success);
  color: var(--haze-color-text-inverse);
`;

/** Terminal failure: solid ring with the inverse-tone ! glyph. */
export const statusDotError = css`
  border: 2px solid var(--haze-color-danger);
  background: var(--haze-color-danger);
  color: var(--haze-color-text-inverse);
`;

/**
 * Glyphs inside the status marker; pending/active/running stay
 * glyph-free. Consumers whose status union widens beyond
 * AgenticStatus narrow before indexing (Plan's skipped, StepTimeline's
 * active).
 */
export const statusGlyphs: Partial<Record<AgenticStatus, string>> = {
  done: '✓',
  error: '!',
};

/**
 * Expandable rows stack the header button above the panel instead of
 * laying the reveal out in the row itself. Must stay declared after
 * timelineRow so its `display: block` wins the same-specificity tie
 * inside this module; consumers whose row class is local apply their
 * flex row arm and this one exclusively, never both.
 */
export const itemStacked = css`
  display: block;
`;

/**
 * The disclosure header: the full-width unstyled button that keeps
 * the marker flush with the line edge so the reveal stays visually
 * anchored to its step (and connector-style families keep their line
 * hitting the marker's center).
 */
export const headerButton = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-3);
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: start;
  cursor: pointer;
  border-radius: var(--haze-radius-md);

  /* No inline padding on purpose: the marker must stay flush with the
     line edge so the reveal stays visually anchored to its step. */
  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/**
 * The trailing disclosure chevron pair: muted, nudged to the title's
 * cap line, and rotated open while expanded. `open` is declared after
 * `closed` so its rotation wins inside this module; consumers must
 * not re-declare `transform` on the same element (a later local
 * declaration would be emission-order-dependent).
 */
export const chevronPair = {
  closed: css`
    display: inline-flex;
    flex-shrink: 0;
    margin-block-start: var(--haze-space-1);
    color: var(--haze-color-text-muted);
    transform: rotate(0deg);
    transition: transform var(--haze-duration-fast) var(--haze-ease);
  `,
  open: css`
    transform: rotate(90deg);
  `,
} as const;

/**
 * The disclosure panel: revealed content indented past the marker
 * column (space-5 marker + the row gap) so it aligns with the line's
 * text; rides the space scale so density moves marker and indent
 * together.
 */
export const panelBase = css`
  padding-inline-start: calc(var(--haze-space-5) + var(--haze-space-3));
  padding-block: var(--haze-space-1) var(--haze-space-2);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
`;

/**
 * Monospace payload body for revealed details (ToolCallCard content
 * precedent) — wrap free-form payloads in TraceDetails-style bodies.
 */
export const disclosureMonoBody = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  white-space: pre-wrap;
  word-break: break-all;
`;
