import { css } from '@linaria/core';

/**
 * Shared danger remap (utils/danger-remap.ts): the custom-property
 * remap that turns a solid Button from the primary family onto the
 * danger family at the button itself — Popconfirm's
 * `okVariant='danger'` and ConfirmDialog's `variant='danger'` wore
 * byte-identical copies (the two files' comments named each other as
 * the pattern's precedent).
 *
 * Custom-property remapping (not a background override) sidesteps any
 * specificity fight with Button's variant classes — the skin's own
 * declarations simply resolve against the danger tokens at this
 * element. All three states are remapped explicitly: hover/active
 * derive at the theme element, so re-deriving them from an overridden
 * `--haze-color-primary` here would not work.
 *
 * Kept out of status-solid-skin on purpose: mounting it there would
 * drag the progress/indicator fill classes into the popconfirm and
 * confirm-dialog css families via sharedLayers.
 *
 * Linaria CSS — every consumer family must be registered under
 * 'utils/danger-remap' in scripts/split-css.mjs `sharedLayers`.
 */
export const dangerRemapTokens = css`
  --haze-color-primary: var(--haze-color-danger);
  --haze-color-primary-hover: var(--haze-color-danger-hover);
  --haze-color-primary-active: var(--haze-color-danger-active);
`;
