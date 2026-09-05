import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { CollisionPadding } from '../../utils/collision';

import { useCallback, useId, useMemo, useRef } from 'react';
import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { useFloating } from '../../utils/floating';

import { DropdownMenuProvider } from './DropdownMenuContext';

type DropdownMenuProps = {
  open?: ControlOrValue<boolean>;
  onOpenChange?: (open: boolean) => void;
  /**
   * Viewport inset the panel treats as collision space: a number applies
   * to all four edges, an object per edge.
   */
  collisionPadding?: CollisionPadding;
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
  collisionPadding,
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

  // Stable identity: useFloatingPosition re-runs its effect on every
  // change of this object.
  const collision = useMemo(
    () => (collisionPadding === undefined ? undefined : {collisionPadding}),
    [collisionPadding]
  );

  const floating = useFloating({
    open,
    setOpen: handleSetOpen,
    triggerRef,
    panelRef: contentRef,
    animated: true,
    collision,
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
