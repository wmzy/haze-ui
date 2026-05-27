import type {Dispatch, SetStateAction} from 'react';

import {createContext, useContext} from 'react';

type ContextMenuContextValue = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  x: number;
  y: number;
  setPosition: (x: number, y: number) => void;
};

const ContextMenuContext = createContext<ContextMenuContextValue | undefined>(undefined);

export const ContextMenuProvider = ContextMenuContext.Provider;

export function useContextMenuContext() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) throw new Error('ContextMenu components must be used within <ContextMenu>');
  return ctx;
}
