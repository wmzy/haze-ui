/* eslint-disable react-refresh/only-export-components --
   internal primitives module (hooks + classes + panel component), not a
   fast-refresh boundary; consumers re-render through their own files. */
import type {
  ComponentProps,
  CSSProperties,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
} from 'react';

import { css } from '@linaria/core';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * Internal floating-panel primitives shared by Popover, DropdownMenu,
 * ContextMenu, Datepicker, Combobox, Menu and Tooltip. NOT exported from
 * the library entry — consumers compose their own panels on top.
 *
 * Three rendering tiers, chosen by feature detection:
 *
 *   1. popover API + CSS anchor positioning (Chromium): the panel is a
 *      native top-layer `popover=auto` element positioned declaratively
 *      via `position-area`, tracking its trigger for free.
 *   2. popover API only (Firefox / Safari): top-layer panel placed from
 *      the trigger's rect in JS, re-placed on scroll/resize.
 *   3. neither (jsdom, ancient engines): absolutely positioned panel
 *      inside the trigger's relative container, hidden via a class, with
 *      outside-pointerdown and Escape closing bound in JS.
 */

/**
 * Time window (ms) in which a browser-side popover close is attributed to
 * the trigger's pointerdown, and the follow-up click suppressed. A real
 * light-dismiss sequence (pointerdown → close → click) completes well
 * inside it; see the race note at the toggle listener below.
 */
const CLICK_WINDOW = 500;

/** Lazy feature detection so tests can flip between native and fallback. */
export function supportsNativePopover(): boolean {
  return (
    typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype
  );
}

/**
 * Anchor positioning requires the popover API first: jsdom's
 * `CSS.supports` returns true for arbitrary declarations, so it must never
 * be trusted on its own.
 */
export function supportsAnchorPositioning(): boolean {
  return (
    supportsNativePopover() &&
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('anchor-name: --haze-floating-probe')
  );
}

// ---------------------------------------------------------------------------
// Path classes. The primitive owns the positioning skeleton; each consumer
// passes its visual skin through FloatingPanel's `visualClass`.
// ---------------------------------------------------------------------------

/**
 * Native path base: undo the UA sheet for `[popover]` (`inset: 0;
 * margin: auto`) so the panel lands where the positioning strategy below
 * puts it instead of the viewport center.
 */
const floatingNative = css`
  inset: auto;
  margin: 0;
`;

/**
 * Native + anchor positioning: the panel tracks its trigger across
 * scroll/resize/viewport changes for free. `--haze-floating-anchor` (set
 * inline per instance) carries the unique anchor name; the position-area
 * and gap come from the per-placement classes below.
 */
const floatingAnchored = css`
  position-anchor: var(--haze-floating-anchor);
`;

/**
 * Native without anchor positioning (older engines): fixed panel placed
 * from the trigger's rect by the position effect below. Still top layer —
 * free of clipping and z-index management.
 */
const floatingFixed = css`
  position: fixed;
`;

/** Fallback path: panel visually hidden while closed. */
const floatingHidden = css`
  display: none;
`;

/** Anchored path: declarative placement relative to the trigger. */
const anchoredBottom = css`
  position-area: bottom left;
  margin-top: var(--haze-space-1);
  position-try-fallbacks: flip-block;
`;

const anchoredBottomSpan = css`
  position-area: bottom span-left;
  margin-top: var(--haze-space-1);
  position-try-fallbacks: flip-block;
`;

const anchoredBottomCenter = css`
  position-area: bottom center;
  margin-top: var(--haze-space-1);
  position-try-fallbacks: flip-block;
`;

const anchoredBottomEnd = css`
  position-area: bottom right;
  margin-top: var(--haze-space-1);
  position-try-fallbacks: flip-block;
`;

const anchoredTop = css`
  position-area: top center;
  margin-bottom: var(--haze-space-1);
  position-try-fallbacks: flip-block;
`;

