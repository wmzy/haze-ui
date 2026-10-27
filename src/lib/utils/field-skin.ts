import { css } from '@linaria/core';

/**
 * Shared field skin — the surface chrome every haze field family paints
 * (Input, Textarea, TagInput, PromptInput, OTPInput, FileInput, and
 * NumberInput via the size map). Split out of the per-component bases
 * because they had drifted into byte-identical copies; the classes ride
 * with every consuming family's css via sharedLayers (split-css.mjs).
 *
 * Drift discipline: a declaration only lives here when every consumer
 * ships it identically. Per-field deltas (FileInput's background-
 * transitioning hover, NumberInput's background-less wrapper, OTP's
 * always-on outline reset) stay local to their components.
 */

/**
 * The field surface: border, radius and fill. No pseudo arms — sites
 * differ on hover/disabled handling, so those stay local (the input/
 * textarea pair shares its arms through `nativeFieldChrome` below).
 */
export const fieldChrome = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
`;

/**
 * The focus ring wrapper fields paint: the visual control lives inside a
 * container (TagInput, PromptInput, NumberInput, FileInput) whose own
 * focus pseudo is `:focus-within`. Leaf `<input>`/`<textarea>` fields
 * use the `:focus` arm inside `nativeFieldChrome` instead — the pseudo a
 * field focuses under is part of its public feel and is not unified.
 */
export const focusWithinRing = css`
  &:focus-within {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/**
 * The native `<input>`/`<textarea>` chrome Input and Textarea wore as
 * two byte-identical base blocks (Textarea added only `resize`).
 * Everything except the surface trio above: block sizing, typography,
 * transition, and the hover/:focus/:disabled/forced-colors arms.
 */
export const nativeFieldChrome = css`
  display: block;
  width: 100%;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  line-height: var(--haze-leading-normal);
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &::placeholder {
    color: var(--haze-color-text-muted);
  }

  &:hover {
    border-color: var(--haze-color-border-hover);
  }

  &:focus {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Forced-colors: the UA keeps the author border visible by forcing
     its color to CanvasText — restated for determinism. The box-shadow
     focus ring is dropped by the UA, so focus moves to a Highlight
     outline. Disabled inputs render GrayText at full opacity. */
  @media (forced-colors: active) {
    border-color: CanvasText;

    &:focus {
      outline: 2px solid Highlight;
    }

    &:disabled {
      opacity: 1;
      color: GrayText;
    }
  }
`;

/**
 * Shared field size skin — the per-size padding/typography classes a
 * sized field wears (Input, Textarea, NumberInput's inner input; the
 * `input-styles` / `textarea-styles` / `number-input-styles` modules
 * re-export it to keep their public constants and the ConfigProvider
 * size-tier assertions pointing at one map).
 */
export const fieldSizes = {
  sm: css`
    padding: var(--haze-space-1) var(--haze-space-2);
    font-size: var(--haze-text-sm);
  `,
  md: css`
    padding: var(--haze-space-2) var(--haze-space-3);
    font-size: var(--haze-text-sm);
  `,
  lg: css`
    padding: var(--haze-space-3) var(--haze-space-4);
    font-size: var(--haze-text-base);
  `,
} as const;
