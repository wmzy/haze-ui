import { useMenuRadioItem } from '../../utils/menuRadio';

import {
  MenuRadioItemImpl,
  type MenuItemChromeProps,
} from '../../utils/menu-item-parts';

import { useMenuClassNames } from './MenuContext';

type MenuRadioItemProps = {
  /** Value this option selects in its MenuRadioGroup when activated. */
  value: string;
} & MenuItemChromeProps;

/**
 * One option of a MenuRadioGroup (`role="menuitemradio"`): activating
 * it (click, Enter, Space) selects its `value` in the group — the
 * previously selected sibling deselects. Must live inside a
 * `MenuRadioGroup`.
 */
export default function MenuRadioItem({
  value,
  disabled,
  danger,
  icon,
  kbdLabel,
  className,
  children,
}: MenuRadioItemProps) {
  const classNames = useMenuClassNames();
  const { checked, select } = useMenuRadioItem(value);
  return (
    <MenuRadioItemImpl
      skin='menu'
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

export type { MenuRadioItemProps };
