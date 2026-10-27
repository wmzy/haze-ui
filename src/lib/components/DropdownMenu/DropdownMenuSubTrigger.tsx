import type { ReactNode } from 'react';

import { useSubmenuContext } from '../../utils/submenu';

import { menuItemBase, menuChevron, menuPopupItem } from '../../utils/menu-skins';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuSubTriggerProps = {
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

// DropdownMenuItem's skin (menuItemBase + menuPopupItem,
// utils/menu-skins) plus the submenu affordances: the menuChevron
// inline-end arrow and a persistent highlight while the submenu is
// open (the aria-expanded arm baked into menuPopupItem).

/**
 * The menuitem that opens a DropdownMenuSub submenu: hover opens it after
 * a short intent delay, click toggles, and the inline-end arrow
 * (ArrowRight in LTR, ArrowLeft under `dir="rtl"`) opens it with focus on
 * its first item.
 */
export default function DropdownMenuSubTrigger({
  disabled = false,
  className,
  children,
}: DropdownMenuSubTriggerProps) {
  const classNames = useDropdownMenuContext().classNames;
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
      x-class={[menuItemBase, menuPopupItem, menuChevron, classNames?.subTrigger, className]}
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

export type { DropdownMenuSubTriggerProps };
