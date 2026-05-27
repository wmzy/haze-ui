import type { ReactNode } from 'react';

import { css } from '@linaria/core';

// Timeline
type TimelineProps = {
  children: ReactNode;
  className?: string;
};

const base = css`
  display: flex;
  flex-direction: column;
  font-family: var(--haze-font-sans);
`;

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div x-class={[base, className]} role="list">
      {children}
    </div>
  );
}

// TimelineItem
type TimelineItemProps = {
  title: string;
  description?: string;
  time?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  className?: string;
};

const item = css`
  display: flex;
  gap: var(--haze-space-3);
  position: relative;
  padding-bottom: var(--haze-space-6);

  &:last-child {
    padding-bottom: 0;
  }
`;

const dotWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
`;

const dot = css`
  width: 12px;
  height: 12px;
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-border);
  flex-shrink: 0;
  z-index: 1;
`;

const dotColors = {
  primary: css`background: var(--haze-color-primary);`,
  success: css`background: var(--haze-color-success);`,
  warning: css`background: var(--haze-color-warning);`,
  danger: css`background: var(--haze-color-danger);`,
  default: css``,
} as const;

const line = css`
  flex: 1;
  width: 2px;
  background: var(--haze-color-border);
  margin-top: var(--haze-space-1);
`;

const content = css`
  flex: 1;
  min-width: 0;
`;

const titleStyle = css`
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
`;

const descStyle = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  margin-top: var(--haze-space-1);
`;

const timeStyle = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  margin-top: var(--haze-space-1);
`;

export function TimelineItem({
  title,
  description,
  time,
  color = 'default',
  className,
}: TimelineItemProps) {
  return (
    <div x-class={[item, className]} role="listitem">
      <div x-class={[dotWrapper]}>
        <div x-class={[dot, dotColors[color]]} />
        <div x-class={[line]} />
      </div>
      <div x-class={[content]}>
        <div x-class={[titleStyle]}>{title}</div>
        {description && <div x-class={[descStyle]}>{description}</div>}
        {time && <div x-class={[timeStyle]}>{time}</div>}
      </div>
    </div>
  );
}

export type { TimelineProps, TimelineItemProps };
