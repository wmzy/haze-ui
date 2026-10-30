import type { ReactNode } from 'react';

import { useState, useRef } from 'react';
import { css } from '@linaria/core';

import { clamp } from '../../utils/math';
import { usePointerDrag } from '../../utils/use-pointer-drag';

type SwipeActionProps = {
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
};

const wrapper = css`
  position: relative;
  overflow: hidden;
  font-family: var(--haze-font-sans);
`;

/* physical: the action panes pair with the physical swipe API
   (left/right props, onSwipeLeft/onSwipeRight, translateX drag) —
   gesture coordinates are physical, so the panes stay physical. */
const actionsLeft = css`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: center;
`;

const actionsRight = css`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
`;

const content = css`
  position: relative;
  background: var(--haze-color-bg);
  transition: transform var(--haze-duration-normal) ease;
  touch-action: pan-y;
  user-select: none;
`;

/** Drag travel cap in px — the reveal never slides further than the widest action pane. */
const MAX_OFFSET = 120;

export default function SwipeAction({
  left,
  right,
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  className,
}: SwipeActionProps) {
  const [offset, setOffset] = useState(0);
  const startXRef = useRef<number | null>(null);

  // Gesture plumbing rides the shared usePointerDrag hook (pointerId
  // gate + guarded pointer capture, the Signature precedent) instead of
  // the hand-rolled move/leave pair: capture keeps moves flowing after
  // the pointer leaves the element, so no onPointerLeave hack is
  // needed. The drag origin and release math stay local — pointerdown
  // anchors the origin (first apply), moves clamp the delta into
  // state, release fires the swipe callbacks past ±threshold.
  const drag = usePointerDrag<HTMLDivElement, number>(
    (event) => event.clientX,
    (x) => {
      if (startXRef.current === null) {
        startXRef.current = x;
        setOffset(0);
        return;
      }
      setOffset(clamp(x - startXRef.current, -MAX_OFFSET, MAX_OFFSET));
    },
    (x) => {
      const start = startXRef.current;
      startXRef.current = null;
      if (start !== null) {
        const dx = clamp(x - start, -MAX_OFFSET, MAX_OFFSET);
        if (dx > threshold) onSwipeRight?.();
        else if (dx < -threshold) onSwipeLeft?.();
      }
      setOffset(0);
    }
  );

  return (
    <div data-slot='swipe-action' x-class={[wrapper, className]}>
      {left && <div x-class={[actionsLeft]}>{left}</div>}
      {right && <div x-class={[actionsRight]}>{right}</div>}
      <div
        data-slot='content'
        x-class={[content]}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onPointerCancel={(event) => {
          drag.onPointerCancel(event);
          // Behavior fix: the hook intentionally skips commit on
          // cancel (aborted gesture), and the hand-rolled wiring this
          // replaces had no cancel handler at all — an engine-cancelled
          // gesture (palm rejection, scroll takeover) left the content
          // stuck mid-drag. Snap back to rest instead.
          setOffset(0);
          startXRef.current = null;
        }}
      >
        {children}
      </div>
    </div>
  );
}

export type { SwipeActionProps };
