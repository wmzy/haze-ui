import type { ReactNode } from 'react';

import { useMenuRadioItem } from '../../utils/menuRadio';

import { MenuRadioItemImpl } from '../../utils/menu-item-parts';

import { useMenuClassNames } from './MenuContext';

type MenuRadioItemProps = {
  /** Value this option selects in its MenuRadioGroup when activated. */
  value: string;
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
