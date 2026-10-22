import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react';

import {css} from '@linaria/core';

import {getDirection} from '../../utils/direction';

import {useNavigationMenuContext} from './NavigationMenuContext';

type NavigationMenuListProps = {
  className?: string;
  /** `<NavigationMenuItem>`s. */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'ul'>, 'className' | 'children'>;

/** Enabled triggers in DOM order (the strip's arrow-key model). */
const TRIGGER_SELECTOR = '[data-haze-navigation-menu-trigger]:not([disabled])';

const list = css`
  display: flex;
  align-items: stretch;
  gap: var(--haze-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
  /* The strip's rule the active underline pierces (Tabs line-variant
   * visual language: triggers carry a 2px transparent underline raised
   * 1px over this separator; the active one fills it). */
  border-bottom: 1px solid var(--haze-color-border);
`;

/**
 * The horizontal trigger strip. Keyboard model per the WAI-ARIA
 * disclosure-navigation pattern: every trigger is its own natural Tab
 * stop (no roving tabindex — panels are disclosures, not tab panels),
 * with ←/→ moving focus between triggers and Home/End jumping to the
 * ends as the optional bar-traversal enhancement.
 */
export default function NavigationMenuList({
  className,
  onKeyDown,
  children,
  ...rest
}: NavigationMenuListProps) {
  const {classNames} = useNavigationMenuContext();

  const moveFocus = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    // Arrows follow the painted layout: under dir='rtl' ← advances.
    const rtl = getDirection(event.currentTarget) === 'rtl';
    const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    const {key} = event;
    if (key !== nextKey && key !== prevKey && key !== 'Home' && key !== 'End') {
      return;
    }
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(TRIGGER_SELECTOR)
    );
    if (items.length === 0) return;
    const current = items.findIndex((el) => el === document.activeElement);
    event.preventDefault();
    switch (key) {
      case nextKey:
        items[(current + 1 + items.length) % items.length]?.focus();
        return;
      case prevKey:
        items[(current - 1 + items.length) % items.length]?.focus();
        return;
      case 'Home':
        items[0]?.focus();
        return;
      case 'End':
        items[items.length - 1]?.focus();
        return;
    }
  };

  return (
    <ul
      role='list'
      data-slot='list'
      x-class={[list, classNames?.list, className]}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        moveFocus(event);
      }}
      {...rest}
    >
      {children}
    </ul>
  );
}

export type {NavigationMenuListProps};
