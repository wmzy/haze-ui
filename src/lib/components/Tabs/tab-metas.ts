import type { ReactNode } from 'react';

import type { TabProps, TabStatus } from './Tab';

import { useEffect, useState } from 'react';

import { walkChildren } from '../../utils/walk-children';

import Tab from './Tab';

export type TabMeta = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  status?: TabStatus;
  /** Carried into the overflow menu so a disabled tab is not
   * selectable through the ⋯ radios either. */
  disabled?: boolean;
};

/**
 * The lazy-mount ledger: tab values that have been active at least
 * once, seeded with the initial value. `<TabPanel>` consults it when
 * `lazy` is set on `<Tabs>` — a panel that has never been active stays
 * unmounted until its first activation. Recording happens in an effect
 * (the newly active panel already mounts through `isActive`, so the
 * one-commit lag is invisible). Lives here beside the metas collector
 * so the component files keep a components-only export surface for
 * react-refresh.
 */
export function useActivatedTabs(
  activeValue: string,
  enabled: boolean
): ReadonlySet<string> {
  const [activated, setActivated] = useState<ReadonlySet<string>>(
    () => new Set([activeValue])
  );
  useEffect(() => {
    // Only maintained while lazy is in play — eager strips never read it.
    if (!enabled) return;
    setActivated((prev) =>
      prev.has(activeValue) ? prev : new Set(prev).add(activeValue)
    );
  }, [activeValue, enabled]);
  return activated;
}

/**
 * `<Tab>` children in DOM order for the overflow menu: arrays and
 * Fragments flatten. Anything else between the tabs is left alone —
 * it stays reachable through the strip's scroll, it just is not
 * listed in the menu. Exported so SortableTabList — whose `<Tab>`
 * children sit inside sortable wrappers this collector cannot see
 * through — can gather the same metas itself and hand them over.
 *
 * Lives in a sibling file (not TabList.tsx) so the component file
 * keeps a components-only export surface for react-refresh.
 */
export function collectTabMetas(children: ReactNode): TabMeta[] {
  const metas: TabMeta[] = [];
  // The mapped tree is discarded (metas only); ReactNode includes
  // Promise children, hence the void.
  void walkChildren(
    children,
    (element) => {
      if (element.type !== Tab) return;
      const { value, icon, status, disabled, children: label } =
        element.props as TabProps;
      metas.push({ value, icon, status, disabled, label });
    },
    { flattenFragments: true }
  );
  return metas;
}
