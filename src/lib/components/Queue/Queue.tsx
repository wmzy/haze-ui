import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';

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

const indicator = css`
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.0625rem;
  border-radius: var(--haze-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  line-height: 1;
`;

const indicatorQueued = css`
  border: 2px solid var(--haze-color-border);
  background: var(--haze-color-bg);
`;

/* The Spinner owns the whole slot in the sending state. */
const indicatorSending = css`
  width: 1rem;
  height: 1rem;
`;

const indicatorFailed = css`
  border: 2px solid var(--haze-color-danger);
  background: var(--haze-color-danger);
  color: var(--haze-color-text-inverse);
`;

const indicatorMap: Record<QueueStatus, string> = {
  queued: indicatorQueued,
  sending: indicatorSending,
  failed: indicatorFailed,
};

const body = css`
  flex: 1;
  min-width: 0;
`;

const titleStyle = css`
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
`;

const descriptionStyle = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  margin-top: var(--haze-space-1);
`;

const removeBtn = css`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.0625rem;
  padding: 0;
  border: none;
  border-radius: var(--haze-radius-sm);
  background: none;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-md);
  line-height: 1;
  cursor: pointer;
  transition: color var(--haze-duration-fast) var(--haze-ease);

  &:hover {
    color: var(--haze-color-text);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  /* Forced-colors: the box-shadow focus ring is dropped by the UA —
     the system Highlight backdrop keeps a visible focus indicator. */
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
        x-class={[indicator, indicatorMap[status]]}
      >
        {status === 'sending' && <Spinner size='sm' />}
        {status === 'failed' && '!'}
      </span>
      <div data-slot='queue-body' x-class={body}>
        <div data-slot='queue-title' x-class={titleStyle}>
          {title}
        </div>
        {description !== undefined && (
          <div data-slot='queue-description' x-class={descriptionStyle}>
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
          x-class={removeBtn}
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
