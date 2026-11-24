import type { ComponentPropsWithRef, ElementType } from 'react';

import {
  MenuItemImpl,
  type MenuItemChromeProps,
  type MenuItemImplOwnProps,
} from '../../utils/menu-item-parts';

import { useMenuClassNames } from './MenuContext';

/** A plain item's own props: the activation handler plus the item
 * chrome every family's item exposes (utils/menu-item-parts — the
 * prop docs live on the shared type). */
type MenuItemOwnProps = {
  onSelect?: () => void;
} & MenuItemChromeProps;

/**
 * Polymorphic like Button's `as`: the item skin and the menuitem wiring
 * (role, roving tabIndex, disabled/aria handling) always land on the
 * rendered element; the target's own props flow through. `as='a'`
 * renders a navigation menuitem with link semantics (href).
 */
type MenuItemProps<T extends ElementType = 'button'> = MenuItemOwnProps & {
  /** Render element — 'button' (default) or 'a' (or a router Link
   * component forwarding props to an anchor). */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof MenuItemOwnProps | 'as'>;

export default function MenuItem<T extends ElementType = 'button'>({
  onSelect,
  disabled = false,
  danger = false,
  icon,
  kbdLabel,
  className,
  children,
  as,
  ...rest
}: MenuItemProps<T>) {
  const classNames = useMenuClassNames();
  return (
    <MenuItemImpl<T>
      as={as}
      skin='menu'
      familyClass={classNames?.item}
      disabled={disabled}
      danger={danger}
      icon={icon}
      kbdLabel={kbdLabel}
      className={className}
      onClick={onSelect}
      {...(rest as Omit<ComponentPropsWithRef<T>, keyof MenuItemImplOwnProps | 'as'>)}
    >
      {children}
    </MenuItemImpl>
  );
}

export type { MenuItemOwnProps, MenuItemProps };
