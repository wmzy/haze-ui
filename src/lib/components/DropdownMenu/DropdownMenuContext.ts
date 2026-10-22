import type { Dispatch, RefObject, SetStateAction } from 'react';

import type { FloatingBehavior } from '../../utils/floating';

import { createContext, useContext } from 'react';

/**
 * Semantic slot classes (AntD v6 `classNames` shape) for the
 * DropdownMenu family: declared once on `<DropdownMenu>` and
 * distributed to every part through this context — one record themes
 * the wrapper, the trigger, the content panel and every item kind
 * while the sub-components stay prop-light. Consumer classes are
 * appended at the end of each part's class list (able to override
 * component defaults); per-part `className` props remain for one-off
 * tweaks and still land after the slot class.
 */
export type DropdownMenuClassNames = {
  /** The wrapper `<div>` (`data-slot='dropdown-menu'`) the root renders. */
  root?: string;
  /** Every `<DropdownMenuTrigger>` button (`data-slot='trigger'`). */
  trigger?: string;
  /** Every `<DropdownMenuContent>` panel (`role="menu"`, `data-slot='content'`). */
  content?: string;
  /** Every `<DropdownMenuItem>` (`data-slot='menu-item'`) — plain and `danger`. */
  item?: string;
  /** Every `<DropdownMenuCheckboxItem>` (`data-slot='menu-checkbox-item'`). */
  checkboxItem?: string;
  /** Every `<DropdownMenuRadioItem>` (`data-slot='menu-radio-item'`). */
  radioItem?: string;
  /** Group wrappers: `<DropdownMenuGroup>` and `<DropdownMenuRadioGroup>`
   *  (`data-slot='group'`). */
  group?: string;
  /** Every `<DropdownMenuSeparator>` (`data-slot='separator'`). */
  separator?: string;
  /** Every `<DropdownMenuSub>` wrapper (`data-slot='menu-sub'`). */
  sub?: string;
  /** Every `<DropdownMenuSubTrigger>` (`data-slot='menu-sub-trigger'`). */
  subTrigger?: string;
  /** Every `<DropdownMenuSubContent>` panel (`role="menu"`). */
  subContent?: string;
};

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
  focusRequestRef: { current: 'first' | 'last' | null };
  /** Floating-panel behavior shared by the trigger and content. */
  floating: FloatingBehavior;
  /** Slot classes declared on the root `<DropdownMenu>`; parts append
   *  them after their own classes, before per-part `className`. */
  classNames: DropdownMenuClassNames | undefined;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(
  undefined
);

export const DropdownMenuProvider = DropdownMenuContext.Provider;

export function useDropdownMenuContext() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx)
    throw new Error(
      'DropdownMenu components must be used within <DropdownMenu>'
    );
  return ctx;
}
