import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useRef } from 'react';
import { useControl } from 'react-use-control';

import { FloatingPanel, useFloating } from '../../utils/floating';
import { useMenuKeyboard, useRovingTabindex } from '../../utils/menuKeyboard';

type MenuProps = {
  open?: Control<boolean> | boolean;
  trigger?: ReactNode;
  className?: string;
  children: ReactNode;
};

const container = css`
  position: relative;
  display: inline-flex;
`;

const panel = css`
  min-width: 160px;
  padding: var(--haze-space-1) 0;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);
`;

export default function Menu({
  open: openControl,
  trigger,
  className,
  children,
}: MenuProps) {
  const [open, setOpen] = useControl(openControl, false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const floating = useFloating({ open, setOpen, triggerRef, panelRef });

  useRovingTabindex({ menuRef: panelRef, active: open });
  const handleKeyDown = useMenuKeyboard({
    menuRef: panelRef,
    onClose: () => setOpen(false),
  });

  return (
    <div x-class={container}>
      <span
        ref={triggerRef}
        style={floating.triggerStyle}
        onPointerDown={floating.onTriggerPointerDown}
        onClick={floating.onTriggerClick}
      >
        {trigger}
      </span>
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement="bottom"
        role="menu"
        visualClass={panel}
        className={className}
        onKeyDown={handleKeyDown}
      >
        {children}
      </FloatingPanel>
    </div>
  );
}

export type { MenuProps };
