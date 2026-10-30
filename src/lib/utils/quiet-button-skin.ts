import { css } from '@linaria/core';

/**
 * Shared quiet-button skin — the compact bordered action chrome the
 * error-recovery surfaces paint (AsyncSection's retry button,
 * ErrorBoundary's fallback reset): inline-flex skeleton, the 1px border
 * surface over a transparent fill, sans/sm/medium typography and the
 * border-hover + bg-subtle hover wash. Split out of per-component
 * hand-rolls that had drifted into byte-identical copies; the classes
 * ride with every consuming family's css via sharedLayers
 * (split-css.mjs). The textToggle flavor extends the family to the
 * undecorated primary-ink text button (Ellipsis's expand, Spoiler's
 * show more/less).
 *
 * Hover arms across the module are :not(:disabled)-guarded (the
 * library-wide convention — Pagination, TransferCore, tag-skin et al),
 * so a disabled seat keeps the resting ink without a local re-mute
 * patch.
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

  &:hover:not(:disabled) {
    border-color: var(--haze-color-border-hover);
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/**
 * The icon-button flavor: borderless chrome over the muted→text ink
 * shift and bg-muted hover wash, plus the standard keyboard ring.
 * NotificationCenter's trigger/action buttons, Sidebar's icon toggle,
 * ImagePreview's tool/nav buttons and the ChatMessage/Sources/Queue
 * icon actions used to hand-roll this per family with drifting ring
 * geometry (2px / 3px / none). Geometry (box size, padding), radius,
 * disabled handling and extra forced-colors arms stay local deltas —
 * and per the drift discipline above, a local arm that must differ
 * from one of these declarations raises specificity instead of
 * trusting source order.
 */
export const quietIconButton = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--haze-color-text-muted);
  transition:
    background var(--haze-duration-fast),
    color var(--haze-duration-fast);

  &:hover:not(:disabled) {
    color: var(--haze-color-text);
    background: var(--haze-color-bg-muted);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/**
 * The text-toggle flavor: the undecorated primary-ink button — no
 * border, no fill, primary color over the sans/sm text metrics, the
 * margin-top seat a reveal affordance keeps under the content it
 * expands, and the primary-hover ink shift on the guarded hover.
 * Ellipsis's expand button and Spoiler's show more/less toggle wore
 * this as per-family hand-rolls. The seat geometry stays local (the
 * two consumers size padding differently — Ellipsis's zero-pad
 * inline-flex row, Spoiler's block padding), and Spoiler's hover
 * underline rides as a local delta arm per the drift discipline
 * above; padding is deliberately absent here for the same reason.
 */
export const textToggle = css`
  margin-top: var(--haze-space-1);
  border: none;
  background: none;
  color: var(--haze-color-primary);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  cursor: pointer;

  &:hover:not(:disabled) {
    color: var(--haze-color-primary-hover);
  }
`;