const anchoredLeft = css`
  position-area: left center;
  margin-right: var(--haze-space-1);
  position-try-fallbacks: flip-inline;
`;

const anchoredRight = css`
  position-area: right center;
  margin-left: var(--haze-space-1);
  position-try-fallbacks: flip-inline;
`;

/**
 * Fallback path: absolute positioning inside the trigger's container
 * (consumers render it `position: relative`). Matches the geometry the
 * anchored classes express.
 */
const fallbackBottom = css`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: var(--haze-space-1);
`;

const fallbackBottomSpan = fallbackBottom;

const fallbackBottomCenter = css`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  margin-top: var(--haze-space-1);
`;

const fallbackBottomEnd = css`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  margin-top: var(--haze-space-1);
`;

const fallbackTop = css`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  margin-bottom: var(--haze-space-1);
`;

const fallbackLeft = css`
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  margin-right: var(--haze-space-1);
`;

const fallbackRight = css`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  margin-left: var(--haze-space-1);
`;

/** JS-positioned path (tier 2): only the gap margin is declarative. */
const gapBelow = css`
  margin-top: var(--haze-space-1);
`;

const gapAbove = css`
  margin-bottom: var(--haze-space-1);
`;

const gapBefore = css`
  margin-right: var(--haze-space-1);
`;

const gapAfter = css`
  margin-left: var(--haze-space-1);
`;

const anchoredPlacements = {
  bottom: anchoredBottom,
  'bottom-span': anchoredBottomSpan,
  'bottom-center': anchoredBottomCenter,
  'bottom-end': anchoredBottomEnd,
  top: anchoredTop,
  left: anchoredLeft,
  right: anchoredRight,
} as const;

const fallbackPlacements = {
  bottom: fallbackBottom,
  'bottom-span': fallbackBottomSpan,
  'bottom-center': fallbackBottomCenter,
  'bottom-end': fallbackBottomEnd,
  top: fallbackTop,
  left: fallbackLeft,
  right: fallbackRight,
} as const;

const gapPlacements = {
  bottom: gapBelow,
  'bottom-span': gapBelow,
  'bottom-center': gapBelow,
  'bottom-end': gapBelow,
  top: gapAbove,
  left: gapBefore,
  right: gapAfter,
} as const;

type AnchorablePlacement = keyof typeof anchoredPlacements;

/**
 * Panel placement relative to the trigger. `point` leaves positioning
 * entirely to the consumer (e.g. ContextMenu at the pointer coordinates).
 */
export type FloatingPlacement = AnchorablePlacement | 'point';

// ---------------------------------------------------------------------------
// Behavior hook
// ---------------------------------------------------------------------------

type UseFloatingOptions = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  /** Element the panel is anchored to; also the outside-close boundary. */
  triggerRef: RefObject<HTMLElement | null>;
  /** The floating panel element. */
  panelRef: RefObject<HTMLElement | null>;
};

export type FloatingBehavior = {
  open: boolean;
  native: boolean;
  anchored: boolean;
  /**
   * Whether the panel element is actually shown right now (native path:
   * mirrored from `toggle` events; fallback path: identical to `open`).
   * Differs from `open` across the commit→effect gap: `open` flips when
   * React commits, while the popover only becomes focusable/paintable
   * after the effect calls showPopover(). Consumers that move focus into
   * the panel on open must gate on `shown`, or the focus call lands on a
   * display:none element and is silently dropped (Chromium).
   */
  shown: boolean;
  /** Unique CSS anchor name for this instance (anchored path). */
  anchorName: string;
  /** Inline style for the trigger: declares `anchor-name`. */
  triggerStyle: CSSProperties | undefined;
  /** Spread on the trigger: records pointerdown for race attribution. */
  onTriggerPointerDown: () => void;
  /** Spread as the trigger's click handler: suppression-aware toggle. */
  onTriggerClick: () => void;
  /** Spread on the panel: popover attribute + anchor custom property. */
  panelAttrs: { popover: 'auto' | undefined; style: CSSProperties | undefined };
  /** Positioning-skeleton entries for the panel's x-class array. */
  panelClasses: (string | false)[];
  triggerRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
};

