import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import type { ScrollbarMode } from './ScrollAreaContext';

import { css } from '@linaria/core';
import { Children, isValidElement, useState } from 'react';

import { ScrollAreaProvider } from './ScrollAreaContext';
import Scrollbar from './Scrollbar';
import ScrollThumb from './ScrollThumb';
import ScrollViewport from './ScrollViewport';

type ScrollAreaProps = {
  /**
   * Caps the scroll area's height (px when numeric) — the long-standing
   * sugar sizing knob. Compound usage can size the root via CSS instead.
   */
  maxHeight?: number | string;
  /**
   * Scrollbar visibility mode: `'hover'` (default) shows thumbs while
   * the pointer is over the scroll area, `'always'` keeps them on,
   * `'scroll'` flashes them after each scroll.
   */
  type?: ScrollbarMode;
  /**
   * Accessible name for the scrollable viewport (it becomes focusable
   * while its content overflows, so keyboard users need a name). An
   * `aria-label` on `<ScrollViewport>` wins.
   */
  label?: string;
  className?: string;
  /**
   * Sugar path: plain content is wrapped in an implicit viewport with
   * overlay scrollbars. Compound path: include `<ScrollViewport>` (or
   * `<Scrollbar>`/`<ScrollThumb>`) children and they compose as given —
   * an explicit `<Scrollbar>` suppresses the auto-appended pair.
   */
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const root = css`
  position: relative;
  display: flex;
  flex-direction: column;
  /* Clips to the capped height; the viewport child scrolls inside. */
  overflow: hidden;
  font-family: var(--haze-font-sans);
`;

const isElementOfType = (child: ReactNode, type: unknown) =>
  isValidElement(child) && child.type === type;

export default function ScrollArea({
  maxHeight,
  type = 'hover',
  label,
  className,
  children,
  ref,
  style: consumerStyle,
  ...rest
}: ScrollAreaProps) {
  // The viewport element registry lives here so scrollbars can wire
  // their listeners to whatever viewport mounted beneath them.
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);

  // The documented maxHeight prop owns the property; a consumer style
  // object rides along for everything else.
  const style =
    maxHeight !== undefined
      ? {
          ...consumerStyle,
          maxHeight:
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }
      : consumerStyle;

  const kids = Children.toArray(children);
  const hasViewport = kids.some((child) => isElementOfType(child, ScrollViewport));
  const hasScrollbar =
    kids.some((child) => isElementOfType(child, Scrollbar)) ||
    kids.some((child) => isElementOfType(child, ScrollThumb));
  const compound = hasViewport || hasScrollbar;

  return (
    <div
      ref={ref}
      data-slot='scroll-area'
      data-type={type}
      x-class={[root, className]}
      style={style}
      {...rest}
    >
      <ScrollAreaProvider value={{ mode: type, viewport, setViewport, label }}>
        {compound ? children : <ScrollViewport>{children}</ScrollViewport>}
        {!hasScrollbar && (
          <>
            <Scrollbar orientation='vertical' />
            <Scrollbar orientation='horizontal' />
          </>
        )}
      </ScrollAreaProvider>
    </div>
  );
}

export type { ScrollAreaProps };
