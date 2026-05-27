import type {Dispatch, SetStateAction} from 'react';
import {createContext, useContext} from 'react';

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(undefined);

export const DropdownMenuProvider = DropdownMenuContext.Provider;

export function useDropdownMenuContext() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components must be used within <DropdownMenu>');
  return ctx;
}
