import type {Dispatch, SetStateAction} from 'react';

import {createContext, useContext} from 'react';

/**
 * Visual skin of the strip, declared once on `<Tabs>` and distributed
 * through context:
 *
 * - `line` — the classic underline strip (default, the long-standing look)
 * - `card` — flat antd-style cards; the selected tab raises onto a
 *   bordered surface, no strip separator
 * - `pill` — the Segmented-style capsule: a muted trough with the
 *   selected tab lifting onto the bg surface
 */
export type TabsVariant = 'line' | 'card' | 'pill';

/**
 * The strip-tail `+` affordance, declared once on `<Tabs>` — see
 * `addable` there. `addLabel` overrides the button's accessible
 * name (the i18n hook).
 */
export type TabsAddable = {
  onAdd?: () => void;
  addLabel?: string;
};

/**
 * Semantic slot classes (AntD v6 `classNames` shape) for the Tabs
 * family: declared once on the `<Tabs>` root and distributed to every
 * part through context — the sub-components stay prop-light while one
 * record themes the whole strip. Consumer classes are appended at the
 * end of each part's class list (able to override component defaults);
 * per-part `className` props remain for one-off tweaks and still land
 * after the slot class.
 */
export type TabsClassNames = {
  /** The wrapper `<div>` `<Tabs>` renders. */
  root?: string;
  /** The `<TabList>` strip (`role="tablist"`). */
  list?: string;
  /** Every `<Tab>` button (`role="tab"`). */
  tab?: string;
  /** Every `<TabPanel>` (`role="tabpanel"`). */
  panel?: string;
};

type TabsContextValue = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  /** Strip/tab visual variant — one declaration on `<Tabs>` skins
   *  every part (the strip chrome, each tab, the overflow areas). */
  variant: TabsVariant;
  /** Unmount inactive tab panels instead of keeping them alive and
   * hidden — see `destroyInactiveTabPane` on `<Tabs>`. */
  destroyInactiveTabPane: boolean;
  /** Defer each panel's first mount to its first activation — see
   * `lazy` on `<Tabs>`. */
  lazy: boolean;
  /** Values that have been active at least once (seeded with the
   *  initial value) — the lazy-mount ledger `TabPanel` consults
   *  before mounting an inactive panel. */
  activated: ReadonlySet<string>;
  /** Renders the strip-tail `+` button when set (TabList reads it). */
  addable: TabsAddable | undefined;
  classNames: TabsClassNames | undefined;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const TabsProvider = TabsContext.Provider;

export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>');
  return ctx;
}
