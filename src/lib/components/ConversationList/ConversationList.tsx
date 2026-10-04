import type { ReactNode } from 'react';

import { Children, useRef } from 'react';
import { css } from '@linaria/core';

import { useEndReached } from '../../utils/use-end-reached';

type ConversationListProps = {
  children: ReactNode;
  /**
   * Infinite-scroll trigger on the list's scrollport: fired when the
   * scroll position comes within 200px of the end. Entering the zone
   * fires once; staying inside does not re-fire; scrolling back out
   * re-arms, and growth of the rendered children re-arms too, so a
   * still-short list chains straight into the next page. Typical use:
   * append the next page of conversations. Ignored when not provided.
   */
  onLoadMore?: () => void;
  className?: string;
};

const list = css`
  display: flex;
  flex-direction: column;
  font-family: var(--haze-font-sans);
  overflow-y: auto;
`;

export default function ConversationList({ children, onLoadMore, className }: ConversationListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEndReached({
    ref: listRef,
    onEndReached: onLoadMore,
    threshold: 200,
    contentUnits: Children.count(children),
  });

  return (
    <div ref={listRef} data-slot='conversation-list' x-class={[list, className]}>
      {children}
    </div>
  );
}

export type { ConversationListProps };
