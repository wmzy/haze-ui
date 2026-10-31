import type { ReactNode } from 'react';

import { useMenuRadioItem } from '../../utils/menuRadio';

import { MenuRadioItemImpl } from '../../utils/menu-item-parts';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuRadioItemProps = {
  /** Value this option selects in its DropdownMenuRadioGroup when activated. */
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
