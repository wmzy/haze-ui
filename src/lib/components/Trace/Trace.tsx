import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useEffect, useId, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { useStrings } from '../LocaleProvider';
import { srOnly } from '../../utils/sr-only';

/**
 * Line-by-line reasoning trace for agentic UIs (the shadcn Trace shape):
 * `<Trace>` lays out `<TraceItem>` steps, each carrying a status marker,
 * a title, an optional custom icon and an optional disclosure revealing
 * `details` below the line. Status transitions are mirrored to screen
 * readers through a per-item sr-only live region.
 */

type TraceStatus = 'pending' | 'running' | 'done' | 'error';

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

const list = css`
  display: flex;
  flex-direction: column;
  font-family: var(--haze-font-sans);
`;

const item = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-3);
  padding-block: var(--haze-space-2);

  &:first-child {
    padding-block-start: 0;
  }

  &:not(:last-child) {
    border-block-end: 1px solid var(--haze-color-border);
  }
`;

/* Expandable lines stack the header button above the panel instead of
   laying the reveal out in the marker row. */
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
     line edge so the reveal stays visually anchored to its step. */
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
  line-height: 1;
`;

const markerPending = css`
  border-color: var(--haze-color-border);
  background: var(--haze-color-bg);
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
       durations (120/200/300ms), not loops — same call as StepTimeline's
       pulse period; reduced-motion parks it below. */
    animation: trace-pulse 1.6s var(--haze-ease) infinite;
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

  @keyframes trace-pulse {
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

const titleStyle = css`
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
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
   details align with the title. */
const panelStyle = css`
  padding-inline-start: calc(1.25rem + var(--haze-space-3));
  padding-block: var(--haze-space-1) var(--haze-space-2);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
`;

/* Monospace payload body for revealed details (ToolCallCard content
   precedent) — wrap free-form payloads in TraceDetails. */
const detailsBody = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  white-space: pre-wrap;
  word-break: break-all;
`;

/** Glyphs inside the status marker; pending/running stay glyph-free. */
const markerGlyphs: Partial<Record<TraceStatus, string>> = {
  done: '✓',
  error: '!',
};

const markerMap: Record<TraceStatus, string> = {
  pending: markerPending,
  running: markerRunning,
  done: markerDone,
  error: markerError,
};

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
    const word = strings[status];
    setAnnounced(titleText ? `${titleText}: ${word}` : word);
  }, [status, strings]);

  /* Decorative marker: the glyph/icon duplicates what the live region
     announces on change; data-status on the line carries the state for
     consumer styling. */
  const indicator = (
    <span
      data-slot='indicator'
      aria-hidden='true'
      x-class={[marker, markerMap[status]]}
    >
      {Icon ? <Icon /> : markerGlyphs[status]}
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
      x-class={[item, expandable && itemStacked, className]}
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
            x-class={[chevron, open && chevronOpen]}
          >
            <ChevronGlyph />
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
          x-class={[panelStyle]}
        >
          {details}
        </div>
      )}
    </div>
  );
}

export function TraceDetails({ children, className, ...rest }: TraceDetailsProps) {
  return (
    <div data-slot='details' x-class={[detailsBody, className]} {...rest}>
      {children}
    </div>
  );
}

export default function Trace({ children, className, ...rest }: TraceProps) {
  return (
    <div data-slot='trace' x-class={[list, className]} {...rest}>
      {children}
    </div>
  );
}

export type { TraceProps, TraceItemProps, TraceDetailsProps, TraceStatus };
