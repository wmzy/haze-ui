import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type ListProps = {
  variant?: 'unordered' | 'ordered' | 'none';
  className?: string;
  children: ReactNode;
  /**
   * Explicit load-more area rendered as the final list item. Zero
   * policy: the consumer decides what appears — a "Load more" button, a
   * skeleton, a spinner. Pair it with whatever triggers the next page:
   * the consumer's own scroll logic (e.g. VirtualList `onEndReached`
   * driving the data) or a plain button inside the slot; the slot itself
   * has no behavior.
   */
  loadMore?: ReactNode;
};

const base = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-normal);
  margin: 0;
  padding-inline-start: var(--haze-space-5);
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
    padding-inline-start: 0;
  `,
} as const;

const loadMoreSlot = css`
  list-style: none;
  padding: var(--haze-space-1) 0;
`;

export default function List({
  variant = 'unordered',
  className,
  children,
  loadMore,
}: ListProps) {
  const Tag = variant === 'ordered' ? 'ol' : 'ul';

  return (
    <Tag data-slot="list" x-class={[base, variantStyles[variant], className]}>
      {children}
      {loadMore && (
        <li data-slot="load-more" x-class={[loadMoreSlot]}>
          {loadMore}
        </li>
      )}
    </Tag>
  );
}

export type { ListProps };
