import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useCallback, useRef } from 'react';
import { useControl } from 'react-use-control';

import { FloatingPanel, useFloating } from '../../utils/floating';
import { useFocusScope } from '../../utils/focus-scope';
import { useMenuKeyboard, useRovingTabindex } from '../../utils/menuKeyboard';

type MenuProps = {
  open?: ControlOrValue<boolean>;
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

  const floating = useFloating({ open, setOpen, triggerRef, panelRef, animated: true });

  useRovingTabindex({ menuRef: panelRef, active: open });
  const handleKeyDown = useMenuKeyboard({
    menuRef: panelRef,
    onClose: () => setOpen(false),
  });

  // Declared after useFloating and useRovingTabindex: the showPopover
  // effect (a native popover is display:none until shown — focusing it
  // would be silently dropped in Chromium) and the roving sync (the
  // first item must be the tab stop before autoFocus runs) both fire
  // first in the same commit. returnFocus repairs the Escape gap: the
  // hidden panel would otherwise leave focus on <body>.
  const setScope = useFocusScope({ enabled: open, autoFocus: true, returnFocus: true });

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      setScope(node);
    },
    [panelRef, setScope]
  );

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
        ref={setPanelRef}
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
