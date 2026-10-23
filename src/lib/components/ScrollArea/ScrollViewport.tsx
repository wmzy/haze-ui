import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import { css } from '@linaria/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { mergeRefs } from '../../utils/refs';

import { useScrollAreaContext } from './ScrollAreaContext';

type ScrollViewportProps = {
  className?: string;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const viewport = css`
  /* The one real scrollable element: the root is a flex column that
     caps it (e.g. via maxHeight) and this child shrinks below its
     content to scroll internally. */
  flex: 1;
  min-height: 0;
  overflow: auto;

  /* Native scrollbars are replaced by the overlay thumbs (geometry is
     driven from scroll events in ScrollThumb). */
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  /* Scrollable viewports are focusable (tabIndex flips on when content
     overflows) so native arrow/space/page scrolling works — the ring is
     inset to avoid shifting the overlay thumbs. */
  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--haze-color-focus-ring);
  }
`;

export default function ScrollViewport({
  className,
  children,
  ref,
  ...restProps
}: ScrollViewportProps) {
  const { setViewport, label } = useScrollAreaContext();
  const innerRef = useRef<HTMLDivElement | null>(null);
  // Purely internal UI state: whether the content overflows (drives the
  // focusability contract + data-scrollable) — never a controlled prop.
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => {
      const next =
        el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
      setScrollable((prev) => (prev === next ? prev : next));
    };
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    let observer: ResizeObserver | undefined;
    // jsdom has no ResizeObserver; mount + scroll re-measure covers it.
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(el);
    }
    return () => {
      el.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, []);

  const attachViewport = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      setViewport(node);
    },
    [setViewport]
  );
  // Stable identity: re-renders of this consumer must not churn the ref
  // (detach/attach would ping-pong null through the root's state).
  const mergedRef = useMemo(
    () => mergeRefs(ref, attachViewport),
    [ref, attachViewport]
  );

  const {
    tabIndex,
    'aria-label': ariaLabel,
    ...rest
  } = restProps;
  // Focusable only while there is something to scroll (an explicit
  // consumer tabIndex always wins).
  const resolvedTabIndex =
    tabIndex !== undefined ? tabIndex : scrollable ? 0 : undefined;

  return (
    <div
      ref={mergedRef}
      data-slot='scroll-viewport'
      data-scrollable={scrollable ? 'true' : 'false'}
      tabIndex={resolvedTabIndex}
      aria-label={ariaLabel ?? label}
      x-class={[viewport, className]}
      {...rest}
    >
      {children}
    </div>
  );
}

export type { ScrollViewportProps };
