import type { ReactNode } from 'react';

import { classnames } from '../../utils/classnames';
import { FloatingPanel } from '../../utils/floating';
import { menuPanel } from '../../utils/menu-skins';
import { useSubmenuContext } from '../../utils/submenu';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuSubContentProps = {
  className?: string;
  children: ReactNode;
};

// Same visual skin as DropdownMenuContent (menuPanel, utils/menu-skins);
// the placement classes put it at the trigger's inline end (mirrored
// under dir='rtl' by the floating placement layer).

/**
 * The panel of a DropdownMenuSub submenu. Unmounts once closed, like
 * DropdownMenuContent (the animated exit keeps it mounted through the
 * fade); keyboard focus is contained to this level — Escape closes only
 * this submenu.
 */
export default function DropdownMenuSubContent({
  className,
  children,
}: DropdownMenuSubContentProps) {
  const classNames = useDropdownMenuContext().classNames;
  const sub = useSubmenuContext();
  if (!sub.open && sub.floating.exited) return null;
  return (
    <FloatingPanel
      ref={sub.contentRef}
      behavior={sub.floating}
      placement='right'
      id={sub.contentId}
      role='menu'
      visualClass={menuPanel}
      className={classnames(className, classNames?.subContent)}
      onKeyDown={sub.contentKeyDown}
    >
      {children}
    </FloatingPanel>
  );
}

export type { DropdownMenuSubContentProps };
