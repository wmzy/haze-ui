import type {ComponentPropsWithoutRef, ReactNode} from 'react';

import {css} from '@linaria/core';
import {useEffect} from 'react';

import {classnames} from '../../utils/classnames';
import {FloatingPanel} from '../../utils/floating';
import {panelSurface} from '../../utils/panel-skin';

import {
  useNavigationMenuContext,
  useNavigationMenuItemContext,
} from './NavigationMenuContext';

type NavigationMenuContentProps = {
  className?: string;
  /** Any ReactNode: link columns, card grids, plain lists. */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

/* Call-site deltas on the shared panel surface (utils/panel-skin): the
 * mega-menu lane is wider than a popover's — the surface's border-box
 * sizing keeps both bounds covering the padding too. */
const panelDeltas = css`
  min-width: 240px;
  max-width: 480px;
  padding: var(--haze-space-4);
`;

/**
 * The item's floating panel: anchored under its trigger through the
 * shared floating engine (native popover + anchor positioning tiers,
 * JS-positioned fallback), opened only while the item is the menu's
 * active one. Entering the panel cancels the close grace; leaving arms
 * it again — unless focus rests inside (a keyboard user reading the
 * panel keeps it).
 */
export default function NavigationMenuContent({
  className,
  children,
  ...rest
}: NavigationMenuContentProps) {
  const {
    scheduleClose,
    cancelHoverTimers,
    contentId,
    triggerId,
    classNames,
    stretchToTrigger,
  } = useNavigationMenuContext();
  const {value, floating, panelRef} = useNavigationMenuItemContext();

  // Stretch mode: pin the panel's min inline size to the trigger's —
  // measured from live rects, so it holds on every positioning tier
  // (the anchored tier could express this as anchor-size(), the
  // fallback's absolute positioning has no such reference). Re-measured
  // on every open; the stale value between opens only ever over-widens.
  const {shown, triggerRef} = floating;
  useEffect(() => {
    if (!stretchToTrigger || !shown) return;
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    panel.style.minWidth = `${trigger.getBoundingClientRect().width}px`;
  }, [stretchToTrigger, shown, triggerRef, panelRef]);

  return (
    <FloatingPanel
      ref={panelRef}
      behavior={floating}
      placement='bottom'
      id={contentId(value)}
      aria-labelledby={triggerId(value)}
      visualClass={panelSurface}
      className={classnames(panelDeltas, className, classNames?.content)}
      onMouseEnter={cancelHoverTimers}
      onMouseLeave={() => {
        const panel = panelRef.current;
        if (
          panel !== null &&
          document.activeElement instanceof Node &&
          panel.contains(document.activeElement)
        ) {
          return;
        }
        scheduleClose();
      }}
      {...rest}
    >
      {children}
    </FloatingPanel>
  );
}

export type {NavigationMenuContentProps};
