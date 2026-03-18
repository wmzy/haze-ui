import type {ReactNode} from 'react';
import type {Control} from 'react-use-control';

import {css} from '@linaria/core';
import {useControl} from 'react-use-control';

import {TabsProvider} from './TabsContext';

type TabsProps = {
  value?: Control<string> | string;
  className?: string;
  children: ReactNode;
};

const base = css`
  display: flex;
  flex-direction: column;
  font-family: var(--pbl-font-sans);
`;

export default function Tabs({
  value: valueControl,
  className,
  children,
}: TabsProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');

  return (
    <div x-class={[base, className]}>
      <TabsProvider value={{value, setValue}}>
        {children}
      </TabsProvider>
    </div>
  );
}

export type {TabsProps};
