import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useId } from 'react';
import { useControl } from 'react-use-control';

import {
  menuChevron,
  menuGroup,
  menuGroupLabel,
  menuItemBase,
  menuItemDanger,
  menuItemIcon,
  menuItemIndicator,
  menuItemKbd,
  menuItemStates,
  menuPopupItem,
} from './menu-skins';
import { useMenuRadioGroup, MenuRadioGroupProvider } from './menuRadio';
import { useSubmenuContext } from './submenu';

/**
 * Shared menu-item parts for the three menu families (Menu,
 * DropdownMenu, ContextMenu), in two layers.
 *
 * MenuItemShell is the pure chrome: the item element with its skin
 * assembly and the indicator/icon/children/kbd slots — no hooks, no
 * context reads.
 *
 * The *Impl components one layer up own the behavior the families
 * shipped verbatim twice — the checkbox toggle, the radio select, the
 * submenu trigger wiring, the labeled group boxes. They are
 * parameterized by skin ('menu' | 'popup') and familyClass; the
 * cross-family state seams they read (utils/menuRadio, utils/submenu)
 * are identical for every family by design. Each family wrapper keeps
 * its own public props (Menu items say onSelect, the popup families
 * onClick), reads its family classNames context (and the popup
 * families' close/refocus behavior), and delegates the element here.
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

// ---------------------------------------------------------------------------
// Shared item implementations
//
// The behavior layer the three families shipped as verbatim component
// bodies: each Impl takes the resolved skin and the family's slot
// class, so a family wrapper reduces to reading its context and
// delegating. Only components are exported from this module — the
// hooks stay internal to them.

/** The family seam shared by every item impl: which family's
 * interaction skin the part wears plus the family's slot class from
 * its classNames context (classNames?.item etc). */
type MenuFamilyItemProps = {
  skin: 'menu' | 'popup';
  familyClass?: string;
};

/** Presentation props shared by the item impls — the same meanings as
 * on every family's public items. */
