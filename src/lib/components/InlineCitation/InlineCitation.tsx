import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useId, useRef } from 'react';
import { useControl } from 'react-use-control';

import { css } from '@linaria/core';

import { FloatingPanel, useFloating } from '../../utils/floating';
import { focusRingVisible } from '../../utils/focus-ring';
import { panelSurface } from '../../utils/panel-skin';
import { citationIndexBadge, citationLink } from '../../utils/citation-skin';

type InlineCitationProps = {
  /** Citation number shown in the badge and card header. */
  index?: number;
  /** When present the card title becomes an external link (new tab). */
  href?: string;
  /** Source title rendered in the card; links out when `href` is set. */
  title?: ReactNode;
  /** Excerpt quoted from the source, rendered under the title. */
  snippet?: ReactNode;
  /** Controllable open state of the source card. */
  open?: ControlOrValue<boolean>;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'span'>, 'title' | 'children'>;

const sup = css`
  position: relative;
  display: inline-flex;
`;

const badge = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--haze-space-1);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-bg-subtle);
  color: var(--haze-color-primary);
  font-family: var(--haze-font-mono);
  font-size: 0.75em;
  line-height: 1.4;
  cursor: pointer;
  transition:
    background var(--haze-duration-fast) var(--haze-ease),
    border-color var(--haze-duration-fast) var(--haze-ease);

  &:hover {
    border-color: var(--haze-color-border-hover);
    background: var(--haze-color-primary-subtle);
  }

  /* Keyboard ring: utils/focus-ring's focusRingVisible, composed below
     at the trigger's x-class — it also brings the forced-colors
     Highlight arm the local copy never had. */

  /* Forced-colors: the UA would force the border onto CanvasText while
     the subtle background collapses — keep the badge separated from the
     text it floats beside. */
  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

/* Call-site deltas on the shared panel surface (utils/panel-skin): the
 * citation card's width bounds and padding step — the surface's
 * border-box sizing keeps both bounds covering the padding too. */
const panelDeltas = css`
  min-width: 200px;
  max-width: 320px;
  padding: var(--haze-space-3);
`;

const cardHeader = css`
  display: flex;
  align-items: baseline;
  gap: var(--haze-space-2);
`;

/* Call-site delta on the shared citation link (utils/citation-skin):
   the card title keeps weight-medium whether it links out or not.
   citationLink declares no font-weight, so the two classes compose
   order-independently. */
const titleWeight = css`
  font-weight: var(--haze-weight-medium);
`;

const titleStyle = css`
  color: var(--haze-color-text);
  font-weight: var(--haze-weight-medium);
`;

const snippetStyle = css`
  margin: var(--haze-space-2) 0 0;
  color: var(--haze-color-text-secondary);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
`;

export default function InlineCitation({
  index = 1,
  href,
  title,
  snippet,
  open: openControl,
  className,
  ...rest
}: InlineCitationProps) {
  const [open, setOpen] = useControl(openControl, false);
  const id = useId();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const floating = useFloating({
    open,
    setOpen,
    triggerRef,
    panelRef,
    animated: true,
  });

  return (
    <sup data-slot='inline-citation' x-class={[sup, className]} {...rest}>
      <button
        ref={triggerRef}
        type='button'
        data-slot='citation-trigger'
        style={floating.triggerStyle}
        aria-haspopup='true'
        aria-expanded={open}
        aria-controls={id}
        onPointerDown={floating.onTriggerPointerDown}
        onClick={floating.onTriggerClick}
        x-class={[badge, focusRingVisible]}
      >
        [{index}]
      </button>
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement='bottom-span'
        id={id}
        visualClass={panelSurface}
        className={panelDeltas}
      >
        <div data-slot='citation-header' x-class={cardHeader}>
          {/* Duplicates the trigger badge — decorative in the card. */}
          <span data-slot='citation-index' aria-hidden='true' x-class={citationIndexBadge}>
            [{index}]
          </span>
          {title !== undefined &&
            (href !== undefined ? (
              <a
                data-slot='citation-title'
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                x-class={[citationLink, titleWeight]}
              >
                {title}
              </a>
            ) : (
              <span data-slot='citation-title' x-class={titleStyle}>
                {title}
              </span>
            ))}
        </div>
        {snippet !== undefined && (
          <p data-slot='citation-snippet' x-class={snippetStyle}>
            {snippet}
          </p>
        )}
      </FloatingPanel>
    </sup>
  );
}

export type { InlineCitationProps };
