import type {Dispatch, SetStateAction} from 'react';

import {createContext, useContext} from 'react';

type TabsContextValue = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const TabsProvider = TabsContext.Provider;

export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>');
  return ctx;
}
