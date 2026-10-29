import { css } from '@linaria/core';

import { ChevronRight } from '../icons';

/** The rotate transition every disclosure chevron animates on. The
 * glyph itself never declares `transform` — consumers own the rotation
 * (utils/timeline-skin's `chevronPair` arms, or their own wrapper) —
 * so this only makes those rotations animate. It rides the svg, not a
 * wrapper span, so consumers that rotate the glyph directly (Sources)
 * animate too; for span-rotating consumers it is inert (their svg
 * never transforms). */
const spin = css`
  transition: transform var(--haze-duration-fast) var(--haze-ease);
`;

type DisclosureChevronProps = {
  /** Rendered box size in px: 12 for the full-size disclosure rows
   * (JsonView/Trace, the default), 10 for Sources' inline toggle. */
  size?: number;
  /** Extra svg classes — e.g. timeline-skin's `chevronPair.open` arm
   * when the glyph itself is the rotation target. */
  className?: string;
};

/**
 * The disclosure chevron shared by the expandable data families
 * (JsonView, Trace, Sources): lucide's ChevronRight at the caller's px
 * size with the stroke compensated for the 24-unit viewBox — a stroke
 * renders at size/24 of its nominal width, so `36 / size` keeps the
 * shipped 1.5px rendered stroke (12px → 3, 10px → 3.6; StepTimeline
 * precedent). Always decorative: aria-hidden, unfocusable.
 */
export function DisclosureChevron({ size = 12, className }: DisclosureChevronProps) {
  return (
    <ChevronRight
      size={size}
      strokeWidth={36 / size}
      aria-hidden='true'
      focusable='false'
      x-class={[spin, className]}
    />
  );
}
