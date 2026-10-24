import type {
  ComponentPropsWithoutRef,
  PointerEvent as ReactPointerEvent,
  Ref,
} from 'react';

import type { Orientation } from './scroll-math';

import { css } from '@linaria/core';
import { useEffect, useRef } from 'react';

import { getDirection } from '../../utils/direction';
import { mergeRefs } from '../../utils/refs';

import { useScrollAreaContext } from './ScrollAreaContext';
import {
  axisGeometry,
  readViewportAxis,
  thumbDragToScroll,
  writeViewportAxis,
} from './scroll-math';

type ScrollThumbProps = {
  orientation?: Orientation;
  className?: string;
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

/** How long a thumb stays visible after the last scroll in `scroll` mode. */
const SCROLL_HIDE_DELAY = 600;

const thumb = css`
  display: block;
  touch-action: none;
  /* The parent track opts out of hit-testing while its axis is idle;
     the thumb itself must stay reachable. */
  pointer-events: auto;
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-border);
  opacity: 0;
  transition: opacity var(--haze-duration-fast) var(--haze-ease);

  &[data-visible='true'] {
    opacity: 1;
  }

  &:hover,
  &[data-active='true'] {
    background: var(--haze-color-border-hover);
  }

  &[data-active='true'] {
    opacity: 1;
  }

  @media (forced-colors: active) {
    &[data-visible='true'] {
      background: Highlight;
    }
  }
`;

const thumbVertical = css`
  width: 100%;
`;

const thumbHorizontal = css`
  height: 100%;
`;

/** Extent of the track the thumb sits in (viewport extent as fallback). */
function trackExtent(
  track: HTMLElement | null,
  viewport: HTMLElement,
  orientation: Orientation
): number {
  const rect = track?.getBoundingClientRect();
  if (rect) {
    return orientation === 'vertical' ? rect.height : rect.width;
  }
  return orientation === 'vertical'
    ? viewport.clientHeight
    : viewport.clientWidth;
}

export default function ScrollThumb({
  orientation = 'vertical',
  className,
  ref,
  ...rest
}: ScrollThumbProps) {
  const { mode, viewport } = useScrollAreaContext();
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const hideTimerRef = useRef<number>(0);
  const dragRef = useRef<{
    pointerId: number;
    startPos: number;
    thumbStart: number;
    rtl: boolean;
  } | null>(null);

  useEffect(() => {
    const el = thumbRef.current;
    if (!el || !viewport) return;
    const track = el.parentElement;

    const setVisible = (visible: boolean) => {
      el.dataset.visible = visible ? 'true' : 'false';
    };
    const scheduleHide = () => {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        if (!dragRef.current) setVisible(false);
      }, SCROLL_HIDE_DELAY);
    };

    const update = () => {
      const rtl = orientation === 'horizontal' && getDirection(el) === 'rtl';
      const axis = readViewportAxis(viewport, orientation, rtl);
      const geometry = axisGeometry({
        ...axis,
        trackSize: trackExtent(track, viewport, orientation),
        rtl,
      });
      // The track only hit-tests while its axis overflows.
      if (track) {
        track.dataset.scrollable = geometry.scrollable ? 'true' : 'false';
      }
      if (!geometry.scrollable) {
        el.style.transform = '';
        el.style.height = '0px';
        el.style.width = '0px';
        setVisible(false);
        return;
      }
      if (orientation === 'vertical') {
        el.style.height = `${geometry.thumbSize}px`;
        el.style.width = '';
      } else {
        el.style.width = `${geometry.thumbSize}px`;
        el.style.height = '';
      }
      const axisLetter = orientation === 'vertical' ? 'Y' : 'X';
      el.style.transform = `translate${axisLetter}(${geometry.thumbOffset}px)`;
      if (mode === 'always') setVisible(true);
    };

    const schedule = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    const onScroll = () => {
      schedule();
      if (mode === 'scroll') {
        setVisible(true);
        scheduleHide();
      }
    };
    const onHoverShow = () => {
      if (mode === 'hover') setVisible(true);
    };
    const onHoverHide = () => {
      if (mode === 'hover' && !dragRef.current) setVisible(false);
    };

    update();
    viewport.addEventListener('scroll', onScroll, { passive: true });
    // 'hover' listens on the whole root: the thumb shows as soon as the
    // pointer enters the scroll area, not only over the thin track.
    const root = el.closest('[data-slot="scroll-area"]');
    root?.addEventListener('pointerenter', onHoverShow);
    root?.addEventListener('pointerleave', onHoverHide);

    let observer: ResizeObserver | undefined;
    // jsdom has no ResizeObserver; mount + scroll updates cover it.
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(schedule);
      observer.observe(viewport);
    }
    return () => {
      viewport.removeEventListener('scroll', onScroll);
      root?.removeEventListener('pointerenter', onHoverShow);
      root?.removeEventListener('pointerleave', onHoverHide);
      observer?.disconnect();
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(hideTimerRef.current);
    };
  }, [viewport, mode, orientation]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = thumbRef.current;
    if (!el || !viewport || event.button !== 0) return;
    // The track's paging must not fire for thumb presses.
    event.stopPropagation();
    event.preventDefault();
    const rtl = orientation === 'horizontal' && getDirection(el) === 'rtl';
    const geometry = axisGeometry({
      ...readViewportAxis(viewport, orientation, rtl),
      trackSize: trackExtent(el.parentElement, viewport, orientation),
      rtl,
    });
    dragRef.current = {
      pointerId: event.pointerId,
      startPos: orientation === 'vertical' ? event.clientY : event.clientX,
      thumbStart: geometry.thumbOffset,
      rtl,
    };
    el.dataset.active = 'true';
    el.dataset.visible = 'true';
    // Pointer capture keeps the drag alive outside the 8px track.
    // Older engines/jsdom lack it — the thumb then only drags in range.
    if (typeof el.setPointerCapture === 'function') {
      el.setPointerCapture(event.pointerId);
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = thumbRef.current;
    if (!drag || !el || !viewport || event.pointerId !== drag.pointerId) {
      return;
    }
    const pointerDelta =
      (orientation === 'vertical' ? event.clientY : event.clientX) -
      drag.startPos;
    const next = thumbDragToScroll({
      thumbStart: drag.thumbStart,
      pointerDelta,
      ...readViewportAxis(viewport, orientation, drag.rtl),
      trackSize: trackExtent(el.parentElement, viewport, orientation),
      rtl: drag.rtl,
    });
    writeViewportAxis(viewport, orientation, drag.rtl, next);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = thumbRef.current;
    if (event.pointerId !== drag?.pointerId) return;
    dragRef.current = null;
    if (!el) return;
    el.dataset.active = 'false';
    // Mirror the setPointerCapture guard: engines without pointer capture
    // (jsdom, older browsers) never captured, so there is nothing to release.
    if (
      typeof el.hasPointerCapture === 'function' &&
      el.hasPointerCapture(event.pointerId)
    ) {
      el.releasePointerCapture(event.pointerId);
    }
    if (mode === 'scroll') {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        const node = thumbRef.current;
        if (node && !dragRef.current) node.dataset.visible = 'false';
      }, SCROLL_HIDE_DELAY);
    }
    // 'hover'/'always': keep showing — the pointer is still inside the
    // scroll area in the common case; hover hides on pointerleave.
  };

  return (
    <div
      ref={mergeRefs(ref, thumbRef)}
      data-slot='scroll-thumb'
      data-orientation={orientation}
      data-visible='false'
      data-active='false'
      x-class={[
        thumb,
        orientation === 'vertical' ? thumbVertical : thumbHorizontal,
        className,
      ]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onLostPointerCapture={endDrag}
      {...rest}
    />
  );
}

export type { ScrollThumbProps };
