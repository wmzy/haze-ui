import { createContext, useContext } from 'react';

/**
 * Semantic slot classes (AntD v6 `classNames` shape) for the Menu
 * family: declared once on `<Menu>` and distributed to every part
 * through context — one record themes the trigger, the panel and every
 * item kind while the sub-components stay prop-light. Consumer classes
 * are appended at the end of each part's class list (able to override
 * component defaults); per-part `className` props remain for one-off
 * tweaks and still land after the slot class.
 */
export type MenuClassNames = {
  /** The wrapper `<div>` (`data-slot='menu'`) `<Menu>` renders. */
  root?: string;
  /** The trigger area `<span>` (`data-slot='trigger'`). */
  trigger?: string;
  /** The floating panel (`role="menu"`, `data-slot='content'`). */
  panel?: string;
  /** Every `<MenuItem>` (`data-slot='menu-item'`) — plain and `danger`. */
  item?: string;
  /** Every `<MenuCheckboxItem>` (`data-slot='menu-checkbox-item'`). */
  checkboxItem?: string;
  /** Every `<MenuRadioItem>` (`data-slot='menu-radio-item'`). */
  radioItem?: string;
  /** Group wrappers: `<MenuGroup>` and `<MenuRadioGroup>`
   *  (`data-slot='group'`). */
  group?: string;
  /** Every `<MenuDivider>` (`data-slot='separator'`). */
  divider?: string;
  /** Every `<MenuSub>` wrapper (`data-slot='menu-sub'`). */
  sub?: string;
  /** Every `<MenuSubTrigger>` (`data-slot='menu-sub-trigger'`). */
  subTrigger?: string;
  /** Every `<MenuSubContent>` panel (`role="menu"`). */
  subContent?: string;
};

const MenuClassNamesContext = createContext<MenuClassNames | undefined>(
  undefined
);

export const MenuClassNamesProvider = MenuClassNamesContext.Provider;

/** The slot record declared on the nearest `<Menu>`; `undefined`
 *  outside one. Decorative only — never throws, so items rendered in
 *  any other host keep working. */
export function useMenuClassNames() {
  return useContext(MenuClassNamesContext);
}
