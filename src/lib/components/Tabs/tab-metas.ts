import type { ReactNode } from 'react';

import type { TabProps, TabStatus } from './Tab';

import { Children, Fragment, isValidElement } from 'react';

import Tab from './Tab';

export type TabMeta = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  status?: TabStatus;
};

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
