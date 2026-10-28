import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { AgenticStatus } from '../../utils/agentic-status';

import { css } from '@linaria/core';
import { useEffect, useId, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { useStrings } from '../LocaleProvider';
import { ChevronRight } from '../../icons';
import { srOnly } from '../../utils/sr-only';
import { agenticStatusLabel } from '../../utils/agentic-status';
import {
  chevronPair,
  disclosureMonoBody,
  headerButton,
  itemStacked,
  panelBase,
  statusDot,
  statusDotDone,
  statusDotError,
  statusDotPending,
  statusDotRunning,
  statusGlyphs,
  timelineList,
} from '../../utils/timeline-skin';

/**
 * Line-by-line reasoning trace for agentic UIs (the shadcn Trace shape):
 * `<Trace>` lays out `<TraceItem>` steps, each carrying a status marker,
 * a title, an optional custom icon and an optional disclosure revealing
 * `details` below the line. Status transitions are mirrored to screen
 * readers through a per-item sr-only live region.
 */

type TraceStatus = AgenticStatus;

type TraceProps = {
  /** `TraceItem` steps composing the trace, one per line. */
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

type TraceItemProps = {
  /** The step's headline — the line's visible text. */
  title: ReactNode;
  status?: TraceStatus;
  /** Replaces the status glyph inside the marker (the marker keeps its status ring). */
  icon?: ComponentType;
  /** Payload revealed by the line's disclosure toggle; omit for a plain line. */
  details?: ReactNode;
  /** Controlled/uncontrolled expanded state of the details panel (default `false`). */
  open?: ControlOrValue<boolean>;
  /** Fires on every expand/collapse transition, whatever drove it. */
  onOpenChange?: (open: boolean) => void;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'title'>;

type TraceDetailsProps = {
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const item = css`
  padding-block: var(--haze-space-2);

  &:first-child {
    padding-block-start: 0;
  }

  &:not(:last-child) {
    border-block-end: 1px solid var(--haze-color-border);
  }
`;

/* Plain lines lay the marker and title out in a flex row; expandable
   ones stack the shared header button above the panel (itemStacked in
   utils/timeline-skin). The two display arms are applied exclusively —
   a shared `block` arm could never win the same-specificity tie
   against this file's flex row by stylesheet order alone. */
const itemRow = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-3);
`;

const titleStyle = css`
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
`;

/* The status ring rides the shared statusDot geometry and arm set
   (utils/timeline-skin); only the Trace-specific row chrome above and
   the sr-only announcement wiring below are local. */
const markerMap: Record<TraceStatus, string> = {
  pending: statusDotPending,
  running: statusDotRunning,
  done: statusDotDone,
  error: statusDotError,
};

export function TraceItem({
  title,
  status = 'pending',
  icon: Icon,
  details,
  open: openControl,
  onOpenChange,
  className,
  ...rest
}: TraceItemProps) {
  const [open, setOpen] = useControl(openControl, false);
  // Screen-reader status words come from the toolCallCard locale section
  // — the same localized copy ToolCallCard's status label ships, so a
  // localized app announces localized words. Trace itself carries no
  // section of its own: consumers word step titles (e.g. "Searching…")
  // for visible status copy, the shadcn Trace guidance.
  const strings = useStrings('toolCallCard');
  const panelId = useId();
  // A toggle with nothing to reveal would be a dead button — only a
  // line carrying details becomes one.
  const expandable = details != null;

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  // Screen-reader mirror of the status (StreamingText/ChatMessage
  // pattern): a transition rewrites the hidden role='status' region
  // exactly once — content present at mount is not a live-region
  // change, and re-renders that keep the status never touch the region,
  // so a settled trace stays silent instead of re-announcing per render.
  const [announced, setAnnounced] = useState('');
  const prevStatusRef = useRef(status);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prevStatusRef.current === status) return;
    prevStatusRef.current = status;
    // Prefix the announcement with the line's text so concurrent steps
    // stay distinguishable ("read_file: Done", not a bare "Done").
    const titleText = titleRef.current?.textContent.trim();
    const word = agenticStatusLabel(status, strings);
    setAnnounced(titleText ? `${titleText}: ${word}` : word);
  }, [status, strings]);

  /* Decorative marker: the glyph/icon duplicates what the live region
     announces on change; data-status on the line carries the state for
     consumer styling. */
  const indicator = (
    <span
      data-slot='indicator'
      aria-hidden='true'
      x-class={[statusDot, markerMap[status]]}
    >
      {Icon ? <Icon /> : statusGlyphs[status]}
    </span>
  );

  const titleNode = (
    <div data-slot='title' x-class={[titleStyle]} ref={titleRef}>
      {title}
    </div>
  );

  return (
    <div
      data-slot='item'
      data-status={status}
      x-class={[item, expandable ? itemStacked : itemRow, className]}
      {...rest}
    >
      {/* The live region sits outside the disclosure button on purpose:
          its mutations must not leak into the button's accessible name,
          and it has to stay reachable while the panel collapses. */}
      <span data-slot='live-region' role='status' x-class={[srOnly]}>
        {announced}
      </span>
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
          {titleNode}
          <span
            data-slot='icon'
            aria-hidden='true'
            x-class={[chevronPair.closed, open && chevronPair.open]}
          >
            {/* lucide ChevronRight at 12px with a compensating 3-unit
                stroke: the 24-unit viewBox renders at half the scale of
                the former 16-unit inline glyph, so strokeWidth 3 keeps
                the shipped 1.5px rendered stroke (StepTimeline
                precedent). */}
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
          {titleNode}
        </>
      )}
      {expandable && (
        <div
          data-slot='panel'
          id={panelId}
          hidden={!open}
          x-class={[panelBase]}
        >
          {details}
        </div>
      )}
    </div>
  );
}

export function TraceDetails({ children, className, ...rest }: TraceDetailsProps) {
  return (
    <div data-slot='details' x-class={[disclosureMonoBody, className]} {...rest}>
      {children}
    </div>
  );
}

export default function Trace({ children, className, ...rest }: TraceProps) {
  return (
    <div data-slot='trace' x-class={[timelineList, className]} {...rest}>
      {children}
    </div>
  );
}

export type { TraceProps, TraceItemProps, TraceDetailsProps, TraceStatus };
