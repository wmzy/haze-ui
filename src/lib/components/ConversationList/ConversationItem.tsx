import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import { truncate } from '../../utils/truncate';

type ConversationItemProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  end?: ReactNode;
  className?: string;
};

const item = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  padding: var(--haze-space-3) var(--haze-space-4);
  cursor: pointer;
  border-radius: var(--haze-radius-md);
  transition: background var(--haze-duration-fast);
  text-align: start;
  width: 100%;
  border: none;
  background: none;
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);

  &:hover {
    background: var(--haze-color-bg-muted);
  }
`;

const activeItem = css`
  background: var(--haze-color-bg-muted);
`;

const body = css`
  flex: 1;
  min-width: 0;
`;

/** Title/subtitle text — the single-line clipping contract rides the
 * shared truncate class (utils/truncate), composed at the call site;
 * only the typography deltas stay here. */
const titleStyle = css`
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
`;

const subtitleStyle = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  margin-top: var(--haze-space-0);
`;

const endSlot = css`
  flex-shrink: 0;
`;

export default function ConversationItem({
  title,
  subtitle,
  active,
  onClick,
  end,
  className,
}: ConversationItemProps) {
  return (
    <button
      data-slot='conversation-item'
      x-class={[item, active && activeItem, className]}
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
    >
      <div x-class={[body]}>
        <div data-slot='title' x-class={[truncate, titleStyle]}>{title}</div>
        {subtitle && <div data-slot='description' x-class={[truncate, subtitleStyle]}>{subtitle}</div>}
      </div>
      {end && <div data-slot='suffix' x-class={[endSlot]}>{end}</div>}
    </button>
  );
}

export type { ConversationItemProps };
