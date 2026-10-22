import type {ComponentPropsWithoutRef, ReactNode, SetStateAction} from 'react';

import {css} from '@linaria/core';
import {Children, useCallback, useEffect, isValidElement, useMemo, useRef} from 'react';

import {useFloating} from '../../utils/floating';

import NavigationMenuContent from './NavigationMenuContent';
import {
  NavigationMenuItemProvider,
  useNavigationMenuContext,
} from './NavigationMenuContext';

type NavigationMenuItemProps = {
  /**
   * Identifies this item: the value `activeValue` carries while its
   * panel is open. Unique within the menu.
   */
  value: string;
  className?: string;
  /** A `<NavigationMenuTrigger>` plus (optionally) its `<NavigationMenuContent>`. */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'li'>, 'className' | 'children'>;

const item = css`
  display: flex;
  /* The fallback floating tier positions its panel absolutely inside
   * this item (top: 100%; left: 0), so it must establish the box. */
  position: relative;
`;

export default function NavigationMenuItem({
  value,
  className,
  children,
  ...rest
}: NavigationMenuItemProps) {
  const {activeValue, setActiveValue, classNames} = useNavigationMenuContext();
  const open = activeValue === value;

  // Each item owns its floating pair — the panel anchors to its own
  // trigger, and the engine's light-dismiss/Escape reconciliation is
  // scoped to exactly this pair.
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // The engine speaks boolean open/close; this menu speaks "which item
  // is active". The adapter maps true→this item's value and false→null,
  // and leaves a sibling's active value alone when this panel was never
  // the open one.
  const setOpenForEngine = useCallback(
    (update: SetStateAction<boolean>) => {
      setActiveValue((prev) => {
        const isOpen = prev === value;
        const next = typeof update === 'function' ? update(isOpen) : update;
        if (next === isOpen) return prev;
        return next ? value : null;
      });
    },
    [setActiveValue, value]
  );

  const floating = useFloating({
    open,
    setOpen: setOpenForEngine,
    triggerRef,
    panelRef,
    animated: true,
  });

  // Items without a Content child are plain links-in-waiting: the
  // trigger then skips the disclosure wiring (no aria-expanded /
  // aria-controls for a button that opens nothing).
  const hasContent = useMemo(
    () =>
      Children.toArray(children).some(
        (child) => isValidElement(child) && child.type === NavigationMenuContent
      ),
    [children]
  );

  // Focus return: a close that lands while focus rests inside this
  // item's panel (Escape with the caret on a link, the grace timer
  // while a keyboard user reads the panel) hands focus back to the
  // trigger instead of dropping it on <body> as the panel hides.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (!wasOpen || open) return;
    const panel = panelRef.current;
    const active = document.activeElement;
    if (!panel || !(active instanceof Node) || !panel.contains(active)) return;
    triggerRef.current?.focus();
  }, [open]);

  const itemValue = useMemo(
    () => ({value, open, floating, triggerRef, panelRef, hasContent}),
    [value, open, floating, triggerRef, panelRef, hasContent]
  );

  return (
    <li data-slot='item' x-class={[item, classNames?.item, className]} {...rest}>
      <NavigationMenuItemProvider value={itemValue}>
        {children}
      </NavigationMenuItemProvider>
    </li>
  );
}

export type {NavigationMenuItemProps};
