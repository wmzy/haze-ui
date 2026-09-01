import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { TabsProvider } from './TabsContext';

type TabsProps = {
  value?: ControlOrValue<string>;
  className?: string;
  children: ReactNode;
};

const base = css`
  display: flex;
  flex-direction: column;
  font-family: var(--haze-font-sans);
`;

export default function Tabs({
  value: valueControl,
  className,
  children,
}: TabsProps) {
  const [value, setValue] = useControl(valueControl, '');

  return (
    <div x-class={[base, className]}>
      <TabsProvider value={{ value, setValue }}>{children}</TabsProvider>
    </div>
  );
}

export type { TabsProps };
