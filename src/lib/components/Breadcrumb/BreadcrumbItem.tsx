import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type BreadcrumbItemProps = {
  href?: string;
  className?: string;
  children: ReactNode;
};

const link = css`
  color: var(--pbl-color-primary);
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: var(--pbl-color-primary-hover);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
    border-radius: var(--pbl-radius-sm);
  }
`;

const current = css`
  color: var(--pbl-color-text);
  font-weight: var(--pbl-weight-medium);
`;

export default function BreadcrumbItem({
  href,
  className,
  children,
}: BreadcrumbItemProps) {
  return href ? (
    <a href={href} x-class={[link, className]}>{children}</a>
  ) : (
    <span x-class={[current, className]}>{children}</span>
  );
}

export type {BreadcrumbItemProps};
