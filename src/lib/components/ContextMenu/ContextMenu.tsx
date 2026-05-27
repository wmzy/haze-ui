import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';
import { ContextMenuProvider } from './ContextMenuContext';

type ContextMenuProps = {
  open?: Control<boolean> | boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
};

const wrapper = css`
  position: relative;
  display: inline-block;
`;

export default function ContextMenu({
  open: openControl,
  onOpenChange,
  children,
  className,
}: ContextMenuProps) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleSetOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(open) : value;
      setOpen(next);
      onOpenChange?.(next);
    },
    [open, setOpen, onOpenChange],
  );

  const setPosition = useCallback((px: number, py: number) => {
    setX(px);
    setY(py);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handleSetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, handleSetOpen]);

  return (
    <ContextMenuProvider value={{ open, setOpen: handleSetOpen, x, y, setPosition }}>
      <div ref={ref} x-class={[wrapper, className]}>
        {children}
      </div>
    </ContextMenuProvider>
  );
}

export type { ContextMenuProps };
