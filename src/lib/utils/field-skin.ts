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
 * The de-chromed inner control a multi-child field paints inside its
 * chrome container (TagInput's input, PromptInput's and ChatInput's
 * textareas, NumberInput's inner number input): no border, no
 * outline, the field ink and the sans face — the surface lives on the
 * wrapper composing `fieldChrome`/`focusWithinRing` above.
 *
 * Drift discipline, applied strictly: only the quartet's literally
 * shared declarations ride here. The fill stays local (three sites
 * paint `background: none` over the wrapper's chrome; NumberInput's
 * inner input paints its own bg), and so do font-size/padding —
 * NumberInput pairs this class with `fieldSizes` for them, and a
 * shared declaration would tie that size map's specificity (dev
 * import-order injection and the dist split-css order disagree — see
 * utils/quiet-button-skin.ts). Companion classes are additive by
 * property, never contending with the size map.
 */
export const fieldBareInner = css`
  border: none;
  outline: none;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
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
 * The resize affordance a textarea-shaped field wears (Textarea,
 * Mentions' textarea): the UA drag handle on the block, inline-end
 * corner. The box model it stretches (Mentions keeps width:100% and
 * the border inside the box) stays a per-site companion class —
 * consumers differ on it, so it does not ride here.
 */
export const fieldResizeHandle = css`
  resize: vertical;
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

/**
 * Shared picker field input — the input surface every date/time picker
 * family puts an `<input>` behind (Datepicker's readonly trigger and
 * `showTime` footer input at the sm size, TimePicker's readonly trigger
 * and native core input, DateRangePicker's start/end inputs). Split out
 * of five per-component copies that had drifted into near-identical
 * blocks; the classes ride with every consuming family's css through
 * sharedLayers (split-css.mjs).
 *
 * Drift discipline as above: only what every picker input ships — the
 * surface, typography and the focus ring. The readonly triggers'
 * `cursor: pointer`, widths, `line-height`, tabular figures and the
 * :disabled/::placeholder arms only some sites carry stay local to
 * their components as companion classes (composed additively — no
 * property overlaps).
 */
export const pickerFieldInput = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  padding: var(--haze-space-2) var(--haze-space-3);
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &:focus {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/**
 * The sm variant of {@link pickerFieldInput}: `radius-sm` and one step
 * tighter padding — Datepicker's `showTime` footer input. A literal
 * sibling (not an override class) so the two sizes never contend in
 * the cascade, mirroring the `fieldSizes` map above.
 */
export const pickerFieldInputSm = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  padding: var(--haze-space-1) var(--haze-space-2);
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &:focus {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/**
 * The field-flavored focus ring as a standalone leaf: `:focus` (not
 * :focus-visible — text entry IS pointer focus) repaints the border
 * primary and wears the ring. Leaf sites that compose their own
 * surface — OTP cells and future field-shaped leaves — consume this
 * instead of hand-rolling. Border-less leaf surfaces keep their local
 * `border-color` delta arm.
 *
 * Self-exception, kept deliberate: the module's own
 * `nativeFieldChrome` and the `pickerFieldInput` pair above do NOT
 * compose this leaf — they carry the identical arm inline. A css
 * template cannot inline another class's declarations (interpolating
 * a class yields only a selector reference, never its rules), so
 * reuse would mean shipping the arm as a second class every consumer
 * must remember to add — and a class whose resolved look depends on
 * another class's presence is an injection-order hazard (dev
 * import-order injection and the dist split-css grouping order
 * disagree; utils/quiet-button-skin documents the trap). Each
 * ring-bearing class therefore stays self-contained: one class, the
 * complete focus visual.
 */
export const fieldFocusRing = css`
  &:focus {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;
