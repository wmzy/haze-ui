import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useId } from 'react';

import { css } from '@linaria/core';

import { useControl } from 'react-use-control';

type StepStatus = 'pending' | 'active' | 'running' | 'done' | 'error';

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

const list = css`
  display: flex;
  flex-direction: column;
  font-family: var(--haze-font-sans);
`;

const item = css`
  display: flex;
  gap: var(--haze-space-3);
  padding-bottom: var(--haze-space-4);
  position: relative;

  &:last-child {
    padding-bottom: 0;
  }

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    inset-inline-start: 0.5625rem;
    top: 1.5rem;
    bottom: 0;
    width: 2px;
    background: var(--haze-color-border);
  }
`;

/* Collapsible rows stack the header button above the panel instead of
   laying children out in the connector row. */
const itemStacked = css`
  display: block;
`;

const headerButton = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-3);
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: start;
  cursor: pointer;
  border-radius: var(--haze-radius-md);

  /* No inline padding on purpose: the marker must stay flush with the
     item edge so the connector line keeps hitting its center. */
  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const marker = css`
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--haze-radius-full);
  border: 2px solid var(--haze-color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  z-index: 1;
`;

const markerPending = css`
  border-color: var(--haze-color-border);
  background: var(--haze-color-bg);
`;

const markerActive = css`
  border-color: var(--haze-color-primary);
  background: var(--haze-color-primary);
`;

const markerRunning = css`
  border-color: var(--haze-color-primary);
  background: var(--haze-color-primary);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -0.3125rem;
    border-radius: var(--haze-radius-full);
    border: 2px solid var(--haze-color-primary);
    /* Multi-second cycle on purpose: the motion tokens model transition
       durations (120/200/300ms), not loops — same call as Spinner's
       spin period; reduced-motion parks it below. */
    animation: step-timeline-pulse 1.6s var(--haze-ease) infinite;
  }

  /* WCAG 2.3.3: a single 0.01ms iteration parks the pulse at its rest
     frame — the ring settles as a static halo around the solid dot, so
     the step still reads as in-flight without motion. */
  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation-duration: 0.01ms;
      animation-iteration-count: 1;
    }
  }

  @keyframes step-timeline-pulse {
    0% {
      transform: scale(0.6);
      opacity: 0.8;
    }

    70%,
    100% {
      transform: scale(1.4);
      opacity: 0;
    }
  }
`;

const markerDone = css`
  border-color: var(--haze-color-success);
  background: var(--haze-color-success);
  color: var(--haze-color-text-inverse);
`;

const markerError = css`
  border-color: var(--haze-color-danger);
  background: var(--haze-color-danger);
  color: var(--haze-color-text-inverse);
`;

const body = css`
  flex: 1;
  min-width: 0;
  padding-top: 0.0625rem;
`;

const labelRow = css`
  display: flex;
  align-items: baseline;
  gap: var(--haze-space-2);
`;

const labelStyle = css`
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
`;

const timeStyle = css`
  margin-inline-start: auto;
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-normal);
  color: var(--haze-color-text-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const descriptionStyle = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  margin-top: var(--haze-space-1);
`;

const chevron = css`
  display: inline-flex;
  flex-shrink: 0;
  margin-block-start: var(--haze-space-1);
  color: var(--haze-color-text-muted);
  transform: rotate(0deg);
  transition: transform var(--haze-duration-fast) var(--haze-ease);
`;

const chevronOpen = css`
  transform: rotate(90deg);
`;

/* Indent past the marker column (1.25rem marker + gap) so revealed
   content aligns with the label; the item's own connector line stays in
   the marker gutter beside it. */
const panelStyle = css`
  padding-inline-start: calc(1.25rem + var(--haze-space-3));
  padding-block: var(--haze-space-1) var(--haze-space-2);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
`;

const subSteps = css`
  margin-block-start: var(--haze-space-2);
`;

const ChevronGlyph = () => (
  <svg
    width='12'
    height='12'
    viewBox='0 0 16 16'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
  >
    <path d='M6 4l4 4-4 4' />
  </svg>
);

const markerMap: Record<StepStatus, string> = {
  pending: markerPending,
  active: markerActive,
  running: markerRunning,
  done: markerDone,
  error: markerError,
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
  const panelId = useId();
  const hasPanel = content != null || children != null;
  // A toggle with nothing to reveal would be a dead button — only the
  // header of an item carrying content/child steps becomes one.
  const expandable = collapsible && hasPanel;

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  const glyph =
    icon ??
    (status === 'done' ? '✓' : status === 'error' ? '!' : undefined);

  const indicator = (
    <div data-slot='dot' x-class={[marker, markerMap[status]]}>
      {glyph}
    </div>
  );

  const headerBody = (
    <div data-slot='content' x-class={[body]}>
      <div data-slot='label-row' x-class={[labelRow]}>
        <div data-slot='label' x-class={[labelStyle]}>{label}</div>
        {time != null && (
          <span data-slot='time' x-class={[timeStyle]}>{time}</span>
        )}
      </div>
      {description && (
        <div data-slot='description' x-class={[descriptionStyle]}>{description}</div>
      )}
    </div>
  );

  return (
    <div
      data-slot='item'
      data-status={status}
      x-class={[item, expandable && itemStacked, className]}
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
            x-class={[chevron, open && chevronOpen]}
          >
            <ChevronGlyph />
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
          x-class={[panelStyle]}
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
    <div data-slot='step-timeline' x-class={[list, className]}>
      {children}
    </div>
  );
}

export default StepTimeline;
export { StepTimelineItem };
export type { StepTimelineProps, StepTimelineItemProps, StepStatus };
