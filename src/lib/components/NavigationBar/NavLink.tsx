import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type NavLinkProps = {
  href?: string;
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

const link = css`
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text-muted);
  text-decoration: none;
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-sm);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: var(--haze-color-text);
    background: var(--haze-color-muted);
  }
`;

const activeLink = css`
  color: var(--haze-color-primary);
  font-weight: var(--haze-weight-medium);
`;

export default function NavLink({ href = '#', active, children, onClick, className }: NavLinkProps) {
  return (
    <a
      x-class={[link, active && activeLink, className]}
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </a>
  );
}

export type { NavLinkProps };
