import type { Ref } from 'react';

import { css } from '@linaria/core';

import { SpinnerGlyph, spinAnimation } from '../../utils/spinner-glyph';

import { useStrings } from '../LocaleProvider';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Forwarded to the root span (data-slot='spinner'). */
  ref?: Ref<HTMLSpanElement>;
};

const base = css`
  display: inline-flex;

  /* Forced-colors: the UA flattens both svg strokes onto CanvasText —
     the arc would merge into the full ring and the glyph would stop
     reading as loading. System colors survive the override, so the
     rest ring renders GrayText and the spinning arc CanvasText (the
     motion still distinguishes them; reduced-motion parks the arc on
     the rest frame where the two grays keep the circle visible). */
  @media (forced-colors: active) {
    & svg circle {
      stroke: GrayText;
    }

    & svg path {
      stroke: CanvasText;
    }
  }
`;

/* The glyph and the spin loop (incl. the reduced-motion collapse) come
 * from utils/spinner-glyph.tsx — shared with Toast's loading variant. */

const sizes = {
  sm: css`
    width: 16px;
    height: 16px;
  `,
  md: css`
    width: 24px;
    height: 24px;
  `,
  lg: css`
    width: 32px;
    height: 32px;
  `,
} as const;

export default function Spinner({
  size = 'md',
  className,
  ref,
}: SpinnerProps) {
  const strings = useStrings('spinner');
  return (
    <span
      ref={ref}
      data-slot='spinner'
      role="status"
      aria-label={strings.loading}
      x-class={[base, spinAnimation, sizes[size], className]}
    >
      <SpinnerGlyph />
    </span>
  );
}

export type { SpinnerProps };
