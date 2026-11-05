import { css } from '@linaria/core';

/**
 * The drawn checkmark — the classic border-notch glyph: a 5x9 box whose
 * right and bottom borders form an L, rotated 45deg into a check.
 *
 * Geometry only (width/height/border/border-width/transform). The
 * content/position/display gating stays with each consumer, so the
 * declaration sets of glyph and consumers never overlap and no
 * specificity or source-order coupling exists between them.
 *
 * Consumers anchor ::after differently because their boxes differ:
 * CheckboxCore positions the glyph inside its 1.125rem input (top 5px,
 * left 8px — the input also carries padding from the shared choice
 * base), SelectFloating's visual checkbox inside the option row at
 * top 2px/left 5px. The glyph geometry is identical; the anchor math
 * is box-relative and stays local to each consumer.
 *
 * Deliberately physical (not logical) properties: the checkmark is
 * drawn from physical borders plus rotate(45) and stays unmirrored
 * under RTL by industry convention.
 */
export const checkMarkGlyph = css`
  &::after {
    width: 5px;
    height: 9px;
    border: solid var(--haze-color-text-inverse);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;
