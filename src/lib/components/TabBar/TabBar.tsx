import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';

import { focusRingVisible } from '../../utils/focus-ring';
import {
  navItemActive,
  navItemBadge,
  navItemBase,
  navItemIcon,
} from '../../utils/nav-item-skin';

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
 * takes over instead of squishing labels. Sizing/typography delta on the
 * shared navItemBase chrome (utils/nav-item-skin.ts). */
const item = css`
  flex-direction: column;
  gap: var(--haze-space-1);
  flex: 1 1 0;
  min-width: max-content;
  min-height: calc(var(--haze-space-10) + var(--haze-space-1));
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-sm);
  font-family: inherit;
  font-size: var(--haze-text-xs);

  /* Keyboard ring: utils/focus-ring's focusRingVisible, composed on
     the item below — a deliberate convergence: the local copy wore a
     var(--haze-space-1) (4px) ring, the one width variant across the
     library, now unified on the shared 3px ring (and it gains the
     forced-colors Highlight arm the local copy never had). */
`;

/* The active-token pair consumed by the shared navItemActive arm: the
 * bar marks the current view with the primary family — primary text
 * pinned through hover over a primary-subtle wash. */
const itemActiveTokens = css`
  --haze-nav-item-active-color: var(--haze-color-primary);
  --haze-nav-item-active-hover-bg: var(--haze-color-primary-subtle);
`;

/* Top-edge 2px indicator = --haze-space-1 / 2, spanning the item width. */
const indicator = css`
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  height: calc(var(--haze-space-1) / 2);
  background: var(--haze-color-primary);
`;

/* Relative anchor composed onto the shared navItemIcon slot, so the
 * badge overlay tracks the icon corner regardless of the item's
 * stretched height. */
const itemIconAnchor = css`
  position: relative;
`;

const itemLabel = css`
  line-height: var(--haze-leading-tight);
  white-space: nowrap;
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
      x-class={[
        navItemBase,
        item,
        focusRingVisible,
        active && navItemActive,
        active && itemActiveTokens,
        className,
      ]}
      {...rest}
    >
      <span
        data-slot='tab-bar-item-icon'
        x-class={[navItemIcon, itemIconAnchor]}
        aria-hidden='true'
      >
        {icon}
        {badge !== undefined && badge !== null && (
          <span data-slot='tab-bar-item-badge' x-class={navItemBadge}>
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
