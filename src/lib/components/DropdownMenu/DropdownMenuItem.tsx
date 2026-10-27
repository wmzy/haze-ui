import type { ReactNode } from 'react';

import { menuItemBase, menuItemDanger, menuItemIcon, menuItemKbd, menuPopupItem } from '../../utils/menu-skins';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuItemProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** Danger skin for destructive actions: danger-colored text and interaction states. */
  danger?: boolean;
  /** Inline-start icon slot; bare `svg` children are sized to 1em by the slot. */
  icon?: ReactNode;
  /** Inline-end shortcut hint (e.g. '⌘C'), muted and pushed to the item's end. */
  kbdLabel?: ReactNode;
  className?: string;
};

export default function DropdownMenuItem({
  children,
  onClick,
  disabled,
  danger = false,
  icon,
  kbdLabel,
  className,
}: DropdownMenuItemProps) {
  const { setOpen, triggerRef, classNames } = useDropdownMenuContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setOpen(false);
    // The menu unmounts on close; without this, keyboard focus (which is
    // on this item) would drop to <body>.
    triggerRef.current?.focus();
  };

  return (
    <button
      data-slot='menu-item'
      x-class={[menuItemBase, menuPopupItem, danger && menuItemDanger, classNames?.item, className]}
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon !== undefined && <span data-slot='icon' x-class={menuItemIcon}>{icon}</span>}
      {children}
      {kbdLabel !== undefined && (
        <span data-slot='kbd' x-class={menuItemKbd} aria-hidden="true">{kbdLabel}</span>
      )}
    </button>
  );
}

export type { DropdownMenuItemProps };
