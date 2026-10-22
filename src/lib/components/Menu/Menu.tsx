import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { MenuDataItem } from '../../utils/menuItems';
import type { MenuClassNames } from './MenuContext';

import { css } from '@linaria/core';
import { useCallback, useRef } from 'react';
import { useControl } from 'react-use-control';

import { FloatingPanel, useFloating } from '../../utils/floating';
import { useFocusScope } from '../../utils/focus-scope';
import { useMenuKeyboard, useRovingTabindex } from '../../utils/menuKeyboard';
import { renderMenuDataItems } from '../../utils/menuItems';

import MenuCheckboxItem from './MenuCheckboxItem';
import MenuDivider from './MenuDivider';
import MenuGroup from './MenuGroup';
import MenuItem from './MenuItem';
import MenuRadioGroup from './MenuRadioGroup';
import MenuRadioItem from './MenuRadioItem';
import MenuSub from './MenuSub';
import MenuSubContent from './MenuSubContent';
import MenuSubTrigger from './MenuSubTrigger';

import { MenuClassNamesProvider } from './MenuContext';

type MenuProps = {
  open?: ControlOrValue<boolean>;
  trigger?: ReactNode;
  /**
   * Data-driven alternative to composed children: plain items,
   * checkboxes, radio groups, labeled groups, dividers and nested
   * submenus, rendered through the same components the compound API
   * uses. When passed, it replaces the panel's children.
   */
  items?: MenuDataItem[];
  /**
   * Semantic slot classes (AntD v6 `classNames` shape): declared once
   * here and distributed to every family part through context (see
   * {@link MenuClassNames}). Slot classes are appended at the end of
   * each part's class list; per-part `className` props still land after
   * the slot class. Not passing it renders identical output.
   */
  classNames?: MenuClassNames;
  className?: string;
  children?: ReactNode;
  /**
   * Forwarded to the family's root wrapper `<div>`
   * (`data-slot='menu'`) — the container holding both the trigger area
   * and the floating panel. The panel itself is a native popover with
   * its own DOM; reach it through `classNames.panel` styling or panel
   * queries (`role="menu"`), not this ref.
   */
  ref?: Ref<HTMLDivElement>;
};

const container = css`
  position: relative;
  display: inline-flex;
`;

const panel = css`
  /* min-width pairs with padding + border: border-box keeps the floor
   * covering the padding too (panel-family box-sizing contract). */
  box-sizing: border-box;
  min-width: 160px;
  padding: var(--haze-space-1) 0;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);

  /* Forced-colors: the UA keeps the author border visible by forcing
     its color to CanvasText — restated so the panel stays separated
     from the Canvas behind it deterministically. */
  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

/** The family record the data-driven `items` renderer composes from. */
const menuFamily = {
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  Divider: MenuDivider,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
};

/** Joins the panel's own `className` prop with the `classNames.panel`
 * slot — the slot class lands after it, both after the visual skin. */
function panelClassName(className: string | undefined, slot: string | undefined) {
  if (className === undefined) return slot;
  if (slot === undefined) return className;
  return `${className} ${slot}`;
}

export default function Menu({
  open: openControl,
  trigger,
  items,
  classNames,
  className,
  children,
  ref,
}: MenuProps) {
  const [open, setOpen] = useControl(openControl, false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const floating = useFloating({ open, setOpen, triggerRef, panelRef, animated: true });

  useRovingTabindex({ menuRef: panelRef, active: open });
  const handleKeyDown = useMenuKeyboard({
    menuRef: panelRef,
    onClose: () => setOpen(false),
  });

  // Declared after useFloating and useRovingTabindex: the showPopover
  // effect (a native popover is display:none until shown — focusing it
  // would be silently dropped in Chromium) and the roving sync (the
  // first item must be the tab stop before autoFocus runs) both fire
  // first in the same commit. returnFocus repairs the Escape gap: the
  // hidden panel would otherwise leave focus on <body>.
  const setScope = useFocusScope({ enabled: open, autoFocus: true, returnFocus: true });

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      setScope(node);
    },
    [panelRef, setScope]
  );

  return (
    <MenuClassNamesProvider value={classNames}>
      <div ref={ref} data-slot='menu' x-class={[container, classNames?.root]}>
        <span
          ref={triggerRef}
          data-slot='trigger'
          style={floating.triggerStyle}
          className={classNames?.trigger}
          onPointerDown={floating.onTriggerPointerDown}
          onClick={floating.onTriggerClick}
        >
          {trigger}
        </span>
        <FloatingPanel
          ref={setPanelRef}
          behavior={floating}
          placement="bottom"
          role="menu"
          visualClass={panel}
          className={panelClassName(className, classNames?.panel)}
          onKeyDown={handleKeyDown}
        >
          {items !== undefined ? renderMenuDataItems(items, menuFamily) : children}
        </FloatingPanel>
      </div>
    </MenuClassNamesProvider>
  );
}

export type { MenuProps };
export type { MenuDataItem };
