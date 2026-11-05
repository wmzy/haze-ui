import type { AriaAttributes, MouseEvent } from 'react';

/**
 * Shared anchor navigation-link semantics for the two nav item surfaces —
 * NavigationBar's NavLink (polymorphic `as` link) and Sidebar's SidebarItem
 * (icon + label anchor), formerly copy-pasted per component directory:
 *
 * - the effective current-page state resolved from the explicit `active`
 *   prop with the standard aria-current="page" attribute as fallback, so
 *   routers can drive highlighting through the aria attribute without
 *   knowing the component;
 * - the back-filled aria-current value to render ('page' when current, the
 *   caller's own attribute untouched otherwise);
 * - the placeholder-href click: a missing or '#' href (both components
 *   default the prop to '#') means button semantics — the default is
 *   suppressed so the page does not jump to '#', then the consumer's
 *   handler sees the event; real hrefs pass through untouched and the
 *   caller decides whether to prevent navigation (SPA router Links do).
 *
 * Pure TS — no css, no hooks, no DOM access (RSC-safe; react imports are
 * type-only and elided in dist).
 */

/** The aria-current attribute's value space per React's DOM types. */
type NavAriaCurrent = AriaAttributes['aria-current'];

/** Effective current-page state: the explicit prop wins, else the standard
 * aria-current="page" attribute marks the current view. */
export function resolveNavCurrent(
  active: boolean | undefined,
  ariaCurrent: NavAriaCurrent,
): boolean {
  return active ?? ariaCurrent === 'page';
}

/** The aria-current value to render: 'page' when current, otherwise the
 * caller's own attribute value untouched (step/date/... pass through). */
export function resolveNavAriaCurrent(
  isActive: boolean,
  ariaCurrent: NavAriaCurrent,
): NavAriaCurrent {
  return isActive ? 'page' : ariaCurrent;
}

/** Placeholder-href navigate: '#' (or omitted — the anchor default) keeps
 * button semantics, so the default is suppressed before the consumer's
 * handler runs; real hrefs pass through untouched. */
export function handlePlaceholderHrefNavigate<T extends HTMLElement = HTMLElement>(
  href: string,
  onClick: ((event: MouseEvent<T>) => void) | undefined,
): (event: MouseEvent<T>) => void {
  return (event) => {
    if (href === '#') {
      event.preventDefault();
    }
    onClick?.(event);
  };
}
