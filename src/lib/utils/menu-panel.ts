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
 * The complete panel wiring of a floating menu panel, shared by Menu
 * and NotificationCenter: `useFloating` (animated popover lifecycle,
 * trigger handlers) + the roving-tabindex sync + the menu keyboard
 * handler + the focus scope, plus the merged panel ref callback that
 * feeds the panel node to both the floating ref and the focus scope.
 * Consumers render the trigger and the `FloatingPanel` themselves;
 * `panelRef` is exposed for the DOM walks that need the panel node
 * directly (Menu's virtualized pending-focus effect).
 *
 * Declaration order inside is a race contract — do not reorder:
 * `useFloating` first, because its showPopover effect must fire before
 * the focus scope's autoFocus (a native popover is display:none until
 * shown — focusing it would be silently dropped in Chromium); the
 * roving sync next, because the first item must be the tab stop before
 * autoFocus runs (both fire in the same commit); the focus scope last,
 * its returnFocus repairing the Escape gap — the hidden panel would
 * otherwise leave focus on <body>.
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

  useRovingTabindex({ menuRef: panelRef, active: open, selector });
  const handleKeyDown = useMenuKeyboard({
    menuRef: panelRef,
    onClose: () => setOpen(false),
    selector,
  });

  const setScope = useFocusScope({ enabled: open, autoFocus: true, returnFocus: true });

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      setScope(node);
    },
    [setScope]
  );

  return { floating, handleKeyDown, panelRef, setPanelRef };
}