type MenuItemChromeProps = {
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

type MenuItemImplOwnProps = MenuFamilyItemProps & {
  /** Activation handler — Menu's onSelect, the popup families'
   * close(-and-refocus) sequence. A consumer onClick in rest still
   * wins (rest spreads last onto the element). */
  onClick?: () => void;
} & MenuItemChromeProps;

/** Polymorphic like MenuItem's as: the skin and the menuitem wiring
 * always land on the rendered element; the target's own props flow
 * through. */
type MenuItemImplProps<T extends ElementType = 'button'> = MenuItemImplOwnProps & {
  /** Render element — 'button' (default) or 'a' (or a router Link
   * component forwarding props to an anchor). */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof MenuItemImplOwnProps | 'as'>;

export type { MenuItemImplOwnProps, MenuItemImplProps };

export function MenuItemImpl<T extends ElementType = 'button'>({
  skin,
  familyClass,
  onClick,
  disabled = false,
  danger = false,
  icon,
  kbdLabel,
  className,
  children,
  as,
  ...rest
}: MenuItemImplProps<T>) {
  return (
    <MenuItemShell<T>
      as={as}
      skin={skin}
      itemRole='menuitem'
      itemSlot='menu-item'
      familyClass={familyClass}
      disabled={disabled}
      danger={danger}
      icon={icon}
      kbdLabel={kbdLabel}
      className={className}
      onClick={onClick}
      {...(rest as Omit<ComponentPropsWithRef<T>, keyof MenuItemShellOwnProps | 'as'>)}
    >
      {children}
    </MenuItemShell>
  );
}

type MenuCheckboxItemImplProps = MenuFamilyItemProps & {
  /** Whether the option is checked — controlled control or uncontrolled initial value. */
  checked?: ControlOrValue<boolean>;
  /** Fires on every toggle, whatever drove it (click, Enter, Space). */
  onCheckedChange?: (checked: boolean) => void;
} & MenuItemChromeProps;

export function MenuCheckboxItemImpl({
  skin,
  familyClass,
  checked: checkedControl,
  onCheckedChange,
  disabled = false,
  danger = false,
  icon,
  kbdLabel,
  className,
  children,
}: MenuCheckboxItemImplProps) {
  const [checked, setChecked] = useControl(checkedControl, false);

  return (
    <MenuItemShell
      skin={skin}
      itemRole='menuitemcheckbox'
      itemSlot='menu-checkbox-item'
      familyClass={familyClass}
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

type MenuRadioItemImplProps = MenuFamilyItemProps & {
  /** Whether this item is its radio group's selected option (from
   * useMenuRadioItem — resolved by the wrapper so each family keeps
   * its own context-read order). */
  checked: boolean;
  /** Selects this item's value in its radio group. */
  onSelect: () => void;
} & MenuItemChromeProps;

export function MenuRadioItemImpl({
  skin,
  familyClass,
  checked,
  onSelect,
  disabled = false,
  danger = false,
  icon,
  kbdLabel,
  className,
  children,
}: MenuRadioItemImplProps) {
  return (
    <MenuItemShell
      skin={skin}
      itemRole='menuitemradio'
      itemSlot='menu-radio-item'
      familyClass={familyClass}
      ariaChecked={checked}
      indicator='dot'
      indicatorShown={checked}
      disabled={disabled}
      danger={danger}
      icon={icon}
      kbdLabel={kbdLabel}
      className={className}
      onClick={onSelect}
    >
      {children}
    </MenuItemShell>
  );
}

type MenuSubTriggerImplProps = MenuFamilyItemProps & {
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

export function MenuSubTriggerImpl({
  skin,
  familyClass,
  disabled = false,
  className,
  children,
}: MenuSubTriggerImplProps) {
  const sub = useSubmenuContext();
  return (
    <button
      ref={sub.triggerRef}
      type='button'
      role='menuitem'
      data-slot='menu-sub-trigger'
      tabIndex={-1}
      aria-haspopup='menu'
      aria-expanded={sub.open}
      aria-owns={sub.open ? sub.contentId : undefined}
      disabled={disabled}
      x-class={[menuItemBase, skin === 'menu' ? menuItemStates : menuPopupItem, menuChevron, familyClass, className]}
      style={sub.floating.triggerStyle}
      onPointerDown={sub.floating.onTriggerPointerDown}
      onPointerEnter={sub.onTriggerPointerEnter}
      onClick={sub.floating.onTriggerClick}
      onKeyDown={sub.handleTriggerKeyDown}
    >
      {children}
    </button>
  );
}

type MenuGroupImplProps = {
  /** Slot class from the family's context (classNames?.group). */
  familyClass?: string;
  /** Non-interactive heading naming the group (aria-labelledby). */
  label: ReactNode;
  className?: string;
  /** The group's menu items. */
  children: ReactNode;
};

export function MenuGroupImpl({ familyClass, label, className, children }: MenuGroupImplProps) {
  const labelId = useId();
  return (
    <div data-slot='group' role='group' aria-labelledby={labelId} x-class={[menuGroup, familyClass, className]}>
      <div id={labelId} data-slot='group-label' x-class={menuGroupLabel}>
        {label}
      </div>
      {children}
    </div>
  );
}

type MenuRadioGroupImplProps = {
  /** Slot class from the family's context (classNames?.group). */
  familyClass?: string;
  /** Selected value — controlled control or uncontrolled initial value ('' = none). */
  value?: ControlOrValue<string>;
  /** Fires when the selection changes, whatever drove it (click, Enter, Space). */
  onValueChange?: (value: string) => void;
  /** Optional non-interactive heading naming the radio group (aria-labelledby). */
  label?: ReactNode;
  className?: string;
  /** The group's radio items. */
  children: ReactNode;
};

export function MenuRadioGroupImpl({
  familyClass,
  value,
  onValueChange,
  label,
  className,
  children,
}: MenuRadioGroupImplProps) {
  const state = useMenuRadioGroup(value, onValueChange);
  const labelId = useId();
  return (
    <MenuRadioGroupProvider value={state}>
      <div
        data-slot='group'
        role='group'
        aria-labelledby={label !== undefined ? labelId : undefined}
        x-class={[menuGroup, familyClass, className]}
      >
        {label !== undefined && (
          <div id={labelId} data-slot='group-label' x-class={menuGroupLabel}>
            {label}
          </div>
        )}
        {children}
      </div>
    </MenuRadioGroupProvider>
  );
}
