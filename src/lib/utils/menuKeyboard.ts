import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';
import type { AxisMove, AxisOrientation } from './axis-traversal';
import type { Direction } from './direction';

import { useCallback, useEffect, useRef } from 'react';

import { axisMove, axisMoveTarget, findWrapIndex } from './axis-traversal';
import { getDirection, inlineAxisKeys } from './direction';

/** How long typed characters keep accumulating before the buffer resets. */
export const TYPEAHEAD_WINDOW_MS = 500;

/**
 * Default item selector: enabled menu items inside a menu container.
 * The prefix match includes the checkable variants (`menuitemcheckbox`,
 * `menuitemradio`) — they are full keyboard citizens: arrows, Home/End,
 * typeahead and the roving tabindex treat them exactly like plain
 * `menuitem`s.
 */
const MENU_ITEM_SELECTOR = '[role^="menuitem"]:not([disabled])';

/** Item roles whose Space keypress must activate the item natively. */
const CHECKABLE_MENU_ROLES = new Set(['menuitemcheckbox', 'menuitemradio']);

/** Enabled items inside a container, in DOM order. */
export function getEnabledMenuItems(
  container: HTMLElement | null,
  selector: string = MENU_ITEM_SELECTOR
): HTMLElement[] {
  if (!container) return [];
  const items = Array.from(container.querySelectorAll<HTMLElement>(selector));
  // Nested submenus keep their panel inside the parent menu's DOM (the
  // popover top layer only changes paint order, not the tree). For menu
  // containers keep only items whose NEAREST menu ancestor is the
  // container itself, so each level's keyboard traversal, typeahead and
  // roving tabindex see exactly its own items — a submenu trigger
  // belongs to the parent level, the submenu's items do not. Non-menu
  // containers (listbox, toolbar) never nest menus and pass through.
  if (container.getAttribute('role') === 'menu') {
    return items.filter((el) => el.closest('[role="menu"]') === container);
  }
  return items;
}

/**
 * Focus the first or last enabled item of a list container — the
 * shared edge entry for arrows moving focus into a list (a
 * DropdownMenu trigger's ArrowDown/ArrowUp, Command's input,
 * TreeSelect's search field). Returns the focused element, or null
 * when the container holds no matching item (so callers can skip
 * preventDefault).
 */
export function focusListEdge(
  container: HTMLElement | null,
  edge: 'first' | 'last',
  selector?: string
): HTMLElement | null {
  const items = getEnabledMenuItems(container, selector);
  const target = edge === 'first' ? items[0] : items[items.length - 1];
  target?.focus();
  return target ?? null;
}

type MoveFocusInAxisOptions = {
  /** Element whose enabled items (`selector`) form the focus loop. */
  container: HTMLElement | null;
  /** Item selector; the menu item selector by default. */
  selector?: string;
  /**
   * Layout axis of the container. Horizontal mirrors the arrow keys
   * under `dir="rtl"` (← advances); vertical never mirrors. Home/End
   * are direction-invariant either way.
   */
  orientation: AxisOrientation;
};

/**
 * The axis-traversal core shared by the roving focus patterns
 * (useMenuKeyboard here, Toolbar, the NavigationMenu trigger strip): the
 * orientation's main-axis arrows move focus to the next/previous enabled
 * item with wrapping, Home/End jump to the first/last. With focus on no
 * item the arrows enter from the matching end — forward lands on the
 * first item, backward on the last. Any other key is left untouched (no
 * preventDefault) so callers layer their own semantics on top — menus
 * add Escape/Tab/typeahead; toolbar and navigation-strip callers stop at
 * this loop. Returns whether the key belonged to the axis (and focus was
 * moved).
 */
export function moveFocusInAxis(
  event: ReactKeyboardEvent,
  { container, selector, orientation }: MoveFocusInAxisOptions
): boolean {
  // Main-axis key for the orientation; horizontal mirrors under RTL
  // (direction read from the DOM at event time — the layout truth the
  // focus order must follow).
  const move = axisMove(event.key, orientation, getDirection(container));
  if (!move) return false;
  const items = getEnabledMenuItems(container, selector);
  if (items.length === 0) return false;

  event.preventDefault();
  const target = axisMoveTarget(move, {
    current: items.indexOf(document.activeElement as HTMLElement),
    length: items.length,
  });
  items[target]?.focus();
  return true;
}

