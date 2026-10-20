import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import { useTabsContext } from './TabsContext';

type TabPanelProps = {
  value: string;
  className?: string;
  children: ReactNode;
};

const base = css`
  padding: var(--haze-space-4) 0;
`;

const hidden = css`
  display: none;
`;

export default function TabPanel({
  value,
  className,
  children,
}: TabPanelProps) {
  const { value: current, destroyInactiveTabPane, classNames } =
    useTabsContext();
  const isActive = current === value;

  // destroyInactiveTabPane: unmount instead of hide — the panel's
  // internal state (inputs, scroll) is destroyed on switch, which is
  // the point of the flag; the default keeps every panel alive behind
  // display:none (cheap tab switches, preserved state).
  if (!isActive && destroyInactiveTabPane) return null;

  return (
    <div
      data-slot='tab-panel'
      role='tabpanel'
      id={`tabpanel-${value}`}
      x-class={[base, !isActive && hidden, className, classNames?.panel]}
    >
      {children}
    </div>
  );
}

export type { TabPanelProps };
