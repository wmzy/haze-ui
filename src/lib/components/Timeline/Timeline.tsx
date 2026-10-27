import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import {
  timelineDescription,
  timelineDot,
  timelineLabel,
  timelineList,
  timelineRow,
} from '../../utils/timeline-skin';

// Timeline
type TimelineProps = {
  children: ReactNode;
  className?: string;
};

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div data-slot="timeline" x-class={[timelineList, className]} role="list">
      {children}
    </div>
  );
}

// TimelineItem
type TimelineColor = 'primary' | 'success' | 'warning' | 'danger' | 'default';

type TimelineItemProps = {
  title: string;
  description?: string;
  time?: string;
  color?: TimelineColor;
  className?: string;
};

/* Block spacing between rows — Timeline breathes wider than
   StepTimeline's space-4 (its rows carry no panel content). */
const itemEnd = css`
  padding-block-end: var(--haze-space-6);
`;

const dotWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
`;

/* Local half of the shared dot geometry: the default dot's size and
   fill. space-3 = 12px, the scale slot for the dot's shipped size. */
const dotStyle = css`
  width: var(--haze-space-3);
  height: var(--haze-space-3);
  background: var(--haze-color-border);
`;

/* Colored variants swap the fill; `default` maps to no entry so the
   base background above shows through. */
const dotColors: Partial<Record<TimelineColor, string>> = {
  primary: css`background: var(--haze-color-primary);`,
  success: css`background: var(--haze-color-success);`,
  warning: css`background: var(--haze-color-warning);`,
  danger: css`background: var(--haze-color-danger);`,
};

/* The connector as an in-flow flex child of the dot column (unlike
   StepTimeline's absolutely positioned pseudo-connector): it stretches
   the row's height. Hairline width via the space scale (space-1 halved
   — TabBar's hairline precedent). */
const line = css`
  flex: 1;
  width: calc(var(--haze-space-1) / 2);
  background: var(--haze-color-border);
  margin-top: var(--haze-space-1);
`;

const content = css`
  flex: 1;
  min-width: 0;
`;

export function TimelineItem({
  title,
  description,
  time,
  color = 'default',
  className,
}: TimelineItemProps) {
  return (
    <div data-slot="item" x-class={[timelineRow, itemEnd, className]} role="listitem">
      <div data-slot="separator" x-class={[dotWrapper]}>
        <div data-slot="dot" x-class={[timelineDot, dotStyle, dotColors[color]]} />
        <div data-slot="line" x-class={[line]} />
      </div>
      <div data-slot="content" x-class={[content]}>
        <div data-slot="title" x-class={[timelineLabel]}>{title}</div>
        {description && <div data-slot="description" x-class={[timelineDescription]}>{description}</div>}
        {time && <div data-slot="time" x-class={[timelineDescription]}>{time}</div>}
      </div>
    </div>
  );
}

export type { TimelineProps, TimelineItemProps };
