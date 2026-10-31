import type { ReactNode } from 'react';

import { MenuItemImpl } from '../../utils/menu-item-parts';

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
    <MenuItemImpl
      skin='popup'
      familyClass={classNames?.item}
      disabled={disabled}
      danger={danger}
      icon={icon}
      kbdLabel={kbdLabel}
      className={className}
      onClick={handleClick}
    >
      {children}
    </MenuItemImpl>
  );
}

export type { DropdownMenuItemProps };
