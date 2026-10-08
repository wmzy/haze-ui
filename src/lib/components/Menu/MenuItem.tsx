import type { ElementType, ReactNode } from 'react';

import { css } from '@linaria/core';

import { menuItemDanger, menuItemIcon, menuItemKbd } from './menu-item-styles';

type MenuItemOwnProps = {
  onSelect?: () => void;
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
 * Polymorphic like Button's `as`: the item skin and the menuitem wiring
 * (role, roving tabIndex, disabled/aria handling) always land on the
 * rendered element; the target's own props flow through. `as='a'`
 * renders a navigation menuitem with link semantics (href).
 */
type MenuItemProps<T extends ElementType = 'button'> = MenuItemOwnProps & {
  /** Render element — 'button' (default) or 'a' (or a router Link
   * component forwarding props to an anchor). */
  as?: T;
} & (T extends 'a'
    ? Omit<React.ComponentPropsWithRef<'a'>, keyof MenuItemOwnProps | 'as'>
    : unknown);

const item = css`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--haze-space-2) var(--haze-space-3);
  border: none;
  background: transparent;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  text-align: start;
  cursor: pointer;
  transition: background var(--haze-duration-fast);

  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  &:active {
    background: var(--haze-color-bg-muted);
  }

  &:focus-visible {
    outline: none;
    background: var(--haze-color-bg-subtle);
    box-shadow: inset 0 0 0 2px var(--haze-color-focus-ring);
  }

  /* anchor menuitems (as='a') bring a UA underline; the item skin owns
   * text/underline. aria-disabled is the anchor-shaped disabled (an
   * <a> has no [disabled]). */
  text-decoration: none;

  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Forced-colors: the inset focus ring is a box-shadow — dropped by
     the UA — and the subtle background flattens onto Canvas, so the
     keyboard-focused item would vanish. An inset Highlight outline
     restores the focus indication. */
  @media (forced-colors: active) {
    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function MenuItem<T extends ElementType = 'button'>({
  onSelect,
  disabled = false,
  danger = false,
  icon,
  kbdLabel,
  className,
  children,
  as,
  ...rest
}: MenuItemProps<T>) {
  const Tag = (as ?? 'button');
  const isNativeButton = as === undefined || as === 'button';
  return (
    <Tag
      {...(isNativeButton ? { type: 'button' as const } : {})}
      role='menuitem'
      data-slot='menu-item'
      tabIndex={-1}
      x-class={[item, danger && menuItemDanger, className]}
      {...(isNativeButton
        ? { disabled }
        : { 'aria-disabled': disabled || undefined })}
      onClick={onSelect}
      {...rest}
    >
      {icon !== undefined && <span data-slot='icon' x-class={menuItemIcon}>{icon}</span>}
      {children}
      {kbdLabel !== undefined && (
        <span data-slot='kbd' x-class={menuItemKbd} aria-hidden='true'>{kbdLabel}</span>
      )}
    </Tag>
  );
}

export type { MenuItemOwnProps, MenuItemProps };
