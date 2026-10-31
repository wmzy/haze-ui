import type { ReactNode } from 'react';

import { MenuItemImpl } from '../../utils/menu-item-parts';

import { useContextMenuContext } from './ContextMenuContext';

type ContextMenuItemProps = {
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

export default function ContextMenuItem({
  children,
  onClick,
  disabled,
  danger = false,
  icon,
  kbdLabel,
  className,
}: ContextMenuItemProps) {
  const { setOpen, classNames } = useContextMenuContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setOpen(false);
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

export type { ContextMenuItemProps };
