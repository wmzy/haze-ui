import type { ReactNode } from 'react';

import { FloatingPanel } from '../../utils/floating';
import { menuPanelLg } from '../../utils/menu-skins';
import { useSubmenuContext } from '../../utils/submenu';

import { useMenuClassNames } from './MenuContext';

type MenuSubContentProps = {
  className?: string;
  children: ReactNode;
};

// Same visual skin as the Menu panel (menuPanelLg, utils/menu-skins);
// the placement classes put it at the trigger's inline end (mirrored
// under dir='rtl' by the floating placement layer).

/**
 * The panel of a MenuSub submenu. Resident like the Menu panel itself
 * (hidden through the floating lifecycle while closed); keyboard focus
 * is contained to this level — Escape closes only this submenu.
 */
export default function MenuSubContent({
  className,
  children,
}: MenuSubContentProps) {
  const classNames = useMenuClassNames();
  const sub = useSubmenuContext();
  return (
    <FloatingPanel
      ref={sub.contentRef}
      behavior={sub.floating}
      placement='right'
      id={sub.contentId}
      role='menu'
      visualClass={menuPanelLg}
      className={[className, classNames?.subContent].filter(Boolean).join(' ') || undefined}
      onKeyDown={sub.contentKeyDown}
    >
      {children}
    </FloatingPanel>
  );
}

export type { MenuSubContentProps };
