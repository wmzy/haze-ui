import type { Dispatch, RefObject, SetStateAction } from 'react';

import type { FloatingBehavior } from '../../utils/floating';

import { createContext, useContext } from 'react';


type ContextMenuContextValue = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  x: number;
  y: number;
  setPosition: (x: number, y: number) => void;
  contentRef: RefObject<HTMLDivElement | null>;
  /** Floating-panel behavior shared by the root and content. */
  floating: FloatingBehavior;
};

const ContextMenuContext = createContext<ContextMenuContextValue | undefined>(
  undefined
);

export const ContextMenuProvider = ContextMenuContext.Provider;

export function useContextMenuContext() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx)
    throw new Error('ContextMenu components must be used within <ContextMenu>');
  return ctx;
}
