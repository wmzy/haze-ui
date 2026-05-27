import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type GridProps = {
  columns?: number;
  gap?: number;
  className?: string;
  children: ReactNode;
};

const base = css`
  display: grid;
`;

export default function Grid({
  columns = 12,
  gap = 4,
  className,
  children,
}: GridProps) {
  return (
    <div
      x-class={[base, className]}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `var(--haze-space-${gap})`,
      }}
    >
      {children}
    </div>
  );
}

export type { GridProps };
