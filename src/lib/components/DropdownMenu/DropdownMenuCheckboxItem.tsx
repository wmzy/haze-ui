import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import {
  menuItemDanger,
  menuItemIcon,
  menuItemIndicator,
  menuItemKbd,
  menuItemBase,
  menuPopupItem,
} from '../../utils/menu-skins';

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

// DropdownMenuItem's skin (menuItemBase + menuPopupItem,
// utils/menu-skins); the leading slot is the fixed-size check indicator.

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
    <button
      data-slot='menu-checkbox-item'
      x-class={[menuItemBase, menuPopupItem, danger && menuItemDanger, classNames?.checkboxItem, className]}
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={-1}
      disabled={disabled}
      onClick={() => {
        const next = !checked;
        setChecked(next);
        onCheckedChange?.(next);
      }}
    >
      <span data-slot='indicator' x-class={menuItemIndicator} aria-hidden="true">
        {checked && (
          <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {icon !== undefined && <span data-slot='icon' x-class={menuItemIcon}>{icon}</span>}
      {children}
      {kbdLabel !== undefined && (
        <span data-slot='kbd' x-class={menuItemKbd} aria-hidden="true">{kbdLabel}</span>
      )}
    </button>
  );
}

export type { DropdownMenuCheckboxItemProps };
