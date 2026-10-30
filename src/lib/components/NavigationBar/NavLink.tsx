import type { ComponentPropsWithRef, ElementType, MouseEvent } from 'react';

import { css } from '@linaria/core';

import { focusRingVisible } from '../../utils/focus-ring';

/**
 * Extends the rendered element's native attributes (anchor by default):
 * everything not listed below is spread onto it, so callers can inject
 * `target`, `rel`, `aria-*`, and friends.
 */
type NavLinkOwnProps = {
  href?: string;
  /**
   * Explicit active state. Falls back to `aria-current="page"` when omitted,
   * letting routers drive highlighting through the standard aria attribute.
   */
  active?: boolean;
  /**
   * Element-agnostic click: whatever element `as` rendered, the
   * consumer's handler sees the event first — the placeholder-href
   * `preventDefault` rides after it.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

/**
 * Polymorphic like Button's `as` (the anchor default mirrors NavLink's
 * native root): the link skin, the `aria-current` wiring and the
 * placeholder-href click handling always land on the rendered element —
 * `as` with a router Link keeps NavLink's active styling while the
 * router owns navigation.
 */
type NavLinkProps<T extends ElementType = 'a'> = NavLinkOwnProps & {
  /** Render element — 'a' (default) or any component that forwards
   * props and ref to a DOM element (a router Link). */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof NavLinkOwnProps | 'as'>;

const link = css`
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text-muted);
  text-decoration: none;
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-sm);
  cursor: pointer;
  transition: color var(--haze-duration-fast), background var(--haze-duration-fast);

  &:hover {
    color: var(--haze-color-text);
    background: var(--haze-color-bg-muted);
  }

  /* Keyboard ring: utils/focus-ring's focusRingVisible, composed on
     the link below — the navigation family's lone surface without a
     keyboard focus indicator before this. */
`;

const activeLink = css`
  color: var(--haze-color-primary);
  font-weight: var(--haze-weight-medium);
`;

export default function NavLink<T extends ElementType = 'a'>({
  href = '#',
  active,
  as,
  className,
  'aria-current': ariaCurrent,
  onClick,
  children,
  ...rest
}: NavLinkProps<T>) {
  const Tag = (as ?? 'a');
  const isActive = active ?? ariaCurrent === 'page';

  return (
    <Tag
      data-slot='nav-link'
      x-class={[link, focusRingVisible, isActive && activeLink, className]}
      href={href}
      aria-current={isActive ? 'page' : ariaCurrent}
      {...rest}
      onClick={(event: MouseEvent<HTMLElement>) => {
        // A missing or '#' href means button semantics (e.g. a Logout
        // action): keep suppressing the default so the page does not jump
        // to '#'. Real hrefs pass through untouched and the caller decides
        // whether to prevent navigation (SPA router Links do).
        if (href === '#') {
          event.preventDefault();
        }
        // Element-agnostic event: whatever element `as` rendered, the
        // consumer's handler sees it, typed element-agnostic above.
        onClick?.(event);
      }}
    >
      {children}
    </Tag>
  );
}

export type { NavLinkOwnProps, NavLinkProps };
