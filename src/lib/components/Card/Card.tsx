import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type CardProps = {
  variant?: 'elevated' | 'outlined' | 'filled';
  className?: string;
  children: ReactNode;
};

const base = css`
  border-radius: var(--pbl-radius-lg);
  padding: var(--pbl-space-5);
  font-family: var(--pbl-font-sans);
  color: var(--pbl-color-text);
`;

const variants = {
  elevated: css`
    background: var(--pbl-color-bg);
    box-shadow: var(--pbl-shadow-md);
  `,
  outlined: css`
    background: var(--pbl-color-bg);
    border: 1px solid var(--pbl-color-border);
  `,
  filled: css`
    background: var(--pbl-color-bg-subtle);
  `,
} as const;

export default function Card({
  variant = 'elevated',
  className,
  children,
}: CardProps) {
  return (
    <div x-class={[base, variants[variant], className]}>
      {children}
    </div>
  );
}

export type {CardProps};
