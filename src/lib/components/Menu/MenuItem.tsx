import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';

import { MenuItemShell, type MenuItemShellOwnProps } from '../../utils/menu-item-parts';

import { useMenuClassNames } from './MenuContext';

type MenuItemOwnProps = {
  onSelect?: () => void;
  disabled?: boolean;
  /** Danger skin for destructive actions: danger-colored text and interaction states. */
  danger?: boolean;
  /** Inline-start icon slot; bare `svg` children are sized to 1em by the slot. */
  icon?: ReactNode;
  /** Inline-end shortcut hint (e.g. '⌘C'), muted and pushed to the item's end. */
  kbdLabel?: ReactNode;
  className?: string;
  children: ReactNode;
};

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
    <MenuItemShell<T>
      as={as}
      skin='menu'
      itemRole='menuitem'
      itemSlot='menu-item'
      familyClass={classNames?.item}
      disabled={disabled}
      danger={danger}
      icon={icon}
      kbdLabel={kbdLabel}
      className={className}
      onClick={onSelect}
      {...(rest as Omit<ComponentPropsWithRef<T>, keyof MenuItemShellOwnProps | 'as'>)}
    >
      {children}
    </MenuItemShell>
  );
}

export type { MenuItemOwnProps, MenuItemProps };
