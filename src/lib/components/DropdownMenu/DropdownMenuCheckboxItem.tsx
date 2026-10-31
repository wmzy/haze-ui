import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { MenuCheckboxItemImpl } from '../../utils/menu-item-parts';

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
