import type {
  Dispatch,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
  SetStateAction,
} from 'react';
import type { FloatingBehavior } from './floating';

import { useCallback, useRef } from 'react';

import { useFloating } from './floating';
import { useFocusScope } from './focus-scope';
import { useMenuKeyboard, useRovingTabindex } from './menuKeyboard';

type UseMenuPanelOptions = {
  /** The controlled-or-not `open` state the panel mirrors. */
  open: boolean;
  /**
   * Its setter (the `useControl` writer): trigger clicks, light
   * dismiss and the close keys all route through it.
   */
  setOpen: Dispatch<SetStateAction<boolean>>;
  /** Element the panel is anchored to; also the outside-close boundary. */
  triggerRef: RefObject<HTMLElement | null>;
  /**
   * Item selector both keyboard layers walk — the menu item selector
   * by default (utils/menuKeyboard). NotificationCenter passes its own
   * because its panel is a `role="dialog"` of notification rows and
   * footer actions, not a `role="menu"` of menu items.
   */
  selector?: string;
};

/**
 * How the focus scope of a menu panel is gated:
 *
 * - `'root'` (default): `enabled: open` — valid only when `useFloating`
 *   is declared in the SAME component, before this hook: its
 *   showPopover effect then fires before the scope's autoFocus, so the
 *   panel is already visible when the first tabbable is focused.
 * - `'panel'`: `enabled: open && floating.shown` — for content
 *   components whose effects run as CHILD effects, before the family
 *   root's showPopover effect: at open-flip time the native popover is
 *   still display:none and autoFocus would be silently dropped
 *   (Chromium). `shown` flips only once the panel is focusable.
 * - `'none'`: no focus scope — the consumer owns focus handoff (e.g.
 *   DropdownMenuContent's focusRequestRef effect leaves pointer-opened
 *   menus focused on the trigger).
 */
export type MenuPanelFocus = 'root' | 'panel' | 'none';

type UseMenuPanelWiringOptions = {
  /** The controlled-or-not `open` state the panel mirrors. */
  open: boolean;
  /**
   * What the keyboard layer's close keys (Escape/Tab) do — plain close,
   * or close plus a focus restore to the trigger (DropdownMenu).
   */
  onClose: () => void;
  /** The panel node ref — kept current by `setPanelRef`. */
  panelRef: RefObject<HTMLDivElement | null>;
  /** The panel's floating behavior; the `'panel'` gate reads `shown`. */
  floating: FloatingBehavior;
  /**
   * Item selector both keyboard layers walk — the menu item selector
   * by default (utils/menuKeyboard).
   */
  selector?: string;
  /** Focus-scope gate; see {@link MenuPanelFocus}. Defaults to `'root'`. */
  focus?: MenuPanelFocus;
};

/**
 * The keyboard/focus half of a floating menu panel: the roving-tabindex
 * sync + the menu keyboard handler + the focus scope, plus the merged
 * panel ref callback that feeds the panel node to both the owner's
 * panel ref and the focus scope. Used directly by content components
 * that receive their floating behavior from the family context
 * (ContextMenuContent, DropdownMenuContent), and through `useMenuPanel`
 * by roots that own the floating engine (Menu, NotificationCenter).
 *
 * Declaration order inside is a race contract — do not reorder: the
 * roving sync first, because the first item must be the tab stop before
 * autoFocus runs (both fire in the same commit); the focus scope last,
 * its returnFocus repairing the Escape gap — the hidden panel would
 * otherwise leave focus on <body>.
 */
export function useMenuPanelWiring({
  open,
  onClose,
  panelRef,
  floating,
  selector,
  focus = 'root',
}: UseMenuPanelWiringOptions): {
  /** Keydown handler for the panel element. */
  handleKeyDown: (event: ReactKeyboardEvent) => void;
  /** Ref callback wiring the panel node into the panel ref + focus scope. */
  setPanelRef: (node: HTMLDivElement | null) => void;
} {
  useRovingTabindex({ menuRef: panelRef, active: open, selector });
  const handleKeyDown = useMenuKeyboard({
    menuRef: panelRef,
    onClose,
    selector,
  });

  // Gate per MenuPanelFocus: 'root' leans on the caller having declared
  // useFloating before this hook (same-component effect order); 'panel'
  // defers to the toggle-event echo because child effects run before
  // the root's showPopover; 'none' keeps the scope permanently inert.
  const scopeEnabled =
    focus === 'panel' ? open && floating.shown : focus === 'none' ? false : open;
  const setScope = useFocusScope({
    enabled: scopeEnabled,
    autoFocus: true,
    returnFocus: true,
  });

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      setScope(node);
    },
    [panelRef, setScope]
  );

  return { handleKeyDown, setPanelRef };
}

/**
 * The complete panel wiring of a floating menu panel, shared by Menu
 * and NotificationCenter: `useFloating` (animated popover lifecycle,
 * trigger handlers) + `useMenuPanelWiring` (roving-tabindex sync, menu
 * keyboard handler, focus scope, merged panel ref callback). Consumers
 * render the trigger and the `FloatingPanel` themselves; `panelRef` is
 * exposed for the DOM walks that need the panel node directly (Menu's
 * virtualized pending-focus effect).
 *
 * Declaration order inside is a race contract — do not reorder:
 * `useFloating` first, because its showPopover effect must fire before
 * the wiring's focus-scope autoFocus ('root' gate — a native popover is
 * display:none until shown, focusing it would be silently dropped in
 * Chromium); the wiring's roving sync next, so the first item is the
 * tab stop before autoFocus runs (both fire in the same commit); the
 * focus scope last, its returnFocus repairing the Escape gap — the
 * hidden panel would otherwise leave focus on <body>.
 */
export function useMenuPanel({
  open,
  setOpen,
  triggerRef,
  selector,
}: UseMenuPanelOptions): {
  /** Panel behavior for `<FloatingPanel behavior={...}>`. */
  floating: FloatingBehavior;
  /** Keydown handler for the panel element. */
  handleKeyDown: (event: ReactKeyboardEvent) => void;
  /** The panel node ref — kept current by `setPanelRef`. */
  panelRef: RefObject<HTMLDivElement | null>;
  /** Ref callback wiring the panel node into floating + focus scope. */
  setPanelRef: (node: HTMLDivElement | null) => void;
} {
  const panelRef = useRef<HTMLDivElement>(null);

  const floating = useFloating({ open, setOpen, triggerRef, panelRef, animated: true });

  const { handleKeyDown, setPanelRef } = useMenuPanelWiring({
    open,
    onClose: () => setOpen(false),
    panelRef,
    floating,
    selector,
  });

  return { floating, handleKeyDown, panelRef, setPanelRef };
}
