import { useMenuRadioItem } from '../../utils/menuRadio';

import {
  MenuRadioItemImpl,
  type MenuItemChromeProps,
} from '../../utils/menu-item-parts';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuRadioItemProps = {
  /** Value this option selects in its DropdownMenuRadioGroup when activated. */
  value: string;
} & MenuItemChromeProps;

/**
 * One option of a DropdownMenuRadioGroup (`role="menuitemradio"`):
 * activating it (click, Enter, Space) selects its `value` in the
 * group — the previously selected sibling deselects. Selecting keeps
 * the menu open. Must live inside a `DropdownMenuRadioGroup`.
 */
export default function DropdownMenuRadioItem({
  value,
  disabled,
  danger,
  icon,
  kbdLabel,
  className,
  children,
}: DropdownMenuRadioItemProps) {
  // Radio-group context first — an item outside a radio group throws
  // the radio error even when it is also outside its DropdownMenu.
  const { checked, select } = useMenuRadioItem(value);
  const classNames = useDropdownMenuContext().classNames;
  return (
    <MenuRadioItemImpl
      skin='popup'
      familyClass={classNames?.radioItem}
      checked={checked}
      onSelect={select}
      disabled={disabled}
      danger={danger}
      icon={icon}
      kbdLabel={kbdLabel}
      className={className}
    >
      {children}
    </MenuRadioItemImpl>
  );
}

export type { DropdownMenuRadioItemProps };
