import {
  MenuCheckboxItemImpl,
  type MenuCheckboxItemStateProps,
  type MenuItemChromeProps,
} from '../../utils/menu-item-parts';

import { useDropdownMenuContext } from './DropdownMenuContext';

/** A toggleable item's props: the checkbox state plus the item chrome —
 * both the impl's own prop groups (utils/menu-item-parts, where the
 * prop docs live). */
type DropdownMenuCheckboxItemProps = MenuCheckboxItemStateProps &
  MenuItemChromeProps;

/**
 * A toggleable menu option (`role="menuitemcheckbox"`): click, Enter or
 * Space flips `checked`; the state is controllable through the standard
 * `ControlOrValue` prop. Toggling keeps the menu open — several options
 * are typically flipped in one visit (unlike a plain item, which
 * closes the menu on activation).
 */
export default function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  disabled,
  danger,
  icon,
  kbdLabel,
  className,
  children,
}: DropdownMenuCheckboxItemProps) {
  const classNames = useDropdownMenuContext().classNames;
  return (
    <MenuCheckboxItemImpl
      skin='popup'
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

export type { DropdownMenuCheckboxItemProps };