type UseMenuKeyboardOptions = {
  /** Element containing the item children (`[role=menuitem]` by default). */
  menuRef: RefObject<HTMLElement | null>;
  /**
   * Called when the menu should close via keyboard; the caller returns
   * focus to the trigger.
   */
  onClose: () => void;
  /**
   * Item selector for containers that are not a `role="menu"` — e.g. the
   * `[role=option]` list of a Command palette.
   */
  selector?: string;
  /**
   * Submenu levels only: called for the inline-start arrow (ArrowLeft in
   * LTR, ArrowRight under `dir="rtl"` — mirrored like the horizontal
   * orientation) so this level closes and focus returns to its trigger.
   * Root menus leave it unset and the key stays inert.
   */
  onCloseToStart?: () => void;
  /**
   * Layout axis of the item container. Vertical (default) moves with
   * ↑/↓; horizontal moves with ←/→, mirrored under `dir="rtl"` (←
   * advances) so the keys follow the mirrored layout. Home/End, Escape,
   * Tab-close and typeahead are direction-invariant either way.
   */
  orientation?: AxisOrientation;
};

/** The slice of a keyboard event the resolver reads — a React or a
 *  native event both fit. */
type MenuKeyEvent = Pick<
  KeyboardEvent,
  'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'target'
>;

/** What a menu-level keydown asks for; see {@link resolveMenuKey}. */
export type MenuKeyAction =
  /** Move focus along the main axis (arrow step or Home/End jump). */
  | { kind: 'move'; move: AxisMove }
  /** Close the menu: Escape, or Tab (which then continues past the
   *  trigger). */
  | { kind: 'close' }
  /** Submenu levels only: the inline-start arrow closes this level. */
  | { kind: 'close-to-start' }
  /** Space on a checkable item — hand it to the native activation. */
  | { kind: 'activate' }
  /** A printable character for the typeahead buffer. */
  | { kind: 'typeahead'; char: string };

type ResolveMenuKeyContext = {
  /** Layout axis of the item container. */
  orientation: AxisOrientation;
  /**
   * Rendered direction of the container — `getDirection` on it, the
   * layout truth the arrow keys must follow.
   */
  dir: Direction | 'auto';
  /**
   * Submenu levels only: the inline-start arrow (ArrowLeft in LTR,
   * ArrowRight under `dir="rtl"`) closes this level. Root menus leave
   * it off and the key stays inert.
   */
  closeToStart?: boolean;
};

/**
 * Pure key resolution for a menu level — the one keymap both keyboard
 * layers share (useMenuKeyboard over the DOM items, Menu's virtualized
 * path over its data model): the orientation's main-axis arrows move
 * focus, Home/End jump to the ends, Escape and Tab close, Space on a
 * checkable item goes to its native activation, and any other
 * printable character feeds the typeahead (Space on a plain item
 * included — no label starts with a space, so focus stays put).
 * Returns null for keys the menu does not own: Enter, function keys
 * and modified shortcuts.
 *
 * Side-effect free: the caller runs preventDefault for every action but
 * `activate`, and performs the move or close against its own item
 * source.
 */
export function resolveMenuKey(
  event: MenuKeyEvent,
  { orientation, dir, closeToStart = false }: ResolveMenuKeyContext
): MenuKeyAction | null {
  const { key } = event;
  // Submenu level first: a submenu is always vertical, so the
  // inline-start arrow is otherwise inert — here it closes this level.
  if (closeToStart && key === inlineAxisKeys('horizontal', dir).prev) {
    return { kind: 'close-to-start' };
  }
  const move = axisMove(key, orientation, dir);
  if (move) return { kind: 'move', move };
  if (key === 'Escape' || key === 'Tab') return { kind: 'close' };
  if (key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
    return null;
  }
  // Space on a checkbox/radio item must reach the native button
  // activation (the click that toggles it) — treating it as a
  // typeahead character would swallow the toggle. Plain items keep the
  // typeahead reading (textContent never starts with a space, so focus
  // stays put, as before).
  if (
    key === ' ' &&
    event.target instanceof Element &&
    CHECKABLE_MENU_ROLES.has(event.target.getAttribute('role') ?? '')
  ) {
    return { kind: 'activate' };
  }
  return { kind: 'typeahead', char: key };
}

/**
 * Index the typeahead buffer `typed` (already lower-cased) lands on:
 * the first item after `current` whose text starts with the buffer —
 * wrapping, with the current item itself the last candidate so
 * repeating a character cycles between items starting with it.
 * `textAt` yields an item's searchable text, or undefined for items
 * that are not candidates (disabled items, dividers). Returns -1 when
 * nothing matches.
 */
export function typeaheadTarget(
  length: number,
  current: number,
  typed: string,
  textAt: (index: number) => string | undefined
): number {
  return findWrapIndex(
    length,
    current + 1,
    (index) => textAt(index)?.toLowerCase().startsWith(typed) ?? false
  );
}

