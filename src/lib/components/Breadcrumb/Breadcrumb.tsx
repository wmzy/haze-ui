import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';
import { Children } from 'react';

type BreadcrumbProps = {
  separator?: ReactNode;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'nav'>, 'children' | 'className'>;

const nav = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
`;

const list = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  white-space: nowrap;
`;

const sep = css`
  color: var(--haze-color-text-muted);
  user-select: none;
`;

export default function Breadcrumb({
  separator = '/',
  'aria-label': ariaLabel = 'Breadcrumb',
  className,
  children,
  ...rest
}: BreadcrumbProps) {
  const items = Children.toArray(children);

  return (
    <nav
      data-slot='breadcrumb'
      aria-label={ariaLabel}
      x-class={[nav, className]}
      {...rest}
    >
      <ol data-slot='list' className={list}>
        {items.map((child, i) => (
          <li
            key={i}
            data-slot='item'
            aria-current={i === items.length - 1 ? 'page' : undefined}
          >
            {child}
            {i < items.length - 1 && (
              <span data-slot='separator' className={sep} aria-hidden='true'>
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export type { BreadcrumbProps };
