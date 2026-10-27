import type { ReactNode } from 'react';

import { useMenuRadioItem } from '../../utils/menuRadio';

import { menuItemDanger, menuItemIcon, menuItemIndicator, menuItemKbd, menuItemBase, menuItemStates } from '../../utils/menu-skins';

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

// MenuItem's skin (menuItemBase + menuItemStates, utils/menu-skins);
// the leading slot is the fixed-size selection dot (it draws in
// CanvasText through currentColor under forced-colors).

/**
 * One option of a MenuRadioGroup (`role="menuitemradio"`): activating
 * it (click, Enter, Space) selects its `value` in the group — the
 * previously selected sibling deselects. Must live inside a
 * `MenuRadioGroup`.
 */
export default function MenuRadioItem({
  value,
  disabled = false,
  danger = false,
  icon,
  kbdLabel,
  className,
  children,
}: MenuRadioItemProps) {
  const classNames = useMenuClassNames();
  const { checked, select } = useMenuRadioItem(value);

  return (
    <button
      type='button'
      role='menuitemradio'
      data-slot='menu-radio-item'
      aria-checked={checked}
      tabIndex={-1}
      x-class={[menuItemBase, menuItemStates, danger && menuItemDanger, classNames?.radioItem, className]}
      disabled={disabled}
      onClick={select}
    >
      <span data-slot='indicator' x-class={menuItemIndicator} aria-hidden='true'>
        {checked && (
          <svg width='1em' height='1em' viewBox='0 0 16 16' fill='none'>
            <circle cx='8' cy='8' r='3.5' fill='currentColor' />
          </svg>
        )}
      </span>
      {icon !== undefined && <span data-slot='icon' x-class={menuItemIcon}>{icon}</span>}
      {children}
      {kbdLabel !== undefined && (
        <span data-slot='kbd' x-class={menuItemKbd} aria-hidden='true'>{kbdLabel}</span>
      )}
    </button>
  );
}

export type { MenuRadioItemProps };
