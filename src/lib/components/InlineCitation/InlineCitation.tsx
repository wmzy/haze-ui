import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useId, useRef } from 'react';
import { useControl } from 'react-use-control';

import { css } from '@linaria/core';

import { FloatingPanel, useFloating } from '../../utils/floating';

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

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  /* Forced-colors: the UA would force the border onto CanvasText while
     the subtle background collapses — keep the badge separated from the
     text it floats beside. */
  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

/** Visual skin applied on every rendering tier of the panel. */
const panelVisuals = css`
  /* min/max-width pairs with padding + border: border-box keeps both
   * bounds covering the padding too (panel-family box-sizing
   * contract). */
  box-sizing: border-box;
  min-width: 200px;
  max-width: 320px;
  padding: var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  box-shadow: var(--haze-shadow-lg);

  /* Forced-colors: the UA keeps the author border visible by forcing
     its color to CanvasText — restated so the panel stays separated
     from the Canvas behind it deterministically. */
  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

const cardHeader = css`
  display: flex;
  align-items: baseline;
  gap: var(--haze-space-2);
`;

const cardIndex = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  flex-shrink: 0;
  user-select: none;
`;

const titleStyle = css`
  color: var(--haze-color-text);
  font-weight: var(--haze-weight-medium);
`;

const titleLink = css`
  color: var(--haze-color-primary);
  font-weight: var(--haze-weight-medium);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
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
        x-class={badge}
      >
        [{index}]
      </button>
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement='bottom-span'
        id={id}
        visualClass={panelVisuals}
      >
        <div data-slot='citation-header' x-class={cardHeader}>
          {/* Duplicates the trigger badge — decorative in the card. */}
          <span data-slot='citation-index' aria-hidden='true' x-class={cardIndex}>
            [{index}]
          </span>
          {title !== undefined &&
            (href !== undefined ? (
              <a
                data-slot='citation-title'
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                x-class={titleLink}
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
