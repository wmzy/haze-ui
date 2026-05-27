import type { ReactNode } from 'react';
import { useContextMenuContext } from './ContextMenuContext';
import { css } from '@linaria/core';

type ContextMenuTriggerProps = {
  children: ReactNode;
  className?: string;
};

const trigger = css`
  display: contents;
`;

export default function ContextMenuTrigger({ children, className }: ContextMenuTriggerProps) {
  const { setOpen, setPosition } = useContextMenuContext();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition(e.clientX, e.clientY);
    setOpen(true);
  };

  return (
    <div x-class={[trigger, className]} onContextMenu={handleContextMenu}>
      {children}
    </div>
  );
}

export type { ContextMenuTriggerProps };
