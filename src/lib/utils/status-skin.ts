import { css } from '@linaria/core';

/**
 * Shared status skin — the semantic color axis and the dismiss (×)
 * button chrome every status-flavored surface wears. The subtle map is
 * byte-identical to what Badge/Tag/Banner/Chip-solid/Alert/NotificationCenter
 * each used to declare inline (Alert composes its color-mix border layer
 * on top locally); the solid/stroke axes live in sibling modules —
 * ONE css map per module: Linaria derives class display names from
 * member keys, so same-keyed maps in one file collide and the emitted
 * css silently keeps only one (wave-5 incident; e2e baselines caught
 * it). Pure Linaria class constants + plain records — no hooks, no DOM
 * access (RSC-safe by inspection; listed in scripts/rsc-safe.mjs
 * because the RSC-listed Badge/Tag/Chip style modules import it). The
 * css rides with every consuming family via sharedLayers
 * (split-css.mjs).
 */

/** The six-value semantic status axis shared by the display family. */
export type StatusColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/** Subtle status surface: tinted background + full accent ink. */
export const statusSubtleColors = {
  default: css`
    background: var(--haze-color-bg-muted);
    color: var(--haze-color-text-secondary);
  `,
  primary: css`
    background: var(--haze-color-primary-subtle);
    color: var(--haze-color-primary);
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
  info: css`
    background: var(--haze-color-info-subtle);
    color: var(--haze-color-info);
  `,
} as const;

/* Live-region semantics per status color (Radix / React-Aria convention,
 * the same contract Toast's variant map documents): only danger may
 * interrupt the screen reader — role="alert" is implicitly
 * aria-live="assertive". Every other status announces politely via
 * role="status" (implicitly aria-live="polite", aria-atomic="true") so
 * it queues behind in-progress speech. */
export const statusLiveRoles = {
  default: 'status',
  primary: 'status',
  success: 'status',
  warning: 'status',
  danger: 'alert',
  info: 'status',
} as const;

/** The dismiss (×) button chrome shared by Alert, Banner, Tag, Chip and
 * Toast. Per-site geometry stays local (Tag's glyph follows the tag's
 * own font size, Banner keeps its roomier 2.5rem trigger box, Chip adds
 * its leading margin) via specificity-armed overrides — a plain later
 * class is not enough there, dev-server injection order and dist
 * split-css order disagree. */
export const dismissBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: var(--haze-text-lg);
  line-height: 1;
  opacity: 0.6;
  transition: opacity var(--haze-duration-fast);
  /* WCAG 2.5.8 target size: the × glyph alone is far under the floor —
     the button box itself carries the 24px minimum target (space-6). */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--haze-space-6);
  min-height: var(--haze-space-6);

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
    border-radius: var(--haze-radius-sm);
  }

  /* Forced-colors: the box-shadow focus ring is dropped by the UA —
     a Highlight outline replaces it (media-gated, normal rendering
     untouched). */
  @media (forced-colors: active) {
    &:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;
