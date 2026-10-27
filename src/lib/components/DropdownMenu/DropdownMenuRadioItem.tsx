import type { ReactNode } from 'react';

import { useMenuRadioItem } from '../../utils/menuRadio';

import { MenuItemShell } from '../../utils/menu-item-parts';

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

// DropdownMenuItem's chrome (utils/menu-item-parts with the
// menuPopupItem skin); the leading slot is the fixed-size selection dot.

/**
 * One option of a DropdownMenuRadioGroup (`role="menuitemradio"`):
 * activating it (click, Enter, Space) selects its `value` in the
 * group — the previously selected sibling deselects. Selecting keeps
 * the menu open. Must live inside a `DropdownMenuRadioGroup`.
 */
export default function DropdownMenuRadioItem({
  value,
  disabled = false,
  danger = false,
  icon,
  kbdLabel,
  className,
  children,
}: DropdownMenuRadioItemProps) {
  const { checked, select } = useMenuRadioItem(value);
  const classNames = useDropdownMenuContext().classNames;

  return (
    <MenuItemShell
      skin='popup'
      itemRole='menuitemradio'
      itemSlot='menu-radio-item'
      familyClass={classNames?.radioItem}
      ariaChecked={checked}
      indicator='dot'
      indicatorShown={checked}
      disabled={disabled}
      danger={danger}
      icon={icon}
      kbdLabel={kbdLabel}
      className={className}
      onClick={select}
    >
      {children}
    </MenuItemShell>
  );
}

export type { DropdownMenuRadioItemProps };
