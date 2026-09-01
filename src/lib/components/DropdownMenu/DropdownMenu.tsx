import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { useCallback, useId, useRef } from 'react';
import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { useFloating } from '../../utils/floating';

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
  const [open, setOpen] = useControl(openControl, false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  const focusRequestRef = useRef<'first' | 'last' | null>(null);

  const handleSetOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(open) : value;
      setOpen(next);
      onOpenChange?.(next);
    },
    [open, setOpen, onOpenChange]
  );

  const floating = useFloating({
    open,
    setOpen: handleSetOpen,
    triggerRef,
    panelRef: contentRef,
  });

  return (
    <DropdownMenuProvider
      value={{
        open,
        setOpen: handleSetOpen,
        triggerRef,
        contentRef,
        contentId,
        focusRequestRef,
        floating,
      }}
    >
      <div x-class={[wrapper, className]}>{children}</div>
    </DropdownMenuProvider>
  );
}

export type { DropdownMenuProps };
