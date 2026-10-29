import type {
  PointerEvent as ReactPointerEvent,
  ReactNode,
  ComponentPropsWithoutRef,
  Ref,
} from 'react';

import { useCallback, useRef, useState } from 'react';
import { css } from '@linaria/core';

import Spinner from '../Spinner/Spinner';
import {
  capturePointer,
  releasePointerCaptureSafe,
} from '../../utils/pointer-capture';
import { useTouchScrollGuard } from '../../utils/touch-scroll-guard';

/** Gesture state machine: idle → pulling → ready → refreshing → idle. */
type PullToRefreshPhase =
  | 'idle'
  | 'pulling'
  | 'ready'
  | 'refreshing';

/** Payload handed to the `indicator` render prop. */
type PullToRefreshIndicatorInfo = {
  /** Current phase of the gesture state machine. */
  phase: PullToRefreshPhase;
  /**
   * Pull progress 0..1 — the (damped) pull offset divided by `distance`.
   * Reaches 1 exactly at the trigger threshold.
   */
  progress: number;
};

type PullToRefreshProps = {
  /**
   * Refresh action. A returned promise gates the refreshing phase: the
   * spinner stays up until it settles (fulfilled or rejected — rejection
   * is swallowed after the gesture because error reporting belongs to the
   * caller's channel, e.g. a toast inside their own handler), then the
   * head springs back to idle. `void` return settles immediately.
   */
  onRefresh: () => Promise<unknown> | void;
  /** The scrolling content; the gesture starts from anywhere inside it. */
  children: ReactNode;
  /**
   * Pull distance (px) that arms the refresh — the same value sizes the
   * head, so at the threshold the indicator is fully revealed. Also the
   * resting offset while refreshing. The default mirrors the
   * `--haze-space-16` step (64px): the gesture math needs a raw number,
   * so the token value is mirrored here rather than read back per frame.
   */
  distance?: number;
  /** Disables the gesture entirely (render output is unchanged). */
  disabled?: boolean;
  /**
   * Whether a pull may take over the gesture, evaluated once per pull as
   * it crosses the slop (not per move). Default: every ancestor between
   * the touched element and the document root sits at `scrollTop === 0`
   * — a walk over `parentElement` checking `scrollTop > 0` (the same
   * scroll-edge rule BottomSheet's swipe-to-dismiss uses). That walk
   * covers both scrollables rendered as `children` and outer scroll
   * containers (the page included), because a scroll chain with anything
   * left to scroll should keep scrolling natively instead of refreshing.
   */
  canRefresh?: () => boolean;
  /**
   * Renders the head indicator. Default: a down arrow that flips when
   * armed, a Spinner once refreshing, plus the status text props.
   */
  indicator?: (info: PullToRefreshIndicatorInfo) => ReactNode;
  /** Status text while pulling below the threshold (default indicator). */
  pullingText?: ReactNode;
  /** Status text once the pull passes the threshold (default indicator). */
  readyText?: ReactNode;
  /** Status text while the refresh promise is pending (default indicator). */
  refreshingText?: ReactNode;
  /** Forwarded to the root container (data-slot='container'). */
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const container = css`
  position: relative;
  /* The head rests translated above the top edge; only the pull reveals
     it, so the container must clip. */
  overflow: hidden;
  font-family: var(--haze-font-sans);
`;

/*
 * The head hangs off the content's top edge (translateY(offset -
 * distance)): at rest it is fully clipped above, the pull slides it —
 * and the content — down in lockstep, so the two never overlap. The
 * indicator row is pinned to the head's bottom edge, i.e. it rides just
 * above the content edge and rises out from behind the container's top
 * as the pull grows (the classic iOS reveal).
 */
const head = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: var(--haze-space-3);
  color: var(--haze-color-text-muted);
  transition: transform var(--haze-duration-normal) var(--haze-ease);

  /* Finger-following phases must not animate; the transition only
     covers the settle (arm → refreshing rest) and the spring-back. */
  &[data-phase='pulling'],
  &[data-phase='ready'] {
    transition: none;
  }

  &[data-phase='ready'],
  &[data-phase='refreshing'] {
    color: var(--haze-color-primary);
  }

  /* Decorative until the refresh actually runs — the Spinner's
     role="status" is the AT announcement channel then. */
  pointer-events: none;
`;

const indicatorRow = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  font-size: var(--haze-text-sm);
  white-space: nowrap;
`;

const arrow = css`
  width: var(--haze-space-4);
  height: var(--haze-space-4);
  transition: transform var(--haze-duration-fast) var(--haze-ease);

  /* The down arrow flips once the pull arms the refresh; under
     forced-colors the stroke flattens onto CanvasText but the flip
     keeps the armed state readable on its own. */
  [data-phase='ready'] & {
    transform: rotate(180deg);
  }
`;

const content = css`
  position: relative;
  /* No touch-action restriction on purpose: the effective touch-action
     is the intersection with every descendant's, so a pan-y here would
     kill native horizontal panning inside the content (carousels et al)
     and a pan-x would kill vertical scrolling. The document-level
     touchmove guard claims eligible pulls instead, leaving both native
     axes untouched. */
  transition: transform var(--haze-duration-normal) var(--haze-ease);
`;

const contentDragging = css`
  transition: none;
  /* Mouse drags must not select text mid-pull. */
  user-select: none;
`;

/** Default trigger distance (px) — mirrors the --haze-space-16 step. */
const DEFAULT_DISTANCE = 64;
/** Downward movement (px) before a pointer becomes a pull. */
const PULL_SLOP = 8;
/** Damped travel ceiling, in multiples of `distance`. */
const MAX_TRAVEL = 2;

type Gesture = {
  pointerId: number;
  startX: number;
  startY: number;
  dragging: boolean;
  /** Latest pull offset — release logic reads the ref, not render state. */
  offset: number;
};

/**
 * Default refresh eligibility: walk from the touched element up through
 * `parentElement` to the document root and require every `scrollTop`
 * along the chain to be 0. Any scrolled ancestor (an inner scroller
 * rendered as children, the page, or anything in between) means the
 * scroll chain still has room to scroll, so the pull must yield to
 * native scrolling instead of refreshing.
 */
function isScrollChainAtTop(target: EventTarget | null): boolean {
  let node: Element | null = target instanceof Element ? target : null;
  while (node) {
    if (node.scrollTop > 0) return false;
    node = node.parentElement;
  }
  return true;
}

export default function PullToRefresh({
  onRefresh,
  children,
  distance = DEFAULT_DISTANCE,
  disabled = false,
  canRefresh,
  indicator,
  pullingText = 'Pull to refresh',
  readyText = 'Release to refresh',
  refreshingText = 'Refreshing…',
  className,
  ref,
  ...rest
}: PullToRefreshProps) {
  const [phase, setPhase] = useState<PullToRefreshPhase>('idle');
  const [offset, setOffset] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const gestureRef = useRef<Gesture | null>(null);

  const pullAllowed = useCallback(
    (target: EventTarget | null) =>
      canRefresh ? canRefresh() : isScrollChainAtTop(target),
    [canRefresh],
  );

  // vaul/Base UI 式 touchmove 守卫（utils/touch-scroll-guard，与
  // BottomSheet 的下滑手势共用同一 hook）：只在手势「可转换」的窗口
  // 内 preventDefault，阻止引擎把触摸判归原生滚动/橡皮筋（那会
  // pointercancel 掐断 pointer 流）。内容未到顶、方向不向下、横向
  // 占优、未过 slop 时一律让位，横向平移与正常内容滚动完全不受
  // 影响。hook 内部保证监听恒定引用（canRefresh prop 身份不稳也不
  // 会中途换守卫丢掉 claim）并提供卸载安全网。
  const {claim: claimScrollGuard, release: releaseScrollGuard} =
    useTouchScrollGuard((event) => {
      const gesture = gestureRef.current;
      if (!gesture || event.touches.length !== 1) return false;
      const [touch] = event.touches;
      if (!touch) return false;
      const dx = touch.clientX - gesture.startX;
      const dy = touch.clientY - gesture.startY;
      if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) return false;
      return gesture.dragging || (dy > PULL_SLOP && pullAllowed(event.target));
    });

  const takeGesture = (content: HTMLDivElement, pointerId: number) => {
    // jsdom / engines without pointer capture: events keep bubbling
    // to the content handlers anyway.
    capturePointer(content, pointerId);
    claimScrollGuard();
  };

  const releaseGesture = (pointerId: number) => {
    // Some engines keep the implicit capture until the next tick —
    // release it safely so it cannot swallow the following click.
    const content = contentRef.current;
    if (content) releasePointerCaptureSafe(content, pointerId);
    releaseScrollGuard();
  };

  const startRefresh = async () => {
    setPhase('refreshing');
    setOffset(distance);
    try {
      await onRefresh();
    } catch {
      // Rejection still settles the gesture (the caller reports errors
      // through their own channel); the head springs back either way.
    }
    setPhase('idle');
    setOffset(0);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Only the primary button / first touch, never mid-refresh, never
    // a second pointer while a gesture is already tracked.
    if (disabled || phase === 'refreshing') return;
    if (e.button !== 0 || gestureRef.current) return;
    gestureRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      offset: 0,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    const content = contentRef.current;
    if (!gesture || !content || gesture.pointerId !== e.pointerId) return;
    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;
    if (!gesture.dragging) {
      // Conversion gate: past the slop, dominantly vertical, and
      // allowed to refresh — anything else keeps waiting (a swipe that
      // curves from horizontal into vertical still converts later).
      if (dy <= PULL_SLOP || Math.abs(dx) > Math.abs(dy)) return;
      if (!pullAllowed(e.target)) return;
      gesture.dragging = true;
      takeGesture(content, e.pointerId);
    }
    // 跟手位移：阈值内 1:1，超过后 0.5 阻尼（橡皮筋手感），封顶
    // 2× 距离；向上回拖钳到 0（松手即回弹，不触发）。
    const raw = Math.max(0, dy);
    const damped = raw <= distance ? raw : distance + (raw - distance) / 2;
    const next = Math.min(damped, distance * MAX_TRAVEL);
    gesture.offset = next;
    setOffset(next);
    setPhase(next >= distance ? 'ready' : 'pulling');
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (gesture?.pointerId !== e.pointerId) return;
    gestureRef.current = null;
    releaseGesture(e.pointerId);
    if (!gesture.dragging) return; // plain tap: nothing to settle
    if (gesture.offset >= distance) {
      void startRefresh();
    } else {
      setPhase('idle');
      setOffset(0);
    }
  };

  const handlePointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (gesture?.pointerId !== e.pointerId) return;
    gestureRef.current = null;
    releaseGesture(e.pointerId);
    // The engine stole the gesture (native scroll claimed it): spring
    // back, never refresh — the user never released deliberately.
    if (gesture.dragging) {
      setPhase('idle');
      setOffset(0);
    }
  };

  const dragging = phase === 'pulling' || phase === 'ready';
  const progress = Math.min(1, offset / distance);

  const defaultIndicator = (
    <>
      {phase === 'refreshing' ? (
        <Spinner size='sm' />
      ) : (
        <svg x-class={[arrow]} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4v14m0 0 6-6m-6 6-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>
        {phase === 'refreshing'
          ? refreshingText
          : phase === 'ready'
            ? readyText
            : pullingText}
      </span>
    </>
  );

  return (
    <div
      ref={ref}
      data-slot='container'
      aria-busy={phase === 'refreshing' || undefined}
      x-class={[container, className]}
      {...rest}
    >
      <div
        data-slot='head'
        data-phase={phase}
        aria-hidden={phase !== 'refreshing' || undefined}
        x-class={[head]}
        style={{
          height: distance,
          transform: `translateY(${offset - distance}px)`,
        }}
      >
        <div data-slot='indicator' x-class={[indicatorRow]}>
          {indicator ? indicator({ phase, progress }) : defaultIndicator}
        </div>
      </div>
      <div
        ref={contentRef}
        data-slot='content'
        x-class={[content, dragging && contentDragging]}
        style={{ transform: `translateY(${offset}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {children}
      </div>
    </div>
  );
}

export type { PullToRefreshProps, PullToRefreshPhase, PullToRefreshIndicatorInfo };
