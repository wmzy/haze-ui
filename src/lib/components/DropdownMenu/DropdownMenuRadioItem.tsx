import type { ReactNode } from 'react';

import { useMenuRadioItem } from '../../utils/menuRadio';

import {
  menuItemDanger,
  menuItemIcon,
  menuItemIndicator,
  menuItemKbd,
  menuItemBase,
  menuPopupItem,
} from '../../utils/menu-skins';

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

// DropdownMenuItem's skin (menuItemBase + menuPopupItem,
// utils/menu-skins); the leading slot is the fixed-size selection dot.

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
    <button
      data-slot='menu-radio-item'
      x-class={[menuItemBase, menuPopupItem, danger && menuItemDanger, classNames?.radioItem, className]}
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      disabled={disabled}
      onClick={select}
    >
      <span data-slot='indicator' x-class={menuItemIndicator} aria-hidden="true">
        {checked && (
          <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3.5" fill="currentColor" />
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

export type { DropdownMenuRadioItemProps };
