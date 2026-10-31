import type {Dispatch, RefObject, SetStateAction} from 'react';
import type {FloatingBehavior} from '../../utils/floating';

import {createContext, useContext} from 'react';

/**
 * Semantic slot classes (AntD v6 `classNames` shape) for the
 * NavigationMenu family: declared once on the `<NavigationMenu>` root
 * and distributed to every part through context — the sub-components
 * stay prop-light while one record themes the whole bar. Consumer
 * classes are appended at the end of each part's class list (able to
 * override component defaults); per-part `className` props remain for
 * one-off tweaks and still land after the slot class.
 */
export type NavigationMenuClassNames = {
  /** The wrapper `<nav data-slot='navigation-menu'>` root. */
  root?: string;
  /** Every `<NavigationMenuList>` strip (`role='list'` ul). */
  list?: string;
  /** Every `<NavigationMenuItem>` row (`li`). */
  item?: string;
  /** Every `<NavigationMenuTrigger>` button. */
  trigger?: string;
  /** Every `<NavigationMenuContent>` floating panel. */
  content?: string;
};

type NavigationMenuContextValue = {
  /** Value of the item whose panel is open; null when all are closed. */
  activeValue: string | null;
  /** State write behind `activeValue` (Control-compatible). */
  setActiveValue: Dispatch<SetStateAction<string | null>>;
  /**
   * Pointer/focus entered a trigger: opens it after the intent dwell
   * when nothing is open yet, instantly when a sibling panel is already
   * open (menu-traversal must not pay the delay twice). Any pending
   * timers are dropped first.
   */
  hoverTrigger: (value: string) => void;
  /**
   * Arm the grace-period close: leaving a trigger or panel starts the
   * countdown; any re-enter cancels it (see `cancelHoverTimers`).
   */
  scheduleClose: () => void;
  /** Drop both pending timers (intent + grace). */
  cancelHoverTimers: () => void;
  /** Stable id of an item's content panel (aria-controls target). */
  contentId: (value: string) => string;
  /** Stable id of an item's trigger (aria-labelledby source). */
  triggerId: (value: string) => string;
  classNames: NavigationMenuClassNames | undefined;
  /** Stretch each panel to its trigger's inline size (see NavigationMenu). */
  stretchToTrigger: boolean;
};

const NavigationMenuContext = createContext<NavigationMenuContextValue | undefined>(
  undefined
);

export const NavigationMenuProvider = NavigationMenuContext.Provider;

export function useNavigationMenuContext() {
  const ctx = useContext(NavigationMenuContext);
  if (!ctx) {
    throw new Error(
      'NavigationMenu compound components must be used within <NavigationMenu>'
    );
  }
  return ctx;
}

type NavigationMenuItemContextValue = {
  /** This item's `value`. */
  value: string;
  /** Whether this item's panel is the open one. */
  open: boolean;
  /** This item's floating pair (trigger anchor + panel), per item. */
  floating: FloatingBehavior;
  /**
   * The item's own refs at their narrow element types — the same
   * objects `floating.triggerRef`/`panelRef` carry (widened to
   * HTMLElement by the engine), re-exposed so the parts attach them to
   * typed DOM elements.
   */
  triggerRef: RefObject<HTMLButtonElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  /**
   * Whether the item carries a `<NavigationMenuContent>` child — drives
   * the trigger's disclosure wiring (aria-expanded/aria-controls ride
   * only on items that actually open a panel).
   */
  hasContent: boolean;
};

const NavigationMenuItemContext = createContext<
  NavigationMenuItemContextValue | undefined
>(undefined);

export const NavigationMenuItemProvider = NavigationMenuItemContext.Provider;

export function useNavigationMenuItemContext() {
  const ctx = useContext(NavigationMenuItemContext);
  if (!ctx) {
    throw new Error(
      'NavigationMenuTrigger and NavigationMenuContent must be used within <NavigationMenuItem>'
    );
  }
  return ctx;
}

/**
 * Focus rests inside this item's panel? The predicate the family's
 * three focus-aware close guards share (trigger pointer-leave, content
 * pointer-leave, item close focus-return): a keyboard user working in
 * the panel must never have it vanish under incidental pointer
 * movement. Lives here because every caller reaches the panel through
 * the item context's refs.
 */
export function isFocusInsidePanel(panel: HTMLElement | null): boolean {
  return (
    panel !== null &&
    document.activeElement instanceof Node &&
    panel.contains(document.activeElement)
  );
}
