import type { FocusEvent as ReactFocusEvent, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { CollisionPadding } from '../../utils/collision';
import type { FloatingPlacement } from '../../utils/floating';

import { css } from '@linaria/core';
import { useEffect, useId, useMemo, useRef } from 'react';
import { useControl } from 'react-use-control';

import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';

import { classnames } from '../../utils/classnames';
import { FloatingPanel, useFloating } from '../../utils/floating';
import { getTabbables } from '../../utils/focus';
import { panelSurface } from '../../utils/panel-skin';
import { useHoverIntent } from '../../utils/use-hover-intent';

/**
 * HoverCard — a non-modal floating preview (avatar card, link summary)
 * anchored to its trigger.
 *
 * API form: a single component with a `content` prop, matching the
 * library's other lightweight floating pairs (Popover, Tooltip) rather
 * than the Trigger/Content compound of ContextMenu/DropdownMenu — those
 * are click/menu surfaces with focus management, while a hover card
 * keeps the trigger untouched: whatever the consumer renders (link,
 * button, avatar) gets hover-wired around it plus the
 * aria-describedby link to the panel.
 *
 * Behavior: hovering or focusing the trigger opens the card after
 * `openDelay`; leaving closes it only after a `closeDelay` grace
 * period, which is the travel window from trigger to panel — entering
 * the panel cancels the pending close (the "resting zone"). Escape
 * closes at once (native popover light dismiss / the fallback path's
 * document keydown, both owned by useFloating).
 *
 * `interactive` upgrades the card to React Aria's PreviewTrigger
 * semantics: focusable content, focus handoff trigger ↔ card, Escape
 * returning focus to the trigger — see the prop for the contract.
 */
type HoverCardProps = {
  /** Card content, rendered inside the floating panel. */
  content: ReactNode;
  /** Milliseconds of hover/focus on the trigger before the card opens. */
  openDelay?: number;
  /**
   * Grace period (ms) after the pointer leaves the trigger or the panel
   * before the card closes — long enough to travel into the panel.
   */
  closeDelay?: number;
  /**
   * Interactive card contents (React Aria PreviewTrigger semantics):
   * focusable elements inside `content` join the Tab order and focus
   * may travel between the trigger and the card without closing it.
   * The pointer grace after leaving the trigger/panel defaults to
   * 300 ms in this mode (vs 120 ms otherwise; an explicit `closeDelay`
   * or a ConfigProvider default still overrides). While focus rests
   * inside the card, pointer leaves alone no longer close it — Escape
   * or tabbing out does, and Escape hands focus back to the trigger.
   * Focus is deliberately NOT trapped: a hover card is a preview, not
   * a modal, so Tab must keep reaching the rest of the page.
   */
  interactive?: boolean;
  /**
   * Panel placement relative to the trigger, in the floating utils'
   * physical convention ('bottom-span' aligns the panel's inline-start
   * edge under the trigger — 'bottom-start' in logical terms). RTL is
   * the consumer's to mirror.
   */
  placement?: FloatingPlacement;
  open?: ControlOrValue<boolean>;
  /** Viewport inset the panel treats as collision space. */
  collisionPadding?: CollisionPadding;
  className?: string;
  /** The trigger — render a focusable element for keyboard access. */
  children: ReactNode;
};

const container = css`
  position: relative;
  display: inline-flex;
`;

/* Call-site deltas on the shared panel surface (utils/panel-skin): the
 * hover-card width bounds and padding step — the surface's border-box
 * sizing keeps both bounds covering the padding too. */
const panelDeltas = css`
  min-width: var(--haze-hovercard-min-width, 240px);
  max-width: var(--haze-hovercard-max-width, 320px);
  padding: var(--haze-space-4);
`;

/** Built-in open dwell (ms): hover/focus time before the card shows. */
const DEFAULT_OPEN_DELAY = 200;
/** Built-in pointer grace (ms) after leaving the trigger or panel. */
const DEFAULT_CLOSE_DELAY = 120;
/**
 * Interactive pointer grace (ms) — a longer travel window for cards the
 * user is meant to enter and act inside (see the `interactive` prop).
 */
const INTERACTIVE_CLOSE_DELAY = 300;

export default function HoverCard({
  content,
  openDelay: openDelayProp,
  closeDelay: closeDelayProp,
  interactive = false,
  placement = 'bottom-span',
  open: openControl,
  collisionPadding,
  className,
  children,
}: HoverCardProps) {
  // Three tiers: explicit prop → ConfigProvider default → built-ins
  // 200/120 (300 close in interactive mode; a missing provider keeps
  // the pre-wiring behavior byte-identical).
  const config = useConfigDefaults('HoverCard');
  const openDelay = openDelayProp ?? config.openDelay ?? DEFAULT_OPEN_DELAY;
  const closeDelay =
    closeDelayProp ??
    config.closeDelay ??
    (interactive ? INTERACTIVE_CLOSE_DELAY : DEFAULT_CLOSE_DELAY);
  const [open, setOpen] = useControl(openControl, false);
  const id = useId();

  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Stable identity: useFloatingPosition re-runs its effect on every
  // change of this object.
  const collision = useMemo(
    () => (collisionPadding === undefined ? undefined : {collisionPadding}),
    [collisionPadding]
  );
  const floating = useFloating({
    open,
    setOpen,
    triggerRef,
    panelRef,
    animated: true,
    collision,
  });

  // Hover/focus intent with a resting zone: the shared useHoverIntent
  // protocol gives the `openDelay` dwell and the `closeDelay` grace
  // (entering the panel cancels both timers — nothing pending to
  // close; leaving either side arms the close, which re-entering
  // either side cancels). HoverCard adds only the interactive-mode
  // guards on top.
  const intent = useHoverIntent({
    openDelay,
    closeDelay,
    isOpen: () => open,
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
  });
  const schedulePointerClose = () => {
    // Interactive: once focus rests inside the card, pointer travel no
    // longer closes it — Escape or tabbing out does. A keyboard user
    // working the card must not have it vanish under incidental mouse
    // movement. (Mouseleave involves no focus change, so reading
    // activeElement here is stable — unlike inside focusout.)
    if (
      interactive &&
      panelRef.current !== null &&
      document.activeElement instanceof Node &&
      panelRef.current.contains(document.activeElement)
    ) {
      return;
    }
    intent.scheduleClose();
  };

  // Interactive: focus moves between the trigger and the card (or
  // within the card) keep it open; only leaving the whole hover-card
  // region closes it (after the same grace). Bound on the container —
  // React's onBlur is the bubbling native focusout, so it sees focus
  // leaving the trigger or any card content alike.
  const handleFocusOut = (event: ReactFocusEvent<HTMLSpanElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) {
      intent.cancel();
      return;
    }
    intent.scheduleClose();
  };

  // Interactive focus return: any close while focus rests inside the
  // panel (Escape is the primary path — the close itself is owned by
  // useFloating's keydown/toggle machinery either way) hands focus back
  // to the trigger's first tabbable so keyboard users are not dropped
  // on <body> as the panel hides.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    // Only the open → closed edge (wasOpen && !open) hands focus back.
    if (!interactive || !wasOpen || open) return;
    const panel = panelRef.current;
    const active = document.activeElement;
    if (
      !panel ||
      !(active instanceof Node) ||
      !panel.contains(active)
    ) {
      return;
    }
    const trigger = triggerRef.current;
    if (!trigger) return;
    const target = getTabbables(trigger)[0] ?? trigger;
    // The bare span is not focusable; give it a programmatic-only stop
    // for consumers who rendered no focusable trigger (focusFirst's
    // fallback pattern).
    if (target === trigger && trigger.getAttribute('tabindex') === null) {
      trigger.tabIndex = -1;
    }
    target.focus();
  }, [open, interactive]);

  return (
    <span
      data-slot='hover-card'
      x-class={[container]}
      onBlur={interactive ? handleFocusOut : undefined}
    >
      <span
        ref={triggerRef}
        data-slot='trigger'
        style={floating.triggerStyle}
        aria-describedby={id}
        onMouseEnter={() => intent.scheduleOpen()}
        onMouseLeave={interactive ? schedulePointerClose : () => intent.scheduleClose()}
        onFocus={() => intent.scheduleOpen()}
        onBlur={interactive ? undefined : () => intent.scheduleClose()}
      >
        {children}
      </span>
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement={placement}
        id={id}
        visualClass={panelSurface}
        className={classnames(panelDeltas, className)}
        onMouseEnter={() => intent.cancel()}
        onMouseLeave={interactive ? schedulePointerClose : () => intent.scheduleClose()}
      >
        {content}
      </FloatingPanel>
    </span>
  );
}

export type { HoverCardProps };
