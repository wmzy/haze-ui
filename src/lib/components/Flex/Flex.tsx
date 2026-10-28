import type {CSSProperties, ReactNode} from 'react';

import {css} from '@linaria/core';

type FlexProps = {
  direction?: 'row' | 'column';
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  /** Space-scale step (Grid/Masonry convention): a number resolves to
   * `var(--haze-space-N)`; strings pass through untouched (arbitrary
   * values, e.g. `'var(--haze-space-2)'`). */
  gap?: string | number;
  wrap?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

const base = css`
  display: flex;
`;

export default function Flex({
  direction = 'row',
  align,
  justify,
  gap,
  wrap = false,
  className,
  style: styleProp,
  children,
}: FlexProps) {
  const style: CSSProperties = {
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    // Numeric gap is a space-scale step, same as Grid/Masonry — the
    // inline style stays token-based so compact density and theme
    // overrides keep working (a raw `${gap}px` bypassed both).
    gap: typeof gap === 'number' ? `var(--haze-space-${gap})` : gap,
    flexWrap: wrap ? 'wrap' : undefined,
    ...styleProp,
  };

  return (
    <div data-slot='flex' x-class={[base, className]} style={style}>
      {children}
    </div>
  );
}

export type {FlexProps};
