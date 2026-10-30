import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { css } from '@linaria/core';

import { useAnchorSpy } from '../../hooks/useAnchorSpy';
import { useElementSize } from '../../hooks/useElementSize';

export type AnchorItem = {
  /** Section id — the scroll target is `document.getElementById(id)`. */
  id: string;
  /** Link content. */
  label: ReactNode;
  /** Nested second-level items, rendered as an indented sub-list. */
  children?: AnchorItem[];
};

type AnchorProps = {
  /** Anchor sections, in document order. */
  items: AnchorItem[];
  /** Highlighted section id. Accepts a control (controlled) or a plain value (uncontrolled initial). */
  activeId?: ControlOrValue<string>;
  /** Fires when a link is clicked, after the highlight moves and before scrolling is queued. */
  onClick?: (id: string) => void;
  /** Distance kept between the container top and the section top when scrolling (sticky header height), px. */
  offsetTop?: number;
  /** Scroll-spy trigger line, px from the container top (fallback engines only). */
  bounds?: number;
  /** Scroll container; defaults to `window`. */
  getContainer?: () => HTMLElement | Window;
  /** Renders a sliding indicator line along the active item (transform transition; no transition under prefers-reduced-motion). Default `false`. */
  indicator?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'nav'>, 'className' | 'onClick' | 'children'>;

const nav = css`
  position: sticky;
  top: 0;
  font-size: var(--haze-text-sm);
`;

const list = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
`;

const sublist = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  margin: var(--haze-space-1) 0 0;
  padding-inline-start: var(--haze-space-4);
  list-style: none;
`;

const link = css`
  display: block;
  padding: var(--haze-space-1) var(--haze-space-2);
  border-inline-start: var(--haze-space-1) solid transparent;
  border-radius: 0 var(--haze-radius-sm) var(--haze-radius-sm) 0;
  color: var(--haze-color-text-muted);
  text-decoration: none;
  transition:
    color var(--haze-duration-fast) var(--haze-ease),
    border-color var(--haze-duration-fast) var(--haze-ease);

  &:hover {
    color: var(--haze-color-text);
  }
`;

const linkActive = css`
  color: var(--haze-color-primary);
  font-weight: var(--haze-weight-medium);
`;

const linkActiveBar = css`
  border-inline-start-color: var(--haze-color-primary);
`;

const indicatorBar = css`
  position: absolute;
  inset-inline-start: 0;
  top: 0;
  width: var(--haze-space-1);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-primary);
  pointer-events: none;
  transition:
    transform var(--haze-duration-normal) var(--haze-ease),
    height var(--haze-duration-normal) var(--haze-ease),
    opacity var(--haze-duration-fast) var(--haze-ease);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const indicatorHidden = css`
  opacity: 0;
`;

/** Depth-first id flatten — the spy matches sections in document order across levels. */
function flattenIds(items: readonly AnchorItem[]): string[] {
  return items.flatMap((item) => {
    const childIds = item.children?.length ? flattenIds(item.children) : [];
    return [item.id, ...childIds];
  });
}

export default function Anchor({
  items,
  activeId: activeIdControl,
  onClick,
  indicator = false,
  offsetTop = 0,
  bounds = 5,
  getContainer,
  className,
  ...rest
}: AnchorProps) {
  const ids = useMemo(() => flattenIds(items), [items]);
  // Scroll-spy engine lives in useAnchorSpy (also exported from
  // `haze-ui/hooks`) — the component only adds rendering and scrolling.
  const { activeId, setActiveId } = useAnchorSpy({
    ids,
    getContainer,
    offsetTop,
    bounds,
    activeId: activeIdControl,
  });

  // Sliding indicator: the active link's offset within the nav drives one
  // absolutely positioned bar (translateY + height, transform transition).
  // Re-measured when the highlight moves or the nav resizes (useElementSize).
  const navElRef = useRef<HTMLElement | null>(null);
  const [bar, setBar] = useState<{ top: number; height: number } | null>(null);
  const [sizeRef, size] = useElementSize<HTMLElement>({ enabled: indicator });
  const navRef = useCallback(
    (el: HTMLElement | null) => {
      navElRef.current = el;
      sizeRef(el);
    },
    [sizeRef]
  );

  const measureBar = useCallback(() => {
    const active = navElRef.current?.querySelector<HTMLElement>(
      'a[aria-current="true"]'
    );
    if (!active) {
      setBar(null);
      return;
    }
    setBar({ top: active.offsetTop, height: active.offsetHeight });
  }, []);

  useEffect(() => {
    if (!indicator) return;
    measureBar();
  }, [indicator, activeId, items, size, measureBar]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const container = getContainer?.() ?? window;
    if (container instanceof HTMLElement) {
      container.scrollTo({
        top:
          el.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop -
          offsetTop,
        behavior: 'smooth',
      });
      return;
    }
    container.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - offsetTop,
      behavior: 'smooth',
    });
  };

  const renderItem = (item: AnchorItem) => {
    const active = activeId === item.id;
    return (
      <li key={item.id} data-slot='item'>
        <a
          data-slot='link'
          href={`#${item.id}`}
          x-class={[link, active && linkActive, active && !indicator && linkActiveBar]}
          aria-current={active ? 'true' : undefined}
          onClick={(event) => {
            event.preventDefault();
            setActiveId(item.id);
            onClick?.(item.id);
            scrollToId(item.id);
          }}
        >
          {item.label}
        </a>
        {item.children?.length ? (
          <ul data-slot='sublist' x-class={[sublist]}>
            {item.children.map(renderItem)}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <nav data-slot='anchor' ref={navRef} x-class={[nav, className]} {...rest}>
      {indicator ? (
        <span
          aria-hidden='true'
          data-slot='indicator'
          x-class={[indicatorBar, bar === null && indicatorHidden]}
          style={
            bar === null
              ? undefined
              : {
                  transform: `translateY(${bar.top}px)`,
                  height: `${bar.height}px`,
                }
          }
        />
      ) : null}
      <ul data-slot='list' x-class={[list]}>
        {items.map(renderItem)}
      </ul>
    </nav>
  );
}

export type { AnchorProps };
