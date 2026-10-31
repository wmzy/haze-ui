import { css } from '@linaria/core';

/**
 * Shared action-button variant arms — the solid and ghost surfaces
 * Button and FloatButton wore as byte-identical map values (the solid
 * primary fill and the transparent ghost with its bg-subtle/bg-muted
 * wash). The outline arms deliberately stay per-family: Button paints
 * a transparent surface with an explicit border-color, FloatButton a
 * filled bg surface whose border rides its base class — drifted by
 * design, so each map keeps a local outline value.
 *
 * FloatButton's ghost additionally flattens the FAB's resting shadow;
 * that box-shadow:none delta composes locally behind the shared ghost
 * (the shared arm does not declare box-shadow, so the pair is
 * order-immune — the additive-delta contract utils/focus-ring.ts
 * documents).
 *
 * Drift discipline (field-skin precedent): a declaration only lives
 * here when every consumer ships it identically. Per-site deltas stay
 * local as companion classes. Registered under
 * 'utils/button-variant-skin' in scripts/split-css.mjs sharedLayers —
 * back-to-top rides along because it consumes FloatButton's variant
 * classes through float-button-styles.
 */

/** The primary action surface: solid fill, inverse ink, hover/active
 *  darkening through the palette's interaction-state tokens. */
export const solidVariant = css`
  background: var(--haze-color-primary);
  color: var(--haze-color-text-inverse);

  &:hover {
    background: var(--haze-color-primary-hover);
  }

  &:active {
    background: var(--haze-color-primary-active);
  }
`;

/** The ghost surface: transparent fill, body ink, the quiet hover
 *  wash. */
export const ghostVariant = css`
  background: transparent;
  color: var(--haze-color-text);

  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  &:active {
    background: var(--haze-color-bg-muted);
  }
`;
