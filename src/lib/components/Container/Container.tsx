import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type ContainerProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
  className?: string;
};

const container = css`
  width: 100%;
  margin-inline: auto;
  padding-inline: var(--haze-space-4);
  font-family: var(--haze-font-sans);
`;

// `satisfies` ties every size variant to a skin entry: extending the
// union in ContainerProps without a map row (or adding a stray row)
// fails at compile time instead of rendering an undefined class.
const sizes = {
  sm: css`max-width: 640px;`,
  md: css`max-width: 768px;`,
  lg: css`max-width: 1024px;`,
  xl: css`max-width: 1280px;`,
  full: css`max-width: 100%;`,
} satisfies Record<NonNullable<ContainerProps['size']>, string>;

export default function Container({ size = 'lg', children, className }: ContainerProps) {
  return (
    <div data-slot='container' x-class={[container, sizes[size], className]}>
      {children}
    </div>
  );
}

export type { ContainerProps };
