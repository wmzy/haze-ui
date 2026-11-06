import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import { focusRingVisible } from '../../utils/focus-ring';
import { navItemActive, navItemBase } from '../../utils/nav-item-skin';
import { truncate } from '../../utils/truncate';

type ConversationItemProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  end?: ReactNode;
  className?: string;
};

/* Sizing/typography delta on the shared navItemBase chrome
 * (utils/nav-item-skin.ts): the conversation row is a full-width
 * block-level flex row, so navItemBase's centered inline-flex is
 * suppressed through a raised-specificity arm (the button already
 * carries data-slot='conversation-item') — never through source
 * order, which disagrees between dev injection and dist split-css
 * (Sidebar precedent). */
const item = css`
  gap: var(--haze-space-3);
  width: 100%;
  padding: var(--haze-space-3) var(--haze-space-4);
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  text-align: start;

  &[data-slot='conversation-item'] {
    display: flex;
    justify-content: flex-start;
  }
`;

/* Active delta on the shared navItemActive arm (utils/nav-item-skin.ts):
 * the conversation row keeps the plain text pair — currency is carried
 * by the resting wash — pinned through hover over the same bg-muted
 * wash (ActivityRail precedent). The resting background rides the
 * raised-specificity arm to clear navItemBase's plain background:
 * transparent without relying on source order (Sidebar precedent). */
const itemActive = css`
  --haze-nav-item-active-color: var(--haze-color-text);
  --haze-nav-item-active-hover-bg: var(--haze-color-bg-muted);

  &[data-slot='conversation-item'] {
    background: var(--haze-color-bg-muted);
  }
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
      x-class={[
        navItemBase,
        item,
        focusRingVisible,
        active && navItemActive,
        active && itemActive,
        className,
      ]}
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
