import type {
  ComponentPropsWithoutRef,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  Ref,
} from 'react';

import type { Orientation } from './scroll-math';

import { css } from '@linaria/core';

import { getDirection } from '../../utils/direction';

import { useScrollAreaContext } from './ScrollAreaContext';
import ScrollThumb from './ScrollThumb';
import {
  axisGeometry,
  readViewportAxis,
  trackPageToScroll,
  writeViewportAxis,
} from './scroll-math';

type ScrollbarProps = {
  /**
   * Axis this track overlays. The track is an absolutely positioned
   * strip on the corresponding root edge.
   */
  orientation?: Orientation;
  className?: string;
  /**
   * Track content — defaults to `<ScrollThumb orientation/>`. Custom
   * children replace the thumb wholesale (and with it the automatic
   * `data-scrollable` hit-testing toggle the built-in thumb maintains).
   */
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const track = css`
  position: absolute;
  z-index: 1;
  touch-action: none;
  user-select: none;

  /* The built-in thumb flips this to 'true' while the axis overflows;
     an idle track must not swallow clicks on the content below it. */
  pointer-events: none;

  &[data-scrollable='true'] {
    pointer-events: auto;
  }
`;

const trackVertical = css`
  top: var(--haze-space-1);
  bottom: var(--haze-space-1);
  right: var(--haze-space-1);
  width: var(--haze-space-2);
`;

const trackHorizontal = css`
  left: var(--haze-space-1);
  right: var(--haze-space-1);
  bottom: var(--haze-space-1);
  height: var(--haze-space-2);
`;

export default function Scrollbar({
  orientation = 'vertical',
  className,
  children,
  ref,
  ...rest
}: ScrollbarProps) {
  const { viewport } = useScrollAreaContext();

  // Track-press paging: native-scrollbar semantics (one viewport toward
  // the press, or land the thumb edge on it when nearer).
  const onPage = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (!viewport || event.button !== 0) return;
    event.preventDefault();
    const rect = el.getBoundingClientRect();
    const rtl = orientation === 'horizontal' && getDirection(el) === 'rtl';
    const trackPos =
      orientation === 'vertical'
        ? event.clientY - rect.top
        : rtl
          ? rect.right - event.clientX
          : event.clientX - rect.left;
    const axis = readViewportAxis(viewport, orientation, rtl);
    const geometry = axisGeometry({
      ...axis,
      trackSize: orientation === 'vertical' ? rect.height : rect.width,
      rtl,
    });
    if (!geometry.scrollable) return;
    const next = trackPageToScroll({
      trackPos,
      thumbOffset: geometry.thumbOffset,
      thumbSize: geometry.thumbSize,
      scrollOffset: axis.scrollOffset,
      viewportSize: axis.viewportSize,
      scrollSize: axis.scrollSize,
    });
    writeViewportAxis(viewport, orientation, rtl, next);
    // Keyboard follows pointer: continue from the paged position with
    // arrows/page keys.
    viewport.focus({ preventScroll: true });
  };

  return (
    <div
      ref={ref}
      data-slot='scrollbar'
      data-orientation={orientation}
      data-scrollable='false'
      onPointerDown={onPage}
      x-class={[
        track,
        orientation === 'vertical' ? trackVertical : trackHorizontal,
        className,
      ]}
      {...rest}
    >
      {children ?? <ScrollThumb orientation={orientation} />}
    </div>
  );
}

export type { ScrollbarProps };
