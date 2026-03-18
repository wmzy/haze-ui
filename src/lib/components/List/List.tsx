import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type ListProps = {
  variant?: 'unordered' | 'ordered' | 'none';
  className?: string;
  children: ReactNode;
};

const base = css`
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  color: var(--pbl-color-text);
  line-height: var(--pbl-leading-normal);
  margin: 0;
  padding-left: var(--pbl-space-5);
`;

const variantStyles = {
  unordered: css`
    list-style-type: disc;
  `,
  ordered: css`
    list-style-type: decimal;
  `,
  none: css`
    list-style-type: none;
    padding-left: 0;
  `,
} as const;

export default function List({
  variant = 'unordered',
  className,
  children,
}: ListProps) {
  const Tag = variant === 'ordered' ? 'ol' : 'ul';

  return (
    <Tag x-class={[base, variantStyles[variant], className]}>
      {children}
    </Tag>
  );
}

export type {ListProps};
