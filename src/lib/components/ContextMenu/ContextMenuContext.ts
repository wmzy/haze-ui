import type { Dispatch, RefObject, SetStateAction } from 'react';

import type { FloatingBehavior } from '../../utils/floating';

import { createContext, useContext } from 'react';

/**
 * Semantic slot classes (AntD v6 `classNames` shape) for the
 * ContextMenu family: declared once on `<ContextMenu>` and distributed
 * to every part through this context — one record themes the wrapper,
 * the trigger area, the content panel and every item. Consumer classes
 * are appended at the end of each part's class list (able to override
 * component defaults); per-part `className` props remain for one-off
 * tweaks and still land after the slot class.
 */
export type ContextMenuClassNames = {
  /** The wrapper `<div>` (`data-slot='context-menu'`) the root renders. */
  root?: string;
  /** Every `<ContextMenuTrigger>` area (`data-slot='trigger'`). */
  trigger?: string;
  /** Every `<ContextMenuContent>` panel (`role="menu"`, `data-slot='content'`). */
  content?: string;
  /** Every `<ContextMenuItem>` (`data-slot='menu-item'`). */
  item?: string;
  /** Every `<ContextMenuSeparator>` (`data-slot='separator'`). */
  separator?: string;
};

type ContextMenuContextValue = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  x: number;
  y: number;
  setPosition: (x: number, y: number) => void;
  contentRef: RefObject<HTMLDivElement | null>;
  /** Floating-panel behavior shared by the root and content. */
  floating: FloatingBehavior;
  /** Slot classes declared on the root `<ContextMenu>`; parts append
   *  them after their own classes, before per-part `className`. */
  classNames: ContextMenuClassNames | undefined;
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
