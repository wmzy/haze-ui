import type { ReactNode } from 'react';
import { css } from '@linaria/core';

type TagGroupProps = {
  children: ReactNode;
  className?: string;
};

const group = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-2);
  font-family: var(--haze-font-sans);
`;

export default function TagGroup({ children, className }: TagGroupProps) {
  return (
    <div x-class={[group, className]} role="group">
      {children}
    </div>
  );
}

export type { TagGroupProps };
