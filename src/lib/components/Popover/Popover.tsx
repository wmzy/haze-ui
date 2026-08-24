import type { CSSProperties, ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useEffect, useId, useRef } from 'react';
import { useControl } from 'react-use-control';

type PopoverProps = {
  content: ReactNode;
  open?: Control<boolean> | boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Time window (ms) in which a browser-side popover close is attributed to
 * the trigger's pointerdown, and the follow-up click suppressed. A real
 * light-dismiss sequence (pointerdown → close → click) completes well
 * inside it; see the race note at the toggle listener below.
 */
const CLICK_WINDOW = 500;

/** Lazy feature detection so tests can flip between native and fallback. */
function supportsNativePopover(): boolean {
  return (
    typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype
  );
}

/**
 * Anchor positioning requires the popover API first: jsdom's
 * `CSS.supports` returns true for arbitrary declarations, so it must never
 * be trusted on its own.
 */
function supportsAnchorPositioning(): boolean {
  return (
    supportsNativePopover() &&
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('anchor-name: --haze-popover-probe')
  );
}

const container = css`
  position: relative;
  display: inline-flex;
`;

/** Visual skin shared by the native and fallback rendering paths. */
const panelVisuals = css`
  padding: var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  box-shadow: var(--haze-shadow-lg);
  min-width: 200px;
`;

/** Fallback path: absolute positioning inside the trigger container. */
const panelFallback = css`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: var(--haze-space-1);
`;

const hidden = css`
  display: none;
`;

/**
 * Native path base: undo the UA sheet for `[popover]` (`inset: 0;
 * margin: auto`) so the panel lands where the positioning strategy below
 * puts it instead of the viewport center.
 */
const panelNative = css`
  inset: auto;
  margin: 0;
`;

/**
 * Native + anchor positioning: the panel tracks its trigger across
 * scroll/resize/viewport changes for free. Unsupported declarations are
 * simply dropped, which is the enhancement's fallback. `--haze-popover-anchor`
 * (set inline per instance) carries the unique anchor name.
 */
const panelAnchored = css`
  position-anchor: var(--haze-popover-anchor);
  position-area: bottom span-left;
  margin-top: var(--haze-space-1);
  position-try-fallbacks: flip-block;
`;

/**
 * Native without anchor positioning (older engines): fixed panel placed
 * from the trigger's rect by the effect below. Still top-layer — free of
 * clipping and z-index management.
 */
const panelJsPositioned = css`
  position: fixed;
  margin-top: var(--haze-space-1);
`;

export default function Popover({
  content,
  open: openControl,
  className,
  children,
}: PopoverProps) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, false);
  const id = useId();
  // useId() contains ":" which is invalid in a CSS dashed-ident; strip it.
  const anchorName = `--haze-popover-${id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const native = supportsNativePopover();
  const anchored = supportsAnchorPositioning();

  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Mirrors the panel's live popover visibility, maintained from `toggle`
  // events (which cover browser-side closes too, unlike React state).
  // Drives the show/hide guards: hidePopover() on an already-hidden
  // popover throws InvalidStateError per spec.
  const shownRef = useRef(false);
  // Race bookkeeping: timestamp of a trigger pointerdown that predicts a
  // light-dismiss close, and of a close attributed to that pointerdown.
  const pointerDismissAt = useRef(0);
  const suppressClickAt = useRef(0);

  // Native path: React state drives the popover (mirroring Dialog's
  // showModal()/close() pattern) and browser-side closes — Escape, light
  // dismiss on any outside pointerdown — sync back through `toggle`,
  // which does not bubble, hence the native listener. One effect on
  // purpose: the listener must be bound before showPopover() runs, or the
  // toggle it dispatches synchronously falls between effect cleanup and
  // setup.
  useEffect(() => {
    const el = panelRef.current;
    if (!el || !native) return;
    const handleToggle = (event: Event) => {
      const newState = (event as ToggleEvent).newState;
      shownRef.current = newState === 'open';
      if (newState === 'closed' && open) {
        // The trigger is not a declarative invoker (children may be a
        // button, and `popovertarget` only works on buttons), so while the
        // popover is open a pointerdown on the trigger light-dismisses it;
        // the click that follows would then toggle it right back open.
        // Attribute closes inside the pointerdown window to the trigger
        // and swallow that one click.
        if (performance.now() - pointerDismissAt.current < CLICK_WINDOW) {
          suppressClickAt.current = performance.now();
        }
        pointerDismissAt.current = 0;
        setOpen(false);
      } else if (newState === 'open' && !open) {
        setOpen(true);
      }
    };
    el.addEventListener('toggle', handleToggle);
    if (open && !shownRef.current) el.showPopover();
    else if (!open && shownRef.current) el.hidePopover();
    return () => el.removeEventListener('toggle', handleToggle);
  }, [native, open, setOpen]);

  // Native without anchor positioning: place the fixed panel under the
  // trigger and re-place on scroll/resize while open.
  useEffect(() => {
    if (!native || anchored || !open) return;
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    const place = () => {
      const rect = trigger.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(panel).marginTop) || 0;
      panel.style.top = `${rect.bottom + gap}px`;
      panel.style.left = `${rect.left}px`;
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [native, anchored, open]);

  return (
    <span className={container}>
      <span
        ref={triggerRef}
        aria-expanded={open}
        aria-controls={id}
        style={anchored ? { anchorName } : undefined}
        onPointerDown={() => {
          if (open) pointerDismissAt.current = performance.now();
        }}
        onClick={() => {
          if (performance.now() - suppressClickAt.current < CLICK_WINDOW) {
            suppressClickAt.current = 0;
            return;
          }
          setOpen((prev) => !prev);
        }}
      >
        {children}
      </span>
      <div
        id={id}
        ref={panelRef}
        popover={native ? 'auto' : undefined}
        x-class={[
          panelVisuals,
          native && panelNative,
          native && anchored && panelAnchored,
          native && !anchored && panelJsPositioned,
          !native && panelFallback,
          !native && !open && hidden,
          className,
        ]}
        style={
          native && anchored
            ? ({ '--haze-popover-anchor': anchorName } as CSSProperties)
            : undefined
        }
      >
        {content}
      </div>
    </span>
  );
}

export type { PopoverProps };
