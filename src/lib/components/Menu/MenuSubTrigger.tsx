import type { ReactNode } from 'react';

import { useSubmenuContext } from '../../utils/submenu';

import { menuItemBase, menuItemStates, menuChevron } from '../../utils/menu-skins';

import { useMenuClassNames } from './MenuContext';

type MenuSubTriggerProps = {
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

// MenuItem's skin (menuItemBase + menuItemStates, utils/menu-skins)
// plus the submenu affordances: the menuChevron inline-end arrow and a
// persistent highlight while the submenu is open (the aria-expanded
// arm baked into menuItemStates).

/**
 * The menuitem that opens a MenuSub submenu: hover opens it after a
 * short intent delay, click toggles, and the inline-end arrow (ArrowRight
 * in LTR, ArrowLeft under `dir="rtl"`) opens it with focus on its first
 * item.
 */
export default function MenuSubTrigger({
  disabled = false,
  className,
  children,
}: MenuSubTriggerProps) {
  const classNames = useMenuClassNames();
  const sub = useSubmenuContext();
  return (
    <button
      ref={sub.triggerRef}
      type='button'
      role='menuitem'
      data-slot='menu-sub-trigger'
      tabIndex={-1}
      aria-haspopup='menu'
      aria-expanded={sub.open}
      aria-owns={sub.open ? sub.contentId : undefined}
      disabled={disabled}
      x-class={[menuItemBase, menuItemStates, menuChevron, classNames?.subTrigger, className]}
      style={sub.floating.triggerStyle}
      onPointerDown={sub.floating.onTriggerPointerDown}
      onPointerEnter={sub.onTriggerPointerEnter}
      onClick={sub.floating.onTriggerClick}
      onKeyDown={sub.handleTriggerKeyDown}
    >
      {children}
    </button>
  );
}

export type { MenuSubTriggerProps };
