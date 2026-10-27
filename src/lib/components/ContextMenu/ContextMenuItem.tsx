import type { ReactNode } from 'react';

import { menuItemBase, menuPopupItem } from '../../utils/menu-skins';

import { useContextMenuContext } from './ContextMenuContext';

type ContextMenuItemProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function ContextMenuItem({ children, onClick, disabled, className }: ContextMenuItemProps) {
  const { setOpen, classNames } = useContextMenuContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setOpen(false);
  };

  return (
    <button
      data-slot='menu-item'
      x-class={[menuItemBase, menuPopupItem, classNames?.item, className]}
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export type { ContextMenuItemProps };
