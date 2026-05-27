import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';
import { DropdownMenuProvider } from './DropdownMenuContext';

type DropdownMenuProps = {
  open?: Control<boolean> | boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
};

const wrapper = css`
  position: relative;
  display: inline-block;
`;

export default function DropdownMenu({
  open: openControl,
  onOpenChange,
  children,
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSetOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(open) : value;
      setOpen(next);
      onOpenChange?.(next);
    },
    [open, setOpen, onOpenChange],
  );

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
    <DropdownMenuProvider value={{ open, setOpen: handleSetOpen }}>
      <div ref={ref} x-class={[wrapper, className]}>
        {children}
      </div>
    </DropdownMenuProvider>
  );
}

export type { DropdownMenuProps };
