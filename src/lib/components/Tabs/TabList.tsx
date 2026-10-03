import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import type { MenuDataItem } from '../Menu';
import type { TabProps, TabStatus } from './Tab';

import { css } from '@linaria/core';
import { Children, Fragment, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { getDirection } from '../../utils/direction';

import { Menu } from '../Menu';
import { useStrings } from '../LocaleProvider';

import Tab, { TabStatusDot } from './Tab';

import { useTabsContext } from './TabsContext';

type TabListProps = {
  className?: string;
  /** Overrides the ⋯ overflow trigger's aria-label (i18n hook). */
  overflowLabel?: string;
  children: ReactNode;
};

const base = css`
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--haze-color-border);
  overflow-x: auto;
  /* Tab boxes measure 1px taller than the border-adjusted
   * content box (border-bottom: 1px). overflow-y: hidden is a
   * legal pairing with overflow-x: auto (unlike visible, which
   * computes to auto) and swallows that sliver — otherwise a
   * phantom vertical scrollbar flickers in next to the strip. */
  overflow-y: hidden;
`;

/* Inside the bar the strip takes every leftover inline slot; the ⋯
 * area shrinks it when it appears, which the ResizeObserver picks up. */
const grow = css`
  flex: 1 1 auto;
  min-width: 0;
`;

const bar = css`
  display: flex;
  align-items: stretch;
`;

const overflowArea = css`
  display: flex;
  align-items: center;
  flex: none;
  padding-inline: var(--haze-space-1);
  /* Continues the strip's rule under the trigger so the bottom
   * border reads as one line. */
  border-bottom: 1px solid var(--haze-color-border);
`;

const overflowButton = css`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--haze-space-6);
  height: var(--haze-space-6);
  border: none;
  border-radius: var(--haze-radius-sm);
  background: transparent;
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-lg);
  line-height: 1;
  cursor: pointer;
  padding: 0 var(--haze-space-1);

  &:hover {
    color: var(--haze-color-text);
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  /* Forced-colors: the box-shadow ring is dropped by the UA — an
     inset Highlight outline replaces it. */
  @media (forced-colors: active) {
    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }
`;

/* Menu labels that carry a status dot line the two up like the tab. */
const menuTabLabel = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
`;

/** Enabled tabs in DOM order (roving tabindex keeps exactly one stop). */
const TAB_SELECTOR = '[role="tab"]:not([disabled])';

type TabMeta = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  status?: TabStatus;
};

/**
 * `<Tab>` children in DOM order for the overflow menu: arrays and
 * Fragments flatten. Anything else between the tabs is left alone —
 * it stays reachable through the strip's scroll, it just is not
 * listed in the menu.
 */
function collectTabMetas(children: ReactNode): TabMeta[] {
  const metas: TabMeta[] = [];
  const walk = (nodes: ReactNode) => {
    Children.forEach(nodes, (node) => {
      if (!isValidElement(node)) return;
      if (node.type === Tab) {
        const { value, icon, status, children: label } = node.props as TabProps;
        metas.push({ value, icon, status, label });
      } else if (node.type === Fragment) {
        // React 19's isValidElement narrows to ReactElement<unknown>.
        walk((node.props as { children?: ReactNode }).children);
      }
    });
  };
  walk(children);
  return metas;
}

/**
 * The tab strip: a roving-tabindex list per the WAI-ARIA tabs pattern —
 * ←/→ move between tabs with wrapping and automatic activation
 * (selection follows focus), Home/End jump to the ends. Under
 * `dir="rtl"` the horizontal arrows mirror (← advances), read from the
 * DOM at event time so the keys follow the mirrored strip.
 *
 * Document-tab overflow: the strip itself stays `overflow-x: auto`
 * (scrolling is the baseline, and the only gesture on touch), while a
 * `⋯` menu button appears beside it once the tabs no longer fit. The
 * menu lists every tab — name, icon and status dot — as a radio group
 * bound to the active value, so any tab stays selectable even when
 * scrolled out of view. Overflow is measured from `scrollWidth` vs
 * `clientWidth` through a ResizeObserver (jsdom has neither layout nor
 * the observer; there the strip simply renders menu-less).
 */
export default function TabList({
  className,
  overflowLabel,
  children,
}: TabListProps) {
  const { value, setValue, classNames } = useTabsContext();
  const strings = useStrings('tabs');
  const listRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  // Controlled handle on the ⋯ menu so a radio pick can close it.
  const [, setMenuOpen, menuOpenControl] = useControl(undefined, false);

  const tabMetas = useMemo(() => collectTabMetas(children), [children]);

  const overflowItems = useMemo<MenuDataItem[]>(() => {
    if (tabMetas.length === 0) return [];
    return [
      {
        type: 'group',
        // A plain `value` is an uncontrolled *initial* value — keyed by
        // the active tab so the group remounts (and re-checks the
        // right radio) whenever the selection moved outside the menu.
        key: `tab-list-overflow-${value}`,
        value,
        onValueChange: (next: string) => {
          setValue(next);
          setMenuOpen(false);
        },
        children: tabMetas.map((meta) => ({
          type: 'radio' as const,
          key: meta.value,
          value: meta.value,
          icon: meta.icon,
          label: meta.status ? (
            <span x-class={menuTabLabel}>
              <TabStatusDot status={meta.status} />
              {meta.label}
            </span>
          ) : (
            meta.label
          ),
        })),
      },
    ];
  }, [tabMetas, value, setValue, setMenuOpen]);

  const measure = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    // +1 tolerance: sub-pixel remainders in zoomed layouts must not
    // flip the menu on a fraction of a pixel.
    setOverflowing(el.scrollWidth > el.clientWidth + 1);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    measure();
    // jsdom ships no ResizeObserver — the initial measure above keeps
    // the strip menu-free there (tests stub the global to simulate
    // resizes). `children` re-runs the pass so tabs mounting or
    // unmounting re-measures even when the strip box itself did not
    // move.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, children]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>(TAB_SELECTOR) ?? []
    );
    if (tabs.length === 0) return;
    // `contains` also matches focus landing on a tab's inner content —
    // otherwise the -1 fallback keeps the legacy wrap-from-the-ends
    // behavior for focus outside the strip.
    const active = document.activeElement;
    const current = tabs.findIndex((tab) => tab.contains(active));

    const activate = (index: number) => {
      const tab = tabs[index];
      if (!tab) return;
      tab.focus();
      setValue(tab.dataset.hazeTabValue ?? '');
    };

    const nextKey =
      getDirection(listRef.current) === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = nextKey === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        activate(current < 0 ? 0 : (current + 1) % tabs.length);
        return;
      case prevKey:
        event.preventDefault();
        activate(
          current < 0 ? tabs.length - 1 : (current - 1 + tabs.length) % tabs.length
        );
        return;
      case 'Home':
        event.preventDefault();
        activate(0);
        return;
      case 'End':
        event.preventDefault();
        activate(tabs.length - 1);
        return;
    }
  };

  return (
    <div data-slot='tab-bar' x-class={bar}>
      <div
        ref={listRef}
        data-slot='tab-list'
        role='tablist'
        onKeyDown={handleKeyDown}
        x-class={[base, grow, className, classNames?.list]}
      >
        {children}
      </div>
      {overflowing && tabMetas.length > 0 && (
        <div data-slot='tab-overflow' x-class={overflowArea}>
          <Menu
            open={menuOpenControl}
            trigger={
              <button
                type='button'
                aria-label={overflowLabel ?? strings.moreTabs}
                x-class={overflowButton}
              >
                <span aria-hidden='true'>⋯</span>
              </button>
            }
            items={overflowItems}
          />
        </div>
      )}
    </div>
  );
}

export type { TabListProps };
