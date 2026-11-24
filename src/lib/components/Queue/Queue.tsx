import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';

import { quietIconButton } from '../../utils/quiet-button-skin';
import {
  statusDot,
  statusDotError,
  statusDotPending,
  timelineDescription,
  timelineLabel,
} from '../../utils/timeline-skin';
import Spinner from '../Spinner/Spinner';

type QueueStatus = 'queued' | 'sending' | 'failed';

type QueueProps = {
  /** `Queue.Item` elements. */
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'ul'>, 'children'>;

type QueueItemProps = {
  title: ReactNode;
  description?: ReactNode;
  status?: QueueStatus;
  /** When present a remove button renders and calls this on click. */
  onRemove?: () => void;
  /**
   * Accessible name of the remove button. No builtin copy: pass the
   * label yourself, otherwise the `×` glyph doubles as the name.
   */
  removeLabel?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'li'>, 'children' | 'title'>;

const list = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--haze-font-sans);
`;

const item = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-3);
  padding: var(--haze-space-2) var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
`;

const itemFailed = css`
  border-color: var(--haze-color-danger);
`;

/* The status marker is the shared statusDot (utils/timeline-skin):
 * geometry plus the ring family — the queued ring and the failed disc
 * are the skin's pending and error arms, what this file used to
 * re-declare. Two Queue deltas ride after it: the optical nudge below
 * and the sending seat. */
const indicatorNudge = css`
  margin-top: 0.0625rem;
`;

/* The Spinner owns the whole slot in the sending state: the seat
 * shrinks to the Spinner's own sm box (space-4 — the token Spinner
 * resolves, so the seat tracks it at every density). The compound
 * `&[data-slot]` selector keeps the seat winning over the shared
 * space-5 geometry in any cascade order (dev-server injection order
 * and the dist split-css order disagree). */
const indicatorSending = css`
  &[data-slot='queue-indicator'] {
    width: var(--haze-space-4);
    height: var(--haze-space-4);
  }
`;

const indicatorMap: Record<QueueStatus, string> = {
  queued: statusDotPending,
  sending: indicatorSending,
  failed: statusDotError,
};

const body = css`
  flex: 1;
  min-width: 0;
`;

/* Remove control: the shared quietIconButton chrome
 * (utils/quiet-button-skin) plus the glyph seat. The keyboard ring is
 * the skin's 3px box-shadow arm itself — and, since the skin
 * interpolates utils/focus-ring-delta, its forced-colors Highlight
 * outline too (the former local copy was declaration-identical, so
 * utils/focus-ring is not composed here); the transition timing
 * converges on the skin's plain ease (was var(--haze-ease)). The
 * Highlight backdrop below stays as this site's additive forced-colors
 * accent over that outline. */
const removeBtn = css`
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.0625rem;
  padding: 0;
  border-radius: var(--haze-radius-sm);
  font-size: var(--haze-text-md);
  line-height: 1;

  /* Forced-colors: the skin's Highlight outline already marks focus
     (utils/focus-ring-delta); the system Highlight backdrop doubles the
     indicator on this seat. */
  @media (forced-colors: active) {
    &:focus-visible {
      background: Highlight;
      color: HighlightText;
    }
  }
`;

function QueueItem({
  title,
  description,
  status = 'queued',
  onRemove,
  removeLabel,
  className,
  ...rest
}: QueueItemProps) {
  return (
    <li
      data-slot='queue-item'
      x-class={[item, status === 'failed' && itemFailed, className]}
      {...rest}
    >
      {/* Decorative glyph for queued/failed; the sending Spinner keeps
          its own role="status" announcement, so no aria-hidden there. */}
      <span
        data-slot='queue-indicator'
        aria-hidden={status === 'sending' ? undefined : true}
        x-class={[statusDot, indicatorNudge, indicatorMap[status]]}
      >
        {status === 'sending' && <Spinner size='sm' />}
        {status === 'failed' && '!'}
      </span>
      <div data-slot='queue-body' x-class={body}>
        <div data-slot='queue-title' x-class={timelineLabel}>
          {title}
        </div>
        {description !== undefined && (
          <div data-slot='queue-description' x-class={timelineDescription}>
            {description}
          </div>
        )}
      </div>
      {onRemove !== undefined && (
        <button
          type='button'
          data-slot='queue-remove-button'
          aria-label={removeLabel}
          onClick={onRemove}
          x-class={[quietIconButton, removeBtn]}
        >
          ×
        </button>
      )}
    </li>
  );
}

function Queue({ children, className, ...rest }: QueueProps) {
  return (
    <ul data-slot='queue' x-class={[list, className]} {...rest}>
      {children}
    </ul>
  );
}

export default Queue;
export { QueueItem };
export type { QueueProps, QueueItemProps, QueueStatus };
