import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type TabListProps = {
  className?: string;
  children: ReactNode;
};

const base = css`
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--pbl-color-border);
`;

export default function TabList({className, children}: TabListProps) {
  return (
    <div role='tablist' x-class={[base, className]}>
      {children}
    </div>
  );
}

export type {TabListProps};
