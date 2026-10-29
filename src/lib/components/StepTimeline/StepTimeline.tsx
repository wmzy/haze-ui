import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { AgenticStatus } from '../../utils/agentic-status';

import { useId } from 'react';

import { css } from '@linaria/core';

import { useControl } from 'react-use-control';

import { useOpenWithChange } from '../../utils/floating';

import { ChevronRight } from '../../icons';
import {
  chevronPair,
  headerButton,
  itemStacked,
  panelBase,
  statusDot,
  statusDotActive,
  statusDotDone,
  statusDotError,
  statusDotPending,
  statusDotRunning,
  statusGlyphs,
  timelineDescription,
  timelineDot,
  timelineLabel,
  timelineList,
  timelineRow,
} from '../../utils/timeline-skin';

type StepStatus = AgenticStatus | 'active';

type StepTimelineProps = {
  children: ReactNode;
  className?: string;
};

type StepTimelineItemProps = {
  label: ReactNode;
  description?: ReactNode;
  status?: StepStatus;
  /** Timing/duration shown muted at the inline end of the label, e.g. `'2.4s'`. */
  time?: ReactNode;
  /** Replaces the glyph inside the status marker (the marker ring keeps its status color). */
  icon?: ReactNode;
  /** Turns the header into a disclosure toggle for `content`/child steps. */
  collapsible?: boolean;
  /** Extra content revealed below the header while expanded. */
  content?: ReactNode;
  /** Controlled/uncontrolled expanded state of a collapsible item (default `false`). */
  open?: ControlOrValue<boolean>;
  /** Fires on every expand/collapse transition, whatever drove it. */
  onOpenChange?: (open: boolean) => void;
  /** Nested `StepTimelineItem`s — rendered as an indented sub-timeline. */
  children?: ReactNode;
  className?: string;
};

/* Local half of the shared row skeleton: the tighter block spacing and
   the connector — an absolutely positioned pseudo line in the marker
   gutter (unlike Timeline's in-flow flex child). Marker is space-5
   (20px); the connector starts one space-1 below it and is inset to
   its center minus half the hairline so it hits the ring midline. All
   geometry rides the space scale, so compact density scales marker and
   connector together. */
const connectorRow = css`
  padding-block-end: var(--haze-space-4);

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    inset-inline-start: calc(var(--haze-space-5) / 2 - 1px);
    top: calc(var(--haze-space-5) + var(--haze-space-1));
    bottom: 0;
    width: 2px;
    background: var(--haze-color-border);
  }
`;

/* The status ring rides the shared statusDot geometry and arm set
   (utils/timeline-skin); timelineDot stays in the mix for the z-lift
   that keeps the ring above this family's absolutely positioned
   connector line. */

const body = css`
  flex: 1;
  min-width: 0;
  /* 1px optical nudge so the label's baseline sits on the marker's
     midline — sub-token by design, documented keep. */
  padding-top: 0.0625rem;
`;

const labelRow = css`
  display: flex;
  align-items: baseline;
  gap: var(--haze-space-2);
`;

/* The label and description ride the shared timeline text skins
   (utils/timeline-skin); only the inline timestamp is StepTimeline's
   own — it sits at the label row's inline end, not below it. */
const timeStyle = css`
  margin-inline-start: auto;
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-normal);
  color: var(--haze-color-text-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const subSteps = css`
  margin-block-start: var(--haze-space-2);
`;

const markerMap: Record<StepStatus, string> = {
  pending: statusDotPending,
  active: statusDotActive,
  running: statusDotRunning,
  done: statusDotDone,
  error: statusDotError,
};

function StepTimelineItem({
  label,
  description,
  status = 'pending',
  time,
  icon,
  collapsible = false,
  content,
  open: openControl,
  onOpenChange,
  children,
  className,
}: StepTimelineItemProps) {
  const [open, setOpen] = useControl(openControl, false);
  const handleSetOpen = useOpenWithChange(open, setOpen, onOpenChange);
  const panelId = useId();
  const hasPanel = content != null || children != null;
  // A toggle with nothing to reveal would be a dead button — only the
  // header of an item carrying content/child steps becomes one.
  const expandable = collapsible && hasPanel;

  const toggleOpen = () => handleSetOpen(!open);

  const glyph =
    icon ??
    (status === 'done' || status === 'error' ? statusGlyphs[status] : undefined);

  const indicator = (
    <div data-slot='dot' x-class={[timelineDot, statusDot, markerMap[status]]}>
      {glyph}
    </div>
  );

  const headerBody = (
    <div data-slot='content' x-class={[body]}>
      <div data-slot='label-row' x-class={[labelRow]}>
        <div data-slot='label' x-class={[timelineLabel]}>{label}</div>
        {time != null && (
          <span data-slot='time' x-class={[timeStyle]}>{time}</span>
        )}
      </div>
      {description && (
        <div data-slot='description' x-class={[timelineDescription]}>{description}</div>
      )}
    </div>
  );

  return (
    <div
      data-slot='item'
      data-status={status}
      x-class={[timelineRow, connectorRow, expandable && itemStacked, className]}
    >
      {expandable ? (
        <button
          type='button'
          data-slot='header'
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggleOpen}
          x-class={[headerButton]}
        >
          {indicator}
          {headerBody}
          <span
            data-slot='icon'
            aria-hidden='true'
            x-class={[chevronPair.closed, open && chevronPair.open]}
          >
            {/* lucide ChevronRight at 12px with a compensating 3-unit
                stroke: the 24-unit viewBox renders at half the scale of
                the old 16-unit inline glyph, so strokeWidth 3 keeps the
                shipped 1.5px rendered stroke. */}
            <ChevronRight
              size={12}
              strokeWidth={3}
              aria-hidden='true'
              focusable='false'
            />
          </span>
        </button>
      ) : (
        <>
          {indicator}
          {headerBody}
        </>
      )}
      {hasPanel && (
        <div
          data-slot='panel'
          id={expandable ? panelId : undefined}
          hidden={expandable && !open}
          x-class={[panelBase]}
        >
          {content}
          {children != null && (
            <div data-slot='sub-steps' x-class={[subSteps]}>
              <StepTimeline>{children}</StepTimeline>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepTimeline({ children, className }: StepTimelineProps) {
  return (
    <div data-slot='step-timeline' x-class={[timelineList, className]}>
      {children}
    </div>
  );
}

export default StepTimeline;
export { StepTimelineItem };
export type { StepTimelineProps, StepTimelineItemProps, StepStatus };
