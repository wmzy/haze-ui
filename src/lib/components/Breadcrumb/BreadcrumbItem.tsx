import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';

import { css } from '@linaria/core';

type BreadcrumbItemOwnProps = {
  /** Link URL; omit for the current page (renders a non-link span). */
  href?: string;
  children: ReactNode;
};

/**
 * MUI-OverridableComponent-shaped polymorphism (Button's pattern): own
 * props first, then the target element's props minus the colliding keys.
 * The skin and `data-slot` always land on the rendered element; the
 * parent `<li>`'s `aria-current` wiring (Breadcrumb.tsx) is untouched by
 * `as` — the trail semantics survive any element.
 */
type BreadcrumbItemProps<T extends ElementType = 'a'> =
  BreadcrumbItemOwnProps & {
    /**
     * Render element. Omitted (default) keeps the historical
     * href-driven duality: `href` renders an `<a>` wearing the link
     * skin, no `href` renders a `<span>` wearing the current-page skin.
     * An explicit `as` overrides the element and opts into the link
     * skin — the router-Link shape whose navigation lives in `to`
     * rather than `href` (`href` still lands when actually passed).
     */
    as?: T;
  } & Omit<ComponentPropsWithRef<T>, keyof BreadcrumbItemOwnProps | 'as'>;

const link = css`
  display: inline-flex;
  align-items: center;
  /* WCAG 2.5.8 target-size floor: a bare inline link's box collapses
     to the text line height (~19px). */
  min-height: var(--haze-space-6);
  color: var(--haze-color-primary);
  text-decoration: none;
  transition: color var(--haze-duration-fast);

  &:hover {
    color: var(--haze-color-primary-hover);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
    border-radius: var(--haze-radius-sm);
  }
`;

const current = css`
  color: var(--haze-color-text);
  font-weight: var(--haze-weight-medium);
`;

export default function BreadcrumbItem<T extends ElementType = 'a'>({
  href,
  as,
  className,
  children,
  ...rest
}: BreadcrumbItemProps<T>) {
  // Historical duality when `as` is omitted: href renders an anchor
  // (link skin), no href renders a span (current-page skin). An
  // explicit `as` takes the element and the link skin — Button's
  // "wiring wins" precedence (any non-default shape is navigational).
  const Tag = (as ?? (href !== undefined ? 'a' : 'span'));
  const isLink = as !== undefined || href !== undefined;
  return (
    <Tag
      {...(href !== undefined ? { href } : {})}
      data-slot='breadcrumb-item'
      x-class={[isLink ? link : current, className]}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export type { BreadcrumbItemOwnProps, BreadcrumbItemProps };
