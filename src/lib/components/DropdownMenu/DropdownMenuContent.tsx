import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuContentProps = {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
};

const content = css`
  position: absolute;
  top: 100%;
  min-width: 10rem;
  margin-top: var(--haze-space-1);
  padding: var(--haze-space-1);
  background: var(--haze-color-bg);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  box-shadow: var(--haze-shadow-md);
  z-index: 50;
`;

const alignStart = css`left: 0;`;
const alignCenter = css`left: 50%; transform: translateX(-50%);`;
const alignEnd = css`right: 0;`;

const alignMap = { start: alignStart, center: alignCenter, end: alignEnd };

export default function DropdownMenuContent({ children, align = 'start', className }: DropdownMenuContentProps) {
  const { open } = useDropdownMenuContext();

  if (!open) return null;

  return (
    <div x-class={[content, alignMap[align], className]}>
      {children}
    </div>
  );
}

export type { DropdownMenuContentProps };
