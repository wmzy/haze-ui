import {css} from '@linaria/core';

/**
 * Shared CopyButton skin — the copy/check glyph sizing per Button size
 * and the copied feedback wash. The button chrome itself is Button's
 * (CopyButton composes a real `Button`), so only the icon steps and
 * the copied accent live here; split-css groups the emitted CSS into
 * `haze-ui/css/copy-button.css` (Button's own rules ride along via
 * the build's cross-family dependency closure).
 */

/* Glyph size follows the Button size ladder (12/16/20px — the same
 * steps the spacing scale expresses), so the icon optically centers
 * in every square button height. */
export const iconSizes = {
  sm: css`
    width: var(--haze-space-3);
    height: var(--haze-space-3);
  `,
  md: css`
    width: var(--haze-space-4);
    height: var(--haze-space-4);
  `,
  lg: css`
    width: var(--haze-space-5);
    height: var(--haze-space-5);
  `,
} as const;

/**
 * Copied-state accent: the check glyph inks success while
 * `data-copied` is set. Gated by the component to the non-solid
 * variants — success-on-primary would sit on a saturated fill where
 * the tone has no contrast; solid buttons keep their label ink and
 * the glyph swap alone carries the feedback.
 */
export const copiedSkin = css`
  &[data-copied] {
    color: var(--haze-color-success);
  }
`;