/**
 * Typeahead buffer shared by the keyboard layers: `useMenuKeyboard`
 * here (matching DOM items) and Menu's virtualized path (matching the
 * data model — rows outside the virtual window have no DOM to read).
 * Each push appends one character case-insensitively and (re)starts
 * the TYPEAHEAD_WINDOW_MS reset timer; the buffer clears when the
 * window lapses. Returns the push function, which yields the
 * accumulated buffer.
 */
export function useTypeahead(): (char: string) => string {
  const typedRef = useRef('');
  const resetTimerRef = useRef(0);

  useEffect(
    () => () => window.clearTimeout(resetTimerRef.current),
    []
  );

  return useCallback((char: string) => {
    const typed = (typedRef.current + char).toLowerCase();
    typedRef.current = typed;
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => {
      typedRef.current = '';
    }, TYPEAHEAD_WINDOW_MS);
    return typed;
  }, []);
}

/**
 * Keyboard behavior for a roving-tabindex item container (WAI-ARIA menu
 * button / listbox pattern): the orientation's main-axis arrows move
 * focus (wrapping, skipping disabled items; with focus on no item they
 * enter from the matching end — ArrowDown lands on the first, ArrowUp
 * on the last), Home/End jump to the ends, Escape closes (returning
 * focus to the trigger), Tab closes, and printable characters run
 * typeahead. Keys are resolved by {@link resolveMenuKey}.
 */
export function useMenuKeyboard({
  menuRef,
  onClose,
  selector,
  onCloseToStart,
  orientation = 'vertical',
}: UseMenuKeyboardOptions) {
  const pushTyped = useTypeahead();

  return useCallback(
    (event: ReactKeyboardEvent) => {
      const items = getEnabledMenuItems(menuRef.current, selector);
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement as HTMLElement);

      const action = resolveMenuKey(event, {
        orientation,
        // Direction read from the DOM at event time — the layout truth
        // the arrow keys must follow.
        dir: getDirection(menuRef.current),
        closeToStart: onCloseToStart !== undefined,
      });
      // Not ours, or Space on a checkable item: the native activation
      // must go through untouched.
      if (!action || action.kind === 'activate') return;

      event.preventDefault();
      switch (action.kind) {
        case 'move': {
          const target = axisMoveTarget(action.move, {
            current,
            length: items.length,
          });
          items[target]?.focus();
          return;
        }
        case 'close':
          // Tab included: closing hands focus to the trigger — without
          // this the focused item unmounts and focus drops to <body>.
          // A following Tab continues past the trigger.
          onClose();
          return;
        case 'close-to-start':
          onCloseToStart?.();
          return;
        case 'typeahead': {
          const match = typeaheadTarget(
            items.length,
            current,
            pushTyped(action.char),
            (index) => items[index]?.textContent
          );
          if (match >= 0) items[match]?.focus();
        }
      }
    },
    [menuRef, onClose, selector, onCloseToStart, orientation, pushTyped]
  );
}

type UseRovingTabindexOptions = {
  menuRef: RefObject<HTMLElement | null>;
  /**
   * While false the effect is inert — panels that stay mounted when
   * closed (Menu, Combobox-style listboxes) manage the tab stops only
   * while open.
   */
  active: boolean;
  selector?: string;
};

/**
 * Roving tabindex for a menu/listbox container: exactly one item is a tab
 * stop at any time. On activation the current stop is kept (first item
 * initially); a `focusin` listener moves the stop with focus, and a
 * MutationObserver re-syncs when the item set changes (e.g. a filtered
 * Command list).
 */
export function useRovingTabindex({
  menuRef,
  active,
  selector = MENU_ITEM_SELECTOR,
}: UseRovingTabindexOptions) {
  useEffect(() => {
    const menu = menuRef.current;
    if (!active || !menu) return;

    const sync = () => {
      const items = getEnabledMenuItems(menu, selector);
      if (items.length === 0) return;
      const stop = items.findIndex((el) => el.tabIndex === 0);
      const next = stop >= 0 ? stop : 0;
      items.forEach((el, index) => {
        el.tabIndex = index === next ? 0 : -1;
      });
    };
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(menu, { childList: true, subtree: true });

    const handleFocusIn = (event: FocusEvent) => {
      const items = getEnabledMenuItems(menu, selector);
      // Focus landing outside this level's items (a nested submenu's
      // panel lives inside this container's DOM) must not strip the
      // level's tab stop — the stop moves only with focus on its own
      // items.
      if (!items.includes(event.target as HTMLElement)) return;
      items.forEach((el) => {
        el.tabIndex = el === event.target ? 0 : -1;
      });
    };
    menu.addEventListener('focusin', handleFocusIn);
    return () => {
      observer.disconnect();
      menu.removeEventListener('focusin', handleFocusIn);
    };
  }, [menuRef, active, selector]);
}
