import type {
  ComponentPropsWithoutRef,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';

import {css} from '@linaria/core';

import { focusRingVisible } from '../../utils/focus-ring';

import {
  useNavigationMenuContext,
  useNavigationMenuItemContext,
} from './NavigationMenuContext';

type NavigationMenuTriggerProps = {
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

/** Shared trigger floor — the Tabs line-variant language: a transparent
 * 2px underline slot overlapping the strip's separator by its own 1px,
 * so the active underline reads as piercing the rule. */
const base = css`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2) var(--haze-space-4);
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  transition:
    color var(--haze-duration-fast),
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &:hover {
    color: var(--haze-color-text);
  }

  /* Keyboard ring: utils/focus-ring's focusRingVisible, composed below
     at the trigger's x-class. */

  /* Forced-colors: the Highlight outline comes from that composed
     ring — only the inset offset stays local (the strip may scroll
     sideways, an outer outline would clip). */
  @media (forced-colors: active) {
    &:focus-visible {
      outline-offset: -2px;
    }
  }
`;

/** The open trigger: primary text with the filled underline piercing
 * the strip's rule. */
const active = css`
  color: var(--haze-color-primary);
  border-bottom-color: var(--haze-color-primary);

  /* Forced-colors: the primary underline and text flatten onto
     CanvasText — the Windows-native selection renders instead. */
  @media (forced-colors: active) {
    background: Highlight;
    color: HighlightText;
    border-bottom-color: Highlight;
  }
`;

/**
 * The disclosure button of one menu item. Hover opens after the menu's
 * intent dwell (instantly while a sibling panel is open), focus follows
 * the same path, click toggles immediately, Escape closes. Items
 * without a `NavigationMenuContent` sibling render as plain buttons —
 * no disclosure attributes and no toggle for a button that opens
 * nothing (the consumer's own `onClick` rides through untouched).
 */
export default function NavigationMenuTrigger({
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  children,
  ...rest
}: NavigationMenuTriggerProps) {
  const {
    hoverTrigger,
    scheduleClose,
    cancelHoverTimers,
    setActiveValue,
    contentId,
    triggerId,
    classNames,
  } = useNavigationMenuContext();
  const {value, open, floating, triggerRef, hasContent} =
    useNavigationMenuItemContext();

  // A keyboard user working inside this panel must not have it vanish
  // under incidental pointer movement — pointer-leave close requests
  // are dropped while focus rests in the panel.
  const focusInsidePanel = () => {
    const panel = floating.panelRef.current;
    return (
      panel !== null &&
      document.activeElement instanceof Node &&
      panel.contains(document.activeElement)
    );
  };

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!hasContent || event.defaultPrevented) return;
    cancelHoverTimers();
    floating.onTriggerClick();
  };

  const handleBlur = (event: ReactFocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    // Tabbing from the trigger into its own panel keeps the panel open;
    // leaving the pair altogether arms the grace close.
    const next = event.relatedTarget;
    const panel = floating.panelRef.current;
    if (next instanceof Node && panel?.contains(next)) {
      cancelHoverTimers();
      return;
    }
    scheduleClose();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Escape' && open) {
      cancelHoverTimers();
      setActiveValue(null);
    }
  };

  return (
    <button
      type='button'
      ref={triggerRef}
      data-haze-navigation-menu-trigger=''
      data-slot='trigger'
      id={hasContent ? triggerId(value) : undefined}
      style={floating.triggerStyle}
      aria-expanded={hasContent ? open : undefined}
      aria-controls={hasContent ? contentId(value) : undefined}
      onPointerDown={floating.onTriggerPointerDown}
      onClick={handleClick}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (hasContent) hoverTrigger(value);
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        if (focusInsidePanel()) return;
        scheduleClose();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (hasContent) hoverTrigger(value);
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      x-class={[base, focusRingVisible, open && active, classNames?.trigger, className]}
      {...rest}
    >
      {children}
    </button>
  );
}

export type {NavigationMenuTriggerProps};
