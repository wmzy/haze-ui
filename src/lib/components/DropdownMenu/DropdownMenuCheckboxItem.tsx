import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import { MenuItemShell } from '../../utils/menu-item-parts';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuCheckboxItemProps = {
  /** Whether the option is checked — controlled control or uncontrolled initial value. */
  checked?: ControlOrValue<boolean>;
  /** Fires on every toggle, whatever drove it (click, Enter, Space). */
  onCheckedChange?: (checked: boolean) => void;
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
// menuPopupItem skin); the leading slot is the fixed-size check
// indicator.

/**
 * A toggleable menu option (`role="menuitemcheckbox"`): click, Enter or
 * Space flips `checked`; the state is controllable through the standard
 * `ControlOrValue` prop. Toggling keeps the menu open — several options
 * are typically flipped in one visit (unlike a plain item, which
 * closes the menu on activation).
 */
export default function DropdownMenuCheckboxItem({
  checked: checkedControl,
  onCheckedChange,
  disabled = false,
  danger = false,
  icon,
  kbdLabel,
  className,
  children,
}: DropdownMenuCheckboxItemProps) {
  const classNames = useDropdownMenuContext().classNames;
  const [checked, setChecked] = useControl(checkedControl, false);

  return (
    <MenuItemShell
      skin='popup'
      itemRole='menuitemcheckbox'
      itemSlot='menu-checkbox-item'
      familyClass={classNames?.checkboxItem}
      ariaChecked={checked}
      indicator='check'
      indicatorShown={checked}
      disabled={disabled}
      danger={danger}
      icon={icon}
      kbdLabel={kbdLabel}
      className={className}
      onClick={() => {
        const next = !checked;
        setChecked(next);
        onCheckedChange?.(next);
      }}
    >
      {children}
    </MenuItemShell>
  );
}

export type { DropdownMenuCheckboxItemProps };
