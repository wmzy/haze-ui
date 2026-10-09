import {css} from '@linaria/core';

/**
 * Shared Button skin — the base, variant and size classes `Button` and
 * `ButtonLink` both wear. Living in their own module keeps the two
 * components' visual contract in one place (one edit re-skins both) and
 * keeps component files free of style internals; split-css groups the
 * emitted CSS into `haze-ui/css/button.css` with them.
 *
 * ## Component-level tokens
 *
 * The skin exposes component-scoped custom properties for per-component
 * theming. The library never *defines* them — every usage below is a
 * fallback chain, so the shipped look is the fallback until a consumer
 * sets the variable on `:root` or any ancestor (scoping is plain CSS
 * inheritance: set it on a wrapper to retheme only that subtree):
 *
 * - `--haze-button-height-sm` / `-md` / `-lg` — height per size
 *   (fallback `auto`: content-driven, the unchanged shipped look)
 * - `--haze-button-font-size-sm` / `-md` / `-lg` — label size per size
 *   (fallbacks `--haze-text-sm` / `--haze-text-sm` / `--haze-text-base`)
 * - `--haze-button-radius` — corner radius (fallback `--haze-radius-md`)
 *
 * `Button`, `ButtonLink`, `Toggle` and the Toolbar items all wear this
 * skin, so one variable rethemes the whole family.
 */

export const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--haze-space-2);
  border: 1px solid transparent;
  border-radius: var(--haze-button-radius, var(--haze-radius-md));
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
  line-height: var(--haze-leading-tight);
  cursor: pointer;
  transition:
    background var(--haze-duration-fast),
    color var(--haze-duration-fast),
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);
  user-select: none;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Windows high contrast (forced-colors): the UA squashes every
     author color, drops box-shadows and forces existing borders to the
     text color. The base's transparent 1px border therefore survives
     as a ButtonText boundary already — restating it keeps ghost/link
     buttons deterministic instead of relying on the UA default. The
     box-shadow focus ring is dropped by the UA, so keyboard focus
     moves to a real outline in the Highlight system color. Disabled
     surfaces render in GrayText at full opacity (the 0.5 dim reads as
     noise against a two-color canvas). */
  @media (forced-colors: active) {
    border-color: ButtonText;

    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 1;
      color: GrayText;
    }
  }
`;

export const variants = {
  solid: css`
    background: var(--haze-color-primary);
    color: var(--haze-color-text-inverse);

    &:hover {
      background: var(--haze-color-primary-hover);
    }

    &:active {
      background: var(--haze-color-primary-active);
    }
  `,
  outline: css`
    background: transparent;
    border-color: var(--haze-color-border);
    color: var(--haze-color-text);

    &:hover {
      border-color: var(--haze-color-border-hover);
      background: var(--haze-color-bg-subtle);
    }

    &:active {
      background: var(--haze-color-bg-muted);
    }
  `,
  ghost: css`
    background: transparent;
    color: var(--haze-color-text);

    &:hover {
      background: var(--haze-color-bg-subtle);
    }

    &:active {
      background: var(--haze-color-bg-muted);
    }
  `,
} as const;

export const sizeSm = css`
  height: var(--haze-button-height-sm, auto);
  padding: var(--haze-space-1) var(--haze-space-3);
  font-size: var(--haze-button-font-size-sm, var(--haze-text-sm));
`;

export const sizeMd = css`
  height: var(--haze-button-height-md, auto);
  padding: var(--haze-space-2) var(--haze-space-4);
  font-size: var(--haze-button-font-size-md, var(--haze-text-sm));
`;

export const sizeLg = css`
  height: var(--haze-button-height-lg, auto);
  padding: var(--haze-space-3) var(--haze-space-6);
  font-size: var(--haze-button-font-size-lg, var(--haze-text-base));
`;

export const squareSm = css`
  height: var(--haze-button-height-sm, auto);
  padding: var(--haze-space-1);
  font-size: var(--haze-button-font-size-sm, var(--haze-text-sm));
`;

export const squareMd = css`
  height: var(--haze-button-height-md, auto);
  padding: var(--haze-space-2);
  font-size: var(--haze-button-font-size-md, var(--haze-text-sm));
`;

export const squareLg = css`
  height: var(--haze-button-height-lg, auto);
  padding: var(--haze-space-3);
  font-size: var(--haze-button-font-size-lg, var(--haze-text-base));
`;

export const sizes = {
  sm: sizeSm,
  md: sizeMd,
  lg: sizeLg,
} as const;

export const squareSizes = {
  sm: squareSm,
  md: squareMd,
  lg: squareLg,
} as const;

/**
 * Layout conduit for the button's children. Button previously spread
 * children directly under its inline-flex row (icon + text laid out by
 * the row's `gap`); the busy state needs every child wrapped in one
 * span so it can be gridded against the indicator. This class
 * replicates the parent flex context (same gap, same alignment), so
 * wrapping the children changes nothing visually for non-busy buttons.
 */
export const label = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: inherit;
`;

/**
 * Anchor reset for the button skin worn by an `<a>` (Button `as='a'`
 * and ButtonLink): anchors bring a UA underline; a button-looking link
 * resets it (variants already own the color).
 *
 * Anchor-shaped disabled: Button's :disabled has no meaning on an `<a>`,
 * so the state is driven by `aria-disabled` (callers pair it with
 * tabIndex={-1} to drop the link from the focus order). Busy anchors
 * skip the opacity dim — like Button's busy state they should look
 * active, not dead — while keeping click suppression.
 */
export const link = css`
  text-decoration: none;

  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &[aria-busy='true'] {
    opacity: 1;
    cursor: progress;
  }

  /* Forced-colors: the anchor shape cannot carry Button base's
   * :disabled rule, so the GrayText restatement lives here. */
  @media (forced-colors: active) {
    &[aria-disabled='true'] {
      opacity: 1;
      color: GrayText;
    }
  }
`;

/**
 * Busy state (Button `loading`). Grid stacking keeps the busy swap
 * width-stable: the label span and the indicator span share
 * grid-area 1/1 (gap is inert across a shared cell), so the widest of
 * the two drives the cell and the label box keeps sizing the control.
 * `color: transparent` hides the label's ink without removing it from
 * the accessibility tree — visibility: hidden would strip the button's
 * accessible name mid-request. The indicator sits on top, centered.
 *
 * cursor: progress reads "working" instead of the base's not-allowed
 * (the control is temporarily unavailable, not forbidden).
 */
export const loading = css`
  display: inline-grid;
  cursor: progress;

  & > [data-slot='label'],
  & > [data-slot='indicator'] {
    grid-area: 1 / 1;
  }

  & > [data-slot='label'] {
    color: transparent;
  }

  & > [data-slot='indicator'] {
    place-self: center;
    pointer-events: none;
  }

  /* Spinner strokes inherit the variant's text color — the token
   * values would sit invisible on a solid primary background. */
  & > [data-slot='indicator'] svg path {
    stroke: currentColor;
  }

  & > [data-slot='indicator'] svg circle {
    stroke: currentColor;
    opacity: 0.3;
  }

  /* A busy button keeps opacity 1: the whole point of loading is to
   * look active. The base's :disabled {opacity: .5} applies because
   * loading forces disabled, so restate it. */
  &:disabled {
    opacity: 1;
  }

  @media (forced-colors: active) {
    & > [data-slot='label'] {
      color: GrayText;
    }

    & > [data-slot='indicator'] svg path {
      stroke: ButtonText;
    }

    & > [data-slot='indicator'] svg circle {
      stroke: GrayText;
      opacity: 1;
    }
  }
`;
