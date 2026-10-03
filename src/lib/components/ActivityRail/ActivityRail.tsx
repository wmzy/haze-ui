import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Children, isValidElement, useContext } from 'react';

import { css } from '@linaria/core';

import { Badge } from '../Badge';
import { Tooltip } from '../Tooltip';

// Internal seam (not on the barrel): the orientation
// context Workbench injects when the rail is docked
// inside the sidebar column.
import { ActivityRailDockContext } from './rail-dock-context';

// ---------------------------------------------------------------------------
// ActivityRail (root)
// ---------------------------------------------------------------------------

type ActivityRailProps = {
  /** ActivityRailItem list; items with `slot="end"` sink to the rail
   *  bottom (vertical) or trailing edge (horizontal). */
  children: ReactNode;
  /** Track orientation: a vertical side rail (default) or a
   *  horizontal strip. Workbench also injects the docked
   *  context when the rail rides inside the sidebar column
   *  (activityBarPosition top/bottom), so a plain
   *  `<ActivityRail>` lays out horizontally there without the
   *  consumer repeating the prop. */
  orientation?: 'vertical' | 'horizontal';
} & Omit<ComponentPropsWithoutRef<'nav'>, 'children'>;

/**
 * The rail's resolved orientation comes from the
 * surrounding ActivityRailDockContext (see
 * rail-dock-context.ts); Workbench injects
 * 'horizontal' when the rail is docked inside the
 * sidebar column, so a plain `<ActivityRail>` lays
 * out as a strip there without the consumer
 * repeating a prop.
 */

/* 48px track = --haze-space-12; hairline separation from the adjacent
 * sidebar column follows the AppShell area convention. */
const rail = css`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--haze-space-1);
  padding-block: var(--haze-space-1);
  width: var(--haze-space-12);
  /* Stretched hosts (Workbench's activity-bar column) size the
   * track to the full region height; in an auto-height parent
   * 100% resolves to auto, so standalone use is unaffected. */
  height: 100%;
  border-inline-end: 1px solid var(--haze-color-border);
`;

/* Horizontal strip: a 48px-tall toolbar along the sidebar
 * column's top or bottom edge. The hairline moves to the
 * block end (the edge facing the sidebar body), and the
 * active indicator flips to a top-edge bar (see the
 * descendant rule below). */
const railHorizontal = css`
  flex-direction: row;
  width: 100%;
  height: var(--haze-space-12);
  padding-inline: var(--haze-space-1);
  border-inline-end: none;
  border-block-end: 1px solid var(--haze-color-border);

  & [data-slot='activity-rail-item-indicator'] {
    inset-block: auto;
    inset-block-start: calc(var(--haze-space-1) / -2);
    inset-inline: 0;
    width: auto;
    height: calc(var(--haze-space-1) / 2);
  }
`;

/* Bottom-aligned end group: absorbs all free track height above itself. */
const endGroup = css`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--haze-space-1);
  margin-block-start: auto;
`;

/* Trailing-edge end group for the horizontal strip. */
const endGroupHorizontal = css`
  flex-direction: row;
  margin-block-start: 0;
  margin-inline-start: auto;
`;

export default function ActivityRail({
  orientation,
  children,
  className,
  ...rest
}: ActivityRailProps) {
  // An explicit prop wins; otherwise the surrounding
  // context (Workbench's dock) decides.
  const contextOrientation = useContext(ActivityRailDockContext);
  const resolvedOrientation = orientation ?? contextOrientation;
  const startItems: ReactNode[] = [];
  const endItems: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<{ slot?: 'start' | 'end' }>(child) && child.props.slot === 'end') {
      endItems.push(child);
    } else {
      startItems.push(child);
    }
  });

  return (
    <ActivityRailDockContext.Provider value={resolvedOrientation}>
      <nav
        data-slot='activity-rail'
        data-orientation={resolvedOrientation}
        x-class={[
          rail,
          resolvedOrientation === 'horizontal' && railHorizontal,
          className,
        ]}
        {...rest}
      >
        {startItems}
        {endItems.length > 0 && (
          <div
            data-slot='activity-rail-end'
            x-class={[
              endGroup,
              resolvedOrientation === 'horizontal' && endGroupHorizontal,
            ]}
          >
            {endItems}
          </div>
        )}
      </nav>
    </ActivityRailDockContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// ActivityRailItem
// ---------------------------------------------------------------------------

type ActivityRailItemProps = {
  /** Icon content; rendered inside a fixed-size, aria-hidden slot. */
  icon: ReactNode;
  /** Accessible name and hover-tooltip content. */
  label: string;
  /** Notification count/dot rendered as a small Badge overlay. */
  badge?: ReactNode;
  /** Marks the item as the current view (aria-current="true"). */
  active?: boolean;
  /** Called when the item is activated (click or Enter/Space). */
  onSelect?: () => void;
  /** `end` sinks the item into the bottom-aligned group. */
  slot?: 'start' | 'end';
} & Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'children' | 'slot'>;

/* 44px square target = --haze-space-10 + --haze-space-1 (WCAG 2.5.8). */
const item = css`
  box-sizing: border-box;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--haze-space-0);
  border: none;
  width: calc(var(--haze-space-10) + var(--haze-space-1));
  height: calc(var(--haze-space-10) + var(--haze-space-1));
  border-radius: var(--haze-radius-md);
  background: transparent;
  color: var(--haze-color-text-muted);
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
  color: var(--haze-color-text);

  &:hover {
    color: var(--haze-color-text);
  }
`;

/* Rail-side 2px indicator bar, flush with the track's outer edge (the
 * 2px inset comes from centering a 44px item in the 48px track). */
const indicator = css`
  position: absolute;
  inset-block: 0;
  inset-inline-start: calc(var(--haze-space-1) / -2);
  width: calc(var(--haze-space-1) / 2);
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-primary);
`;

const itemIcon = css`
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

const itemBadge = css`
  position: absolute;
  inset-block-start: calc(var(--haze-space-1) / -2);
  inset-inline-end: calc(var(--haze-space-1) / -2);
  pointer-events: none;
`;

export function ActivityRailItem({
  icon,
  label,
  badge,
  active = false,
  onSelect,
  slot = 'start',
  className,
  onClick,
  ...rest
}: ActivityRailItemProps) {
  // Tooltips open away from the strip: beside a vertical
  // rail, below a horizontal one.
  const railOrientation = useContext(ActivityRailDockContext);
  const button = (
    <button
      type='button'
      data-slot='activity-rail-item'
      aria-label={label}
      aria-current={active ? 'true' : undefined}
      onClick={(event) => {
        onClick?.(event);
        onSelect?.();
      }}
      x-class={[item, active && itemActive, className]}
      {...rest}
    >
      <span data-slot='activity-rail-item-icon' x-class={itemIcon} aria-hidden='true'>
        {icon}
      </span>
      {badge !== undefined && badge !== null && (
        <span data-slot='activity-rail-item-badge' x-class={itemBadge}>
          <Badge size='sm'>{badge}</Badge>
        </span>
      )}
      {active && (
        <span
          data-slot='activity-rail-item-indicator'
          x-class={indicator}
          aria-hidden='true'
        />
      )}
    </button>
  );

  /* Physical placement follows the repo floating convention (Sidebar's
   * collapsed items use the same side; RTL apps mirror the rail). */
  return (
    <Tooltip
      content={label}
      position={railOrientation === 'horizontal' ? 'bottom' : 'right'}
    >
      {button}
    </Tooltip>
  );
}

export type { ActivityRailProps, ActivityRailItemProps };
