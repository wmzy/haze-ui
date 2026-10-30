import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { TabsClassNames, TabsVariant, TabsAddable } from './TabsContext';
import type { TabStatus } from './Tab';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { warnItemsChildrenConflict } from '../../utils/warn-items-children';

import { TabsProvider } from './TabsContext';
import Tab from './Tab';
import TabList from './TabList';
import TabPanel from './TabPanel';
import { useActivatedTabs } from './tab-metas';

/**
 * One tab of the data-driven `items` API on `<Tabs>`: the same affordances
 * a compound `<Tab>` + `<TabPanel>` pair would declare, flattened into a
 * record. `panel` is the tab's content — the panel always renders (even
 * without `panel`) so the tab's `aria-controls` target never dangles.
 */
type TabData = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Inert tab: not clickable, not focusable, skipped by the roving
   *  model — surfaced on the compound layer as Tab's `disabled`. */
  disabled?: boolean;
  /** Renders the × close affordance (purely visual on this path — the
   *  notifying `onClose` lives on the compound `<Tab>`). */
  closable?: boolean;
  status?: TabStatus;
  panel?: ReactNode;
};

type TabsProps = {
  value?: ControlOrValue<string>;
  /**
   * Visual skin of the whole strip, distributed through context:
   * `line` (default — the classic underline strip, full-width
   * separator), `card` (flat antd-style cards, the selected tab
   * raising onto a bordered surface) or `pill` (the Segmented-style
   * capsule). Omitting it keeps the line look byte-for-byte.
   */
  variant?: TabsVariant;
  /**
   * Data-driven mode: renders the `<TabList>` (one `<Tab>` per item)
   * and every `<TabPanel>` for you — the strip keeps the full
   * compound machinery (overflow folding, roving keyboard,
   * ResizeObserver compression) because it is the same `<TabList>`
   * path. Mutually exclusive with compound `children`; when both are
   * given, `items` wins and a dev-time console.error explains the
   * conflict.
   */
  items?: TabData[];
  /**
   * `false` (default) keeps inactive tab panels mounted and hidden
   * (`display: none`) — panel state survives tab switches. `true`
   * unmounts them instead: switching destroys the panel's internal
   * state (inputs, scroll), trading keep-alive for a lighter DOM.
   */
  destroyInactiveTabPane?: boolean;
  /**
   * `false` (default) mounts every panel eagerly (hidden behind
   * `display: none` when inactive). `true` defers each panel's first
   * mount to its first activation — `items` and compound paths alike.
   * After the first activation `destroyInactiveTabPane` takes over
   * again: keep the panel alive and hidden (`false`) or unmount it on
   * every switch away (`true`).
   */
  lazy?: boolean;
  /**
   * Renders the `+` button at the tail of the tab bar (outside the
   * tablist, so the strip keeps owning nothing but tabs). A real
   * button — a normal tab stop, Enter/Space activates. `onAdd` only
   * notifies; growing the `items` array (or mounting another compound
   * `<Tab>`) is the consumer's job. `addLabel` overrides the
   * accessible name.
   */
  addable?: TabsAddable;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape): declared once
   * here and distributed to every part through context — see
   * {@link TabsClassNames}. Omitting it changes nothing.
   */
  classNames?: TabsClassNames;
  className?: string;
  /**
   * Forwarded to the root wrapper `<div data-slot='tabs'>` — layout
   * measurement and `ref.current.focus()`-style element access reach
   * the family root (the strip and panels keep their own internal
   * handles).
   */
  ref?: Ref<HTMLDivElement>;
  /** Compound mode: `<TabList>` + `<TabPanel>`s. Omit when using `items`. */
  children?: ReactNode;
};

const base = css`
  display: flex;
  flex-direction: column;
  font-family: var(--haze-font-sans);
`;

export default function Tabs({
  value: valueControl,
  variant = 'line',
  items,
  destroyInactiveTabPane = false,
  lazy = false,
  addable,
  classNames,
  className,
  ref,
  children,
}: TabsProps) {
  const [value, setValue] = useControl(valueControl, '');
  // Which panels have been activated at least once — the lazy-mount
  // ledger, shared by the items and compound paths through context.
  const activated = useActivatedTabs(value, lazy);

  const useItems = items !== undefined;
  if (useItems && children != null) {
    // Dev-time guard rather than a throw: rendering continues with the
    // items path so a partially-migrated call site still shows tabs,
    // while the console names the contract breach.
    warnItemsChildrenConflict('Tabs');
  }

  const content = useItems ? (
    <>
      <TabList>
        {items.map((item) => (
          <Tab
            key={item.value}
            value={item.value}
            icon={item.icon}
            status={item.status}
            closable={item.closable}
            disabled={item.disabled}
          >
            {item.label}
          </Tab>
        ))}
      </TabList>
      {items.map((item) => (
        <TabPanel key={item.value} value={item.value}>
          {item.panel}
        </TabPanel>
      ))}
    </>
  ) : (
    children
  );

  return (
    <div ref={ref} data-slot='tabs' x-class={[base, className, classNames?.root]}>
      <TabsProvider
        value={{
          value,
          setValue,
          variant,
          destroyInactiveTabPane,
          lazy,
          activated,
          addable,
          classNames,
        }}
      >
        {content}
      </TabsProvider>
    </div>
  );
}

export type { TabsProps, TabData };
