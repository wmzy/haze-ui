import { css } from '@linaria/core';

/**
 * Shared quiet-button skin — the compact bordered action chrome the
 * error-recovery surfaces paint (AsyncSection's retry button,
 * ErrorBoundary's fallback reset): inline-flex skeleton, the 1px border
 * surface over a transparent fill, sans/sm/medium typography and the
 * border-hover + bg-subtle hover wash. Split out of per-component
 * hand-rolls that had drifted into byte-identical copies; the classes
 * ride with every consuming family's css via sharedLayers
 * (split-css.mjs).
 *
 * Drift discipline (field-skin precedent): a declaration only lives
 * here when every consumer ships it identically. Per-site deltas —
 * forced-colors arms, icon-only geometry, disabled handling — stay
 * local as companion classes composed additively. And because the
 * dev-server's import-order injection and the dist split-css order
 * disagree, a companion that must beat a base declaration arms its
 * specificity instead of relying on source order (compound
 * `&[data-slot]` selector, Banner's closeBtnSize precedent).
 */

/**
 * The quiet button base: flex skeleton, md density (space-1/space-3
 * padding over radius-md), border surface, typography, the hover wash
 * and the keyboard focus ring.
 */
export const quietButton = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-1) var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: transparent;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  line-height: var(--haze-leading-tight);
  cursor: pointer;
  user-select: none;
  transition:
    background var(--haze-duration-fast),
    border-color var(--haze-duration-fast);

  &:hover {
    border-color: var(--haze-color-border-hover);
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

