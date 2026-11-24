import {
  MenuCheckboxItemImpl,
  type MenuCheckboxItemStateProps,
  type MenuItemChromeProps,
} from '../../utils/menu-item-parts';

import { useMenuClassNames } from './MenuContext';

/** A toggleable item's props: the checkbox state plus the item chrome —
 * both the impl's own prop groups (utils/menu-item-parts, where the
 * prop docs live). */
type MenuCheckboxItemProps = MenuCheckboxItemStateProps & MenuItemChromeProps;

/**
 * A toggleable menu option (`role="menuitemcheckbox"`): click, Enter or
 * Space flips `checked`; the state is controllable through the standard
 * `ControlOrValue` prop. Unlike a plain item, toggling does not close
 * the menu — several options are typically flipped in one visit.
 */
export default function MenuCheckboxItem({
  checked,
  onCheckedChange,
  disabled,
  danger,
  icon,
  kbdLabel,
  className,
  children,
}: MenuCheckboxItemProps) {
  const classNames = useMenuClassNames();
  return (
    <MenuCheckboxItemImpl
      skin='menu'
      familyClass={classNames?.checkboxItem}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      danger={danger}
      icon={icon}
      kbdLabel={kbdLabel}
      className={className}
    >
      {children}
    </MenuCheckboxItemImpl>
  );
}

export type { MenuCheckboxItemProps };
