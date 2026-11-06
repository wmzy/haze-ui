import { MenuItemImpl, type MenuItemImplOwnProps } from '../../utils/menu-item-parts';

import { useDropdownMenuContext } from './DropdownMenuContext';

/**
 * Plain activation item — `MenuItemImplOwnProps` (activation handler,
 * disabled/danger/icon/kbdLabel chrome, JSDoc on the shared type) minus
 * the family seam (`skin`/`familyClass`) this wrapper resolves from its
 * context. Activation fires `onClick` first, closes the menu and
 * refocuses its trigger.
 */
type DropdownMenuItemProps = Omit<MenuItemImplOwnProps, 'skin' | 'familyClass'>;

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
