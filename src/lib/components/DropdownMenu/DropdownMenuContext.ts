import type {Dispatch, RefObject, SetStateAction} from 'react';

import {createContext, useContext} from 'react';

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  /** id of the menu element; wired to the trigger's aria-controls */
  contentId: string;
  /**
   * Focus handoff requested by the trigger ('first'/'last' item) when it
   * opens the menu by keyboard — consumed by Content's mount effect,
   * which runs after the items exist.
   */
  focusRequestRef: {current: 'first' | 'last' | null};
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(undefined);

export const DropdownMenuProvider = DropdownMenuContext.Provider;

export function useDropdownMenuContext() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components must be used within <DropdownMenu>');
  return ctx;
}