export function useFloating({
  open,
  setOpen,
  triggerRef,
  panelRef,
}: UseFloatingOptions): FloatingBehavior {
  const id = useId();
  // useId() contains ":" which is invalid in a CSS dashed-ident; strip it.
  const anchorName = `--haze-floating-${id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const native = supportsNativePopover();
  const anchored = supportsAnchorPositioning();

  // Mirrors the panel's live popover visibility, maintained from `toggle`
  // events (which cover browser-side closes too, unlike React state).
  // Drives the show/hide guards: hidePopover() on an already-hidden
  // popover throws InvalidStateError per spec.
  const shownRef = useRef(false);
  // Render-visible mirror of shownRef so consumers can gate effects on
  // actual panel visibility (see the `shown` field on FloatingBehavior).
  const [shown, setShown] = useState(false);
  // The panel element those flags were recorded for — consumers may
  // unmount the panel while closed (menus), and a fresh element starts
  // hidden regardless of what the stale one showed.
  const panelElRef = useRef<HTMLElement | null>(null);
  // Race bookkeeping: timestamp of a trigger pointerdown that predicts a
  // light-dismiss close, and of a close attributed to that pointerdown.
  // "Never" is -Infinity, not 0: in a browser performance.now() counts
  // from navigation start (~0), so a 0 sentinel would swallow every
  // trigger click in the first CLICK_WINDOW of a page's life (caught by
  // Playwright; jsdom's clock starts at process spawn and never showed it).
  const pointerDismissAt = useRef(-Infinity);
  const suppressClickAt = useRef(-Infinity);

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
    if (el !== panelElRef.current) {
      panelElRef.current = el;
      shownRef.current = false;
      setShown(false);
    }
    const handleToggle = (event: Event) => {
      const newState = (event as ToggleEvent).newState;
      shownRef.current = newState === 'open';
      setShown(shownRef.current);
      if (newState === 'closed' && open) {
        // The trigger is not a declarative invoker (it is rarely a button
        // wired via `popovertarget`), so while the popover is open a
        // pointerdown on the trigger light-dismisses it; the click that
        // follows would then toggle it right back open. Attribute closes
        // inside the pointerdown window to the trigger and swallow that
        // one click.
        if (performance.now() - pointerDismissAt.current < CLICK_WINDOW) {
          suppressClickAt.current = performance.now();
        }
        pointerDismissAt.current = -Infinity;
        setOpen(false);
      } else if (newState === 'open' && !open) {
        setOpen(true);
      }
    };
    el.addEventListener('toggle', handleToggle);
    if (open && !shownRef.current) el.showPopover();
    else if (!open && shownRef.current) el.hidePopover();
    return () => el.removeEventListener('toggle', handleToggle);
  }, [native, open, setOpen, panelRef]);

  // Fallback path: the popover API's light dismiss and Escape close have
  // no native equivalent, so approximate them in JS while open.
  useEffect(() => {
    if (native || !open) return;
    const isInside = (target: EventTarget | null) => {
      if (!(target instanceof Node)) return false;
      return Boolean(
        triggerRef.current?.contains(target) || panelRef.current?.contains(target)
      );
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!isInside(event.target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [native, open, setOpen, triggerRef, panelRef]);

  const onTriggerPointerDown = useCallback(() => {
    if (open) pointerDismissAt.current = performance.now();
  }, [open]);

  const onTriggerClick = useCallback(() => {
    if (performance.now() - suppressClickAt.current < CLICK_WINDOW) {
      suppressClickAt.current = -Infinity;
      return;
    }
    setOpen((prev) => !prev);
  }, [setOpen]);

  return {
    open,
    native,
    anchored,
    // Fallback path has no toggle events: visibility === React state.
    shown: native ? shown : open,
    anchorName,
    triggerStyle: anchored ? { anchorName } : undefined,
    onTriggerPointerDown,
    onTriggerClick,
    panelAttrs: {
      popover: native ? 'auto' : undefined,
      style: anchored
        ? ({ '--haze-floating-anchor': anchorName } as CSSProperties)
        : undefined,
    },
    panelClasses: [
      native && floatingNative,
      native && anchored && floatingAnchored,
      native && !anchored && floatingFixed,
      !native && !open && floatingHidden,
    ],
    triggerRef,
    panelRef,
  };
}

// ---------------------------------------------------------------------------
// Placement classes + JS positioning (tier 2)
// ---------------------------------------------------------------------------

/** x-class entries placing the panel relative to the trigger, per tier. */
export function floatingPlacementClasses(
  behavior: Pick<FloatingBehavior, 'native' | 'anchored'>,
  placement: FloatingPlacement
): (string | false)[] {
  if (placement === 'point') return [];
  return [
    behavior.native && behavior.anchored && anchoredPlacements[placement],
    behavior.native && !behavior.anchored && gapPlacements[placement],
    !behavior.native && fallbackPlacements[placement],
  ];
}

function readGap(
  panel: HTMLElement,
  margin: 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight'
): number {
  return parseFloat(getComputedStyle(panel)[margin]) || 0;
}

/**
 * Place a fixed panel from the trigger's rect (tier 2). Centers compute
 * from the panel's own rect, so this needs layout — fine in real engines,
 * and unreachable in jsdom where the fallback tier renders instead.
 *
 * Viewport awareness: a placement that would push the panel past the
 * viewport edge flips to the opposite side when that side has room for
 * it (bottom↔top, left↔right — the secondary-axis alignment stays as
 * chosen); when neither side fits, the position is clamped into the
 * viewport instead. Exported for direct testing like
 * `supportsNativePopover` above.
 */
export function placeFloatingPanel(
  panel: HTMLElement,
  trigger: HTMLElement,
  placement: FloatingPlacement
): void {
  if (placement === 'point') return;
  const rect = trigger.getBoundingClientRect();
  const box = panel.getBoundingClientRect();
  const viewport = {width: window.innerWidth, height: window.innerHeight};
  const centerX = rect.left + rect.width / 2 - box.width / 2;
  const centerY = rect.top + rect.height / 2 - box.height / 2;
  // The gap classes are the only declarative part of this tier — read
  // them back as the clearance between trigger and panel edges.
  const gap = {
    below: readGap(panel, 'marginTop'),
    above: readGap(panel, 'marginBottom'),
    after: readGap(panel, 'marginLeft'),
    before: readGap(panel, 'marginRight'),
  };

  // Coordinates for a vertical placement (panel over/under the trigger),
  // keeping the requested horizontal alignment across a vertical flip.
  const verticalPos = (
    side: 'top' | 'bottom',
    align: 'start' | 'center' | 'end'
  ) => ({
    top:
      side === 'bottom'
        ? rect.bottom + gap.below
        : rect.top - box.height - gap.above,
    left:
      align === 'start'
        ? rect.left
        : align === 'end'
          ? rect.right - box.width
          : centerX,
  });
  // Coordinates for a horizontal placement (panel beside the trigger);
  // the vertical center is shared by both sides.
  const horizontalPos = (side: 'left' | 'right') => ({
    top: centerY,
    left:
      side === 'right'
        ? rect.right + gap.after
        : rect.left - box.width - gap.before,
  });

  // The original placement's axes: flips only swap the primary side.
  const verticals = {
    bottom: {side: 'bottom', align: 'start'},
    'bottom-span': {side: 'bottom', align: 'start'},
    'bottom-center': {side: 'bottom', align: 'center'},
    'bottom-end': {side: 'bottom', align: 'end'},
    top: {side: 'top', align: 'center'},
  } as const;

  let {top, left} =
    placement === 'left' || placement === 'right'
      ? horizontalPos(placement)
      : verticalPos(verticals[placement].side, verticals[placement].align);

  if (placement === 'left' || placement === 'right') {
    const overflows =
      placement === 'right'
        ? left + box.width > viewport.width
        : left < 0;
    const fitsFlipped =
      placement === 'right'
        ? rect.left - box.width - gap.before >= 0
        : rect.right + box.width + gap.after <= viewport.width;
    if (overflows && fitsFlipped) {
      ({top, left} = horizontalPos(placement === 'right' ? 'left' : 'right'));
    }
  } else {
    const {side, align} = verticals[placement];
    const overflows =
      side === 'bottom' ? top + box.height > viewport.height : top < 0;
    const fitsFlipped =
      side === 'bottom'
        ? rect.top - box.height - gap.above >= 0
        : rect.bottom + box.height + gap.below <= viewport.height;
    if (overflows && fitsFlipped) {
      ({top, left} = verticalPos(side === 'bottom' ? 'top' : 'bottom', align));
    }
  }

  // Neither side fits (or the panel is taller/wider than the viewport):
  // clamp the panel fully into view.
  top = Math.min(Math.max(top, 0), Math.max(0, viewport.height - box.height));
  left = Math.min(
    Math.max(left, 0),
    Math.max(0, viewport.width - box.width)
  );
  panel.style.top = `${top}px`;
  panel.style.left = `${left}px`;
}

/**
 * Tier 2 positioning: place the panel under/over/beside the trigger and
 * re-place on scroll/resize while open. No-op on the anchored and
 * fallback tiers.
 */
export function useFloatingPosition({
  behavior,
  placement,
}: {
  behavior: FloatingBehavior;
  placement: FloatingPlacement;
}): void {
  const { native, anchored, open, triggerRef, panelRef } = behavior;
  useEffect(() => {
    if (!native || anchored || placement === 'point' || !open) return;
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    const place = () => placeFloatingPanel(panel, trigger, placement);
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [native, anchored, open, placement, triggerRef, panelRef]);
}

// ---------------------------------------------------------------------------
// Panel component
// ---------------------------------------------------------------------------

type FloatingPanelProps = {
  /** Behavior record produced by `useFloating` at the floating root. */
  behavior: FloatingBehavior;
  /**
   * Placement relative to the trigger. Omit (or pass 'point') when the
   * consumer positions the panel itself, e.g. ContextMenu at the pointer.
   */
  placement?: FloatingPlacement;
  /** Consumer visual skin: border, background, shadow, padding. */
  visualClass?: string;
  className?: string;
  children?: ReactNode;
  /** Merged with the anchor custom property the behavior may set. */
  style?: CSSProperties;
} & Omit<ComponentProps<'div'>, 'className' | 'children' | 'style'>;

/**
 * The panel element of a floating pair: applies the popover attribute,
 * the anchor custom property and the tier/placement classes, and runs the
 * tier-2 position effect. Everything else (id, role, handlers, ref) is
 * passed through to the underlying div.
 */
export function FloatingPanel({
  behavior,
  placement,
  visualClass,
  className,
  style,
  children,
  ...rest
}: FloatingPanelProps) {
  useFloatingPosition({ behavior, placement: placement ?? 'point' });

  const mergedStyle =
    behavior.panelAttrs.style || style
      ? { ...behavior.panelAttrs.style, ...style }
      : undefined;

  return (
    <div
      {...rest}
      {...behavior.panelAttrs}
      style={mergedStyle}
      x-class={[
        visualClass,
        ...behavior.panelClasses,
        ...(placement ? floatingPlacementClasses(behavior, placement) : []),
        className,
      ]}
    >
      {children}
    </div>
  );
}
