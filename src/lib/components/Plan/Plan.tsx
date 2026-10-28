import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';

import { Children, isValidElement, useId } from 'react';

import { css } from '@linaria/core';

import {
  statusDot,
  statusDotActive,
  statusDotDone,
  statusDotError,
  statusDotPending,
  statusGlyphs,
  timelineDescription,
  timelineLabel,
} from '../../utils/timeline-skin';

/* Plan's statuses: the shared agentic set minus `running` (a plan step
   is waiting, current, finished, failed or skipped — in-flight motion
   belongs to Trace/StepTimeline lines), plus this family's `active`
   and `skipped`. */
type PlanStatus = 'pending' | 'active' | 'done' | 'error' | 'skipped';

type PlanProps = {
  /** Heading rendered above the list; no default copy. */
  title?: ReactNode;
  /**
   * Renders the visible progress text from the counted item statuses.
   * The default is the locale-neutral `2 / 5` count — pass a formatter
   * for worded copy, the component itself ships no translatable strings.
   */
  summary?: (done: number, total: number) => ReactNode;
  /** `Plan.Item` elements; their statuses feed the progress summary. */
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'title'>;

type PlanItemProps = {
  label: ReactNode;
  description?: ReactNode;
  status?: PlanStatus;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'li'>, 'children'>;

const root = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
  font-family: var(--haze-font-sans);
`;

const header = css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--haze-space-3);
`;

const titleStyle = css`
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
`;

const summaryStyle = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  flex-shrink: 0;
`;

const progressTrack = css`
  height: 4px;
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-bg-subtle);
  overflow: hidden;
`;

const progressFill = css`
  height: 100%;
  border-radius: inherit;
  background: var(--haze-color-primary);
  transition: width var(--haze-duration-normal) var(--haze-ease);
`;

const list = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
`;

const item = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-2);
  padding: var(--haze-space-1) 0;
`;

/* Plan rows carry no connector line, so the ring rides the shared
   statusDot geometry (utils/timeline-skin) plus this family's optical
   nudge onto the label's baseline — a documented sub-token keep. */
const indicatorNudge = css`
  margin-top: 0.0625rem;
`;

/* `skipped` is Plan's own arm: a dashed ring instead of a status
   color, over no fill. */
const indicatorSkipped = css`
  border: 2px dashed var(--haze-color-border);
  background: transparent;
`;

const body = css`
  flex: 1;
  min-width: 0;
  padding-top: 0.0625rem;
`;

const labelDone = css`
  color: var(--haze-color-text-secondary);
`;

const labelSkipped = css`
  color: var(--haze-color-text-muted);
  text-decoration: line-through;
`;

const indicatorMap: Record<PlanStatus, string> = {
  pending: statusDotPending,
  active: statusDotActive,
  done: statusDotDone,
  error: statusDotError,
  skipped: indicatorSkipped,
};

const labelStatusMap: Record<PlanStatus, string | undefined> = {
  pending: undefined,
  active: undefined,
  done: labelDone,
  error: undefined,
  skipped: labelSkipped,
};

function PlanItem({
  label,
  description,
  status = 'pending',
  className,
  ...rest
}: PlanItemProps) {
  return (
    <li data-slot='plan-item' x-class={[item, className]} {...rest}>
      {/* Decorative: the status glyph duplicates what the surrounding
          copy conveys; consumers word it via `label`/`description`. */}
      <span
        data-slot='plan-indicator'
        aria-hidden='true'
        x-class={[statusDot, indicatorNudge, indicatorMap[status]]}
      >
        {status === 'done' || status === 'error' ? statusGlyphs[status] : undefined}
      </span>
      <div data-slot='plan-body' x-class={body}>
        <div data-slot='plan-label' x-class={[timelineLabel, labelStatusMap[status]]}>
          {label}
        </div>
        {description !== undefined && (
          <div data-slot='plan-description' x-class={timelineDescription}>
            {description}
          </div>
        )}
      </div>
    </li>
  );
}

function Plan({ title, summary, children, className, ...rest }: PlanProps) {
  const titleId = useId();
  // Count only direct Plan.Item children: statuses drive the progress
  // summary, everything else the consumer interleaves renders as-is.
  const items = Children.toArray(children).filter(
    (child): child is ReactElement<PlanItemProps> =>
      isValidElement(child) && child.type === PlanItem
  );
  const total = items.length;
  const done = items.filter((item) => item.props.status === 'done').length;

  return (
    <div data-slot='plan' x-class={[root, className]} {...rest}>
      {(title !== undefined || total > 0) && (
        <div data-slot='plan-header' x-class={header}>
          {title !== undefined && (
            <div id={titleId} data-slot='plan-title' x-class={titleStyle}>
              {title}
            </div>
          )}
          {total > 0 && (
            <span data-slot='plan-summary' x-class={summaryStyle}>
              {summary ? summary(done, total) : `${done} / ${total}`}
            </span>
          )}
        </div>
      )}
      {total > 0 && (
        <div
          data-slot='plan-progress'
          role='progressbar'
          aria-labelledby={title !== undefined ? titleId : undefined}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          x-class={progressTrack}
        >
          <div
            data-slot='plan-progress-fill'
            x-class={progressFill}
            style={{ width: `${Math.round((done / total) * 100)}%` }}
          />
        </div>
      )}
      <ul data-slot='plan-list' x-class={list}>
        {children}
      </ul>
    </div>
  );
}

export default Plan;
export { PlanItem };
export type { PlanProps, PlanItemProps, PlanStatus };
