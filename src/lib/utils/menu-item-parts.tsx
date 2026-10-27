import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';

import {
  menuItemBase,
  menuItemDanger,
  menuItemIcon,
  menuItemIndicator,
  menuItemKbd,
  menuItemStates,
  menuPopupItem,
} from './menu-skins';

/**
 * Shared item chrome for the three menu families (Menu, DropdownMenu,
 * ContextMenu): the item element with its skin assembly and the
 * indicator/icon/children/kbd slots. Pure presentation — no hooks, no
 * context reads. Each family wrapper keeps its own public props (Menu
 * items say onSelect, the popup families onClick), reads its family
 * context for the slot class and the close/refocus behavior, and
 * delegates the element here.
 *
 * Merge-order contract (utils/menu-skins): menuItemBase, then the
 * family skin (menuItemStates for Menu, menuPopupItem for the popup
 * families), then the danger skin, the family slot class and the
 * per-part className — the order every family used when the chrome
 * was local.
 */

/** The 16x16 check glyph drawn inside checkbox items' indicator box. */
const checkGlyph = (
  <svg width='1em' height='1em' viewBox='0 0 16 16' fill='none'>
    <path
      d='M3.5 8.5 6.5 11.5 12.5 4.5'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

/** The 16x16 selection dot drawn inside radio items' indicator box. */
const dotGlyph = (
  <svg width='1em' height='1em' viewBox='0 0 16 16' fill='none'>
    <circle cx='8' cy='8' r='3.5' fill='currentColor' />
  </svg>
);

type MenuItemShellOwnProps = {
  /** Which family's interaction skin the item wears. */
  skin: 'menu' | 'popup';
  /** The item's menuitem role; a consumer role passed through rest
   * still wins (rest spreads last). */
  itemRole: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';
  /** data-slot value on the item element. */
  itemSlot: string;
  /** Slot class from the family's context (classNames?.item etc);
   * lands after the skins, before the per-part className. */
  familyClass?: string;
  /** Renders aria-checked — checkbox/radio items pass their state. */
  ariaChecked?: boolean;
  /** Renders the leading fixed-size indicator box (checkbox/radio
   * items); the glyph shows only while indicatorShown. */
  indicator?: 'check' | 'dot';
  indicatorShown?: boolean;
  disabled?: boolean;
  /** Danger skin for destructive actions: danger-colored text and
   * interaction states. */
  danger?: boolean;
  /** Inline-start icon slot; bare `svg` children are sized to 1em by the slot. */
  icon?: ReactNode;
  /** Inline-end shortcut hint (e.g. '⌘C'), muted and pushed to the item's end. */
  kbdLabel?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * Polymorphic like Button's `as`: the item skin and the menuitem
 * wiring (role, roving tabIndex, disabled/aria handling) always land
 * on the rendered element; the target's own props flow through.
 */
type MenuItemShellProps<T extends ElementType = 'button'> = MenuItemShellOwnProps & {
  /** Render element — 'button' (default) or 'a' (or a router Link
   * component forwarding props to an anchor). */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof MenuItemShellOwnProps | 'as'>;

export type { MenuItemShellOwnProps, MenuItemShellProps };

export function MenuItemShell<T extends ElementType = 'button'>({
  skin,
  itemRole,
  itemSlot,
  familyClass,
  ariaChecked,
  indicator,
  indicatorShown = false,
  disabled = false,
  danger = false,
  icon,
  kbdLabel,
  className,
  children,
  as,
  ...rest
}: MenuItemShellProps<T>) {
  const Tag = as ?? 'button';
  // Only the native button shape carries type/disabled; anchors and
  // custom components report state through aria instead.
  const isNativeButton = as === undefined || as === 'button';
  return (
    <Tag
      {...(isNativeButton ? { type: 'button' as const } : {})}
      role={itemRole}
      data-slot={itemSlot}
      tabIndex={-1}
      aria-checked={ariaChecked}
      x-class={[
        menuItemBase,
        skin === 'menu' ? menuItemStates : menuPopupItem,
        danger && menuItemDanger,
        familyClass,
        className,
      ]}
      {...(isNativeButton
        ? { disabled }
        : { 'aria-disabled': disabled || undefined })}
      {...rest}
    >
      {indicator !== undefined && (
        <span data-slot='indicator' x-class={menuItemIndicator} aria-hidden='true'>
          {indicatorShown && (indicator === 'check' ? checkGlyph : dotGlyph)}
        </span>
      )}
      {icon !== undefined && <span data-slot='icon' x-class={menuItemIcon}>{icon}</span>}
      {children}
      {kbdLabel !== undefined && (
        <span data-slot='kbd' x-class={menuItemKbd} aria-hidden='true'>{kbdLabel}</span>
      )}
    </Tag>
  );
}
