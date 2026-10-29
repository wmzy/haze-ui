import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useCallback } from 'react';

import { classnames } from '../../utils/classnames';
import { FloatingPanel } from '../../utils/floating';
import { useFocusScope } from '../../utils/focus-scope';
import { useMenuKeyboard, useRovingTabindex } from '../../utils/menuKeyboard';
import { menuPanel } from '../../utils/menu-skins';

import { useContextMenuContext } from './ContextMenuContext';

type ContextMenuContentProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Point-positioned panel: fixed at the cursor coordinates recorded by the
 * trigger, so no anchor/JS placement runs (`placement` stays unset). The
 * surface skin itself is the shared menuPanel; this class adds only the
 * point-positioning chrome.
 */
const positioned = css`
  position: fixed;
  z-index: var(--haze-z-overlay);
`;

export default function ContextMenuContent({
  children,
  className,
}: ContextMenuContentProps) {
  const { open, setOpen, x, y, contentRef, floating, classNames } =
    useContextMenuContext();

  const handleKeyDown = useMenuKeyboard({
    menuRef: contentRef,
    onClose: () => setOpen(false),
  });

  useRovingTabindex({ menuRef: contentRef, active: open });

  // Declared after useRovingTabindex: its sync effect must have set the
  // first item as the tab stop before autoFocus looks for a tabbable.
  // Gated on `shown` (not `open`): this is a child effect — it runs
  // before the root's showPopover() effect, and focusing a native
  // popover while it is still display:none is silently dropped
  // (Chromium). `shown` flips only once the panel is focusable.
  // On close the scope returns focus to whatever was focused before the
  // menu opened (the right-click target).
  const setScope = useFocusScope({
    enabled: open && floating.shown,
    autoFocus: true,
    returnFocus: true,
  });

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      setScope(node);
    },
    [contentRef, setScope]
  );

  // Animated exit: the panel stays mounted (fading out via
  // data-state=closed) until the exit settles — `exited` starts true
  // before the first open, so a never-opened menu renders nothing.
  if (!open && floating.exited) return null;

  return (
    <FloatingPanel
      ref={setPanelRef}
      behavior={floating}
      role="menu"
      visualClass={`${menuPanel} ${positioned}`}
      className={classnames(className, classNames?.content)}
      style={{ left: x, top: y }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </FloatingPanel>
  );
}

export type { ContextMenuContentProps };
