import type { ReactNode } from 'react';
import { useContextMenuContext } from './ContextMenuContext';
import { css } from '@linaria/core';

type ContextMenuContentProps = {
  children: ReactNode;
  className?: string;
};

const content = css`
  position: fixed;
  min-width: 10rem;
  padding: var(--haze-space-1);
  background: var(--haze-color-bg);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  box-shadow: var(--haze-shadow-md);
  z-index: 100;
`;

export default function ContextMenuContent({ children, className }: ContextMenuContentProps) {
  const { open, x, y } = useContextMenuContext();

  if (!open) return null;

  return (
    <div x-class={[content, className]} style={{ left: x, top: y }}>
      {children}
    </div>
  );
}

export type { ContextMenuContentProps };
