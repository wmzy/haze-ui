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
  const { value: current } = useTabsContext();
  const isActive = current === value;

  return (
    <div
      role='tabpanel'
      id={`tabpanel-${value}`}
      x-class={[base, !isActive && hidden, className]}
    >
      {children}
    </div>
  );
}

export type { TabPanelProps };
