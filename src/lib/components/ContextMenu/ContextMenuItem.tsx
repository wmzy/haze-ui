import { MenuItemImpl, type MenuItemImplOwnProps } from '../../utils/menu-item-parts';

import { useContextMenuContext } from './ContextMenuContext';

/**
 * Plain activation item — `MenuItemImplOwnProps` (activation handler,
 * disabled/danger/icon/kbdLabel chrome, JSDoc on the shared type) minus
 * the family seam (`skin`/`familyClass`) this wrapper resolves from its
 * context. Activation fires `onClick` first, then closes the menu.
 */
type ContextMenuItemProps = Omit<MenuItemImplOwnProps, 'skin' | 'familyClass'>;

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
