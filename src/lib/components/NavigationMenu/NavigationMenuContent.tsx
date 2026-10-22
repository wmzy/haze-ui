import type {ComponentPropsWithoutRef, ReactNode} from 'react';

import {css} from '@linaria/core';
import {useEffect} from 'react';

import {classnames} from '../../utils/classnames';
import {FloatingPanel} from '../../utils/floating';

import {
  useNavigationMenuContext,
  useNavigationMenuItemContext,
} from './NavigationMenuContext';

type NavigationMenuContentProps = {
  className?: string;
  /** Any ReactNode: link columns, card grids, plain lists. */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

/** Visual skin applied on every rendering tier of the panel. */
const panelVisuals = css`
  /* min/max-width pairs with padding + border: border-box keeps both
   * bounds covering the padding too (panel-family box-sizing
   * contract). Mega-menu panels get a wider lane than a popover's. */
  box-sizing: border-box;
  min-width: 240px;
  max-width: 480px;
  padding: var(--haze-space-4);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  box-shadow: var(--haze-shadow-lg);

  /* Forced-colors: the UA keeps the author border visible by forcing
     its color to CanvasText — restated so the panel stays separated
     from the Canvas behind it deterministically. */
  @media (forced-colors: active) {
    border-color: CanvasText;
  }
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
      visualClass={panelVisuals}
      className={classnames(className, classNames?.content)}
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
