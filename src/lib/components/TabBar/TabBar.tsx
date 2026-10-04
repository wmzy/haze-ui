import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';

import { Badge } from '../Badge';

// ---------------------------------------------------------------------------
// TabBar (root)
// ---------------------------------------------------------------------------

type TabBarProps = {
  /** TabBarItem list; one row, evenly distributed (scrolls when crowded). */
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'nav'>, 'children'>;

/* The bar owns container semantics only — no `position: fixed` of its own.
 * Docking is the consumer's call: `position: fixed; inset-block-end: 0` for
 * a standalone page, or a grid/flex area inside Workbench/AppShell. Keeping
 * positioning out is what lets the same component serve both.
 *
 * 56px track = --haze-space-12 + --haze-space-2 (material bottom bar).
 * min-height (not height) + the safe-area padding keep the item area at a
 * full 52px: env(safe-area-inset-bottom) extends the bar past 56px on
 * home-indicator devices instead of eating into it. env() is device
 * geometry, not a themable decision — token convention allows it raw
 * (see BottomSheet). */
const bar = css`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: calc(var(--haze-space-12) + var(--haze-space-2));
  padding-block-end: calc(var(--haze-space-1) + env(safe-area-inset-bottom));
  border-block-start: 1px solid var(--haze-color-border);
  background: var(--haze-color-bg);
  overflow-x: auto;
`;

export default function TabBar({
  children,
  className,
  ...rest
}: TabBarProps) {
  return (
    <nav data-slot='tab-bar' x-class={[bar, className]} {...rest}>
      {children}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// TabBarItem
// ---------------------------------------------------------------------------

type TabBarItemProps = {
  /** Icon content; rendered inside a fixed-size, aria-hidden slot. */
  icon: ReactNode;
  /** Visible caption under the icon; also the item's accessible name. */
  label: string;
  /** Notification count/dot rendered as a small Badge on the icon corner. */
  badge?: ReactNode;
  /** Marks the item as the current view (aria-current="true"). */
  active?: boolean;
  /** Called when a non-active item is activated (click or Enter/Space). */
  onSelect?: () => void;
  /** Called when the already-active item is activated again — the
   * "reselect pops back to root" affordance. onSelect is not re-fired. */
  onReselect?: () => void;
} & Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'children' | 'onSelect'>;

/* Icon-over-label column filling the track; min-height 44px keeps the touch
 * target (WCAG 2.5.8) even outside the bar. `flex: 1 1 0` distributes free
 * space evenly; `min-width: max-content` is the shrink clamp — a crowded
 * bar keeps every item at least content-wide and the track's overflow-x
 * takes over instead of squishing labels. */
const item = css`
  box-sizing: border-box;
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--haze-space-1);
  flex: 1 1 0;
  min-width: max-content;
  min-height: calc(var(--haze-space-10) + var(--haze-space-1));
  padding: var(--haze-space-1) var(--haze-space-2);
  border: none;
  border-radius: var(--haze-radius-sm);
  background: transparent;
  color: var(--haze-color-text-muted);
  font-family: inherit;
  font-size: var(--haze-text-xs);
  cursor: pointer;
  transition:
    color var(--haze-duration-fast) var(--haze-ease),
    background var(--haze-duration-fast) var(--haze-ease);

  &:hover {
    color: var(--haze-color-text);
    background: var(--haze-color-bg-muted);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 var(--haze-space-1) var(--haze-color-focus-ring);
  }
`;

const itemActive = css`
  color: var(--haze-color-primary);

  &:hover {
    color: var(--haze-color-primary);
    background: var(--haze-color-primary-subtle);
  }
`;

/* Top-edge 2px indicator = --haze-space-1 / 2, spanning the item width. */
const indicator = css`
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  height: calc(var(--haze-space-1) / 2);
  background: var(--haze-color-primary);
`;

/* Relative anchor for the badge overlay, so the badge tracks the icon
 * corner regardless of the item's stretched height. */
const itemIcon = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--haze-space-5);
  height: var(--haze-space-5);

  & > svg {
    width: 100%;
    height: 100%;
  }
`;

const itemLabel = css`
  line-height: var(--haze-leading-tight);
  white-space: nowrap;
`;

const itemBadge = css`
  position: absolute;
  inset-block-start: calc(var(--haze-space-1) / -2);
  inset-inline-end: calc(var(--haze-space-1) / -2);
  pointer-events: none;
`;

export function TabBarItem({
  icon,
  label,
  badge,
  active = false,
  onSelect,
  onReselect,
  className,
  onClick,
  ...rest
}: TabBarItemProps) {
  return (
    <button
      type='button'
      data-slot='tab-bar-item'
      aria-current={active ? 'true' : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (active) onReselect?.();
        else onSelect?.();
      }}
      x-class={[item, active && itemActive, className]}
      {...rest}
    >
      <span data-slot='tab-bar-item-icon' x-class={itemIcon} aria-hidden='true'>
        {icon}
        {badge !== undefined && badge !== null && (
          <span data-slot='tab-bar-item-badge' x-class={itemBadge}>
            <Badge size='sm'>{badge}</Badge>
          </span>
        )}
      </span>
      <span data-slot='tab-bar-item-label' x-class={itemLabel}>
        {label}
      </span>
      {active && (
        <span
          data-slot='tab-bar-item-indicator'
          x-class={indicator}
          aria-hidden='true'
        />
      )}
    </button>
  );
}

export type { TabBarProps, TabBarItemProps };
