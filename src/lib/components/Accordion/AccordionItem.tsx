import type { ComponentPropsWithoutRef, MouseEvent as ReactMouseEvent, ReactNode } from 'react';

import { css } from '@linaria/core';

import { disclosureContent, disclosureSummary } from '../../utils/disclosure-skin';

import { useAccordionContext } from './AccordionContext';

type AccordionItemProps = {
  /** Header content rendered in the `<summary>`. */
  title: ReactNode;
  /**
   * Explicit key of this item in the accordion's `open` array. Omitted,
   * the item's position among its siblings is the key ('0', '1', …) —
   * deterministic for static lists; pass `itemKey` when items reorder
   * or mount conditionally, and for items nested inside custom wrapper
   * components (which the accordion's child walk cannot see through).
   */
  itemKey?: string;
  /**
   * Inert item: the header cannot be opened by pointer or keyboard and
   * reports `aria-disabled` (details/summary has no native disabled),
   * with the summary visually dimmed.
   */
  disabled?: boolean;
  /**
   * @internal Injected by `<Accordion>`'s child walk — the item's
   * position, i.e. the default key source. Never pass this by hand.
   */
  index?: number;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'details'>, 'open' | 'name' | 'onToggle' | 'title'>;

const item = css`
  border-bottom: 1px solid var(--haze-color-border);

  &:first-of-type {
    border-top: 1px solid var(--haze-color-border);
  }

  /* Height animation via CSS progressive enhancement — same DOM (native
     details/summary), no JS. Chromium wraps collapsible content in the
     ::details-content pseudo box (131+) and interpolate-size
     (129+) lets the closed height 0 interpolate against the open
     height auto; the block only applies where BOTH exist, so engines
     lacking either keep today's instant open/close. End states are
     identical in every engine: closed → zero-height clipped box (same
     pixels as the UA's hidden content), open → auto height with nothing
     clipped. content-visibility transitions with allow-discrete so
     the UA's closed-state hiding lingers until the collapse finishes;
     under prefers-reduced-motion the motion tokens collapse both
     durations to 0ms and the flips become instant. */
  @supports selector(::details-content) and (interpolate-size: allow-keywords) {
    &::details-content {
      height: 0;
      overflow: clip;
      interpolate-size: allow-keywords;
      transition:
        height var(--haze-duration-normal) var(--haze-ease-in-out),
        content-visibility var(--haze-duration-normal) allow-discrete;
    }

    &[open]::details-content {
      height: auto;
    }
  }
`;

/* States riding on the shared disclosure summary skin
   (utils/disclosure-skin): press feedback and the disabled dimming.
   The compound press arm (`:hover:active`) and the `summary`-typed
   disabled suppression outrank the shared `:hover` wash on
   specificity, so they keep winning no matter which module's CSS
   lands first in a consuming stylesheet (dev-server injection and dist
   split-css order shared layers oppositely). */
const summaryStates = css`
  &:active,
  &:hover:active {
    background: var(--haze-color-bg-muted);
  }

  /* Disabled headers dim and lose their press affordance (the click
     guard blocks activation in JS; pointer-events stays on so the
     state stays discoverable by hover/AT). */
  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  summary&[aria-disabled='true']:hover,
  summary&[aria-disabled='true']:active {
    background: none;
  }
`;

/* Only the block padding differs from the shared content typography:
   the item borders already frame the row, so content opens flush with
   the header's inline padding. */
const contentPad = css`
  padding: 0 var(--haze-space-4) var(--haze-space-4);
`;

export default function AccordionItem({
  title,
  itemKey,
  disabled = false,
  index,
  className,
  children,
  ...rest
}: AccordionItemProps) {
  // Inside an <Accordion> (context + a resolvable key) the item joins
  // the controllable open-key state; standalone it keeps the plain
  // native details/summary behavior — the browser owns the toggle,
  // zero JS on the activation path.
  const ctx = useAccordionContext();
  const key = itemKey ?? (index !== undefined ? String(index) : undefined);
  const stateful = ctx !== undefined && key !== undefined;
  const isOpen = stateful ? ctx.openKeys.includes(key) : false;

  // Every activation path funnels through one click handler — pointer
  // clicks, and Enter/Space (browsers synthesize a click for those on a
  // focused summary). preventDefault cancels the browser's own
  // open-attribute flip BEFORE it happens, so inside an accordion the
  // attribute only ever mirrors React state — there is no queued toggle
  // event to reconcile (unlike popover, whose show/hide race needs the
  // hideRequestedRef pattern in utils/floating). Without JS the handler
  // is absent entirely and native toggling keeps working.
  const handleActivate = (event: ReactMouseEvent<HTMLElement>) => {
    if (!stateful) {
      // Standalone + enabled: let the browser run its native toggle.
      if (disabled) event.preventDefault();
      return;
    }
    event.preventDefault();
    if (disabled) return;
    ctx.toggleItem(key);
  };

  return (
    <details
      data-slot='item'
      x-class={[item, className, ctx?.classNames?.item]}
      open={stateful ? isOpen : undefined}
      {...rest}
    >
      <summary
        data-slot='summary'
        aria-disabled={disabled || undefined}
        x-class={[disclosureSummary, summaryStates, ctx?.classNames?.summary]}
        onClick={handleActivate}
      >
        {title}
      </summary>
      <div
        data-slot='content'
        x-class={[disclosureContent, contentPad, ctx?.classNames?.content]}
      >
        {children}
      </div>
    </details>
  );
}

export type { AccordionItemProps };
