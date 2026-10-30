import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { CollisionPadding } from '../../utils/collision';
import type { MenuDataItem } from '../../utils/menuItems';
import type { DropdownMenuClassNames } from './DropdownMenuContext';

import { useId, useMemo, useRef } from 'react';
import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { toCollisionStrategy } from '../../utils/collision';
import {
  useFloating,
  useFloatingHandle,
  useOpenWithChange,
} from '../../utils/floating';
import { renderMenuDataItems } from '../../utils/menuItems';

import DropdownMenuCheckboxItem from './DropdownMenuCheckboxItem';
import DropdownMenuContent from './DropdownMenuContent';
import DropdownMenuGroup from './DropdownMenuGroup';
import DropdownMenuItem from './DropdownMenuItem';
import DropdownMenuRadioGroup from './DropdownMenuRadioGroup';
import DropdownMenuRadioItem from './DropdownMenuRadioItem';
import DropdownMenuSeparator from './DropdownMenuSeparator';
import DropdownMenuSub from './DropdownMenuSub';
import DropdownMenuSubContent from './DropdownMenuSubContent';
import DropdownMenuSubTrigger from './DropdownMenuSubTrigger';
import DropdownMenuTrigger from './DropdownMenuTrigger';

import { DropdownMenuProvider } from './DropdownMenuContext';

/**
 * Imperative handle exposed through the React 19 `ref` prop (same API
 * choice as VirtualList). `open`/`close` run through the same
 * `handleSetOpen` the trigger and items use — `onOpenChange` fires, and
 * the floating engine's popover visibility, animated exit and
 * toggle-echo reconciliation stay in charge; the handle never calls
 * `showPopover`/`hidePopover` directly.
 */
type DropdownMenuHandle = {
  /** Show the menu, as if the trigger toggled it open (`onOpenChange(true)`). */
  open: () => void;
  /**
   * Close the menu through the animated exit path
   * (`onOpenChange(false)`).
   */
  close: () => void;
  /** Focus the trigger element. */
  focusTrigger: () => void;
};

type DropdownMenuProps = {
  open?: ControlOrValue<boolean>;
  onOpenChange?: (open: boolean) => void;
  /**
   * Viewport inset the panel treats as collision space: a number applies
   * to all four edges, an object per edge.
   */
  collisionPadding?: CollisionPadding;
  /**
   * Data-driven alternative to composed children: plain items,
   * checkboxes, radio groups, labeled groups, dividers and nested
   * submenus, rendered through the same components the compound API
   * uses. When passed, it replaces the children with a default `⋯`
   * trigger plus the content built from the data.
   */
  items?: MenuDataItem[];
  /**
   * Semantic slot classes (AntD v6 `classNames` shape): declared once
   * here and distributed to every family part through context (see
   * {@link DropdownMenuClassNames}). Slot classes are appended at the
   * end of each part's class list; per-part `className` props still
   * land after the slot class. Not passing it renders identical output.
   */
  classNames?: DropdownMenuClassNames;
  children?: ReactNode;
  className?: string;
  /** Imperative handle (`open`/`close`/`focusTrigger`) — the family
   *  keeps its React 19 command-object ref; the root wrapper `<div>`
   *  is reached through `classNames.root` styling or wrapper queries,
   *  not a second DOM ref. */
  ref?: Ref<DropdownMenuHandle>;
};

const wrapper = css`
  position: relative;
  display: inline-block;
`;

/** The family record the data-driven `items` renderer composes from. */
const dropdownMenuFamily = {
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Group: DropdownMenuGroup,
  Divider: DropdownMenuSeparator,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
};

export default function DropdownMenu({
  open: openControl,
  onOpenChange,
  collisionPadding,
  items,
  classNames,
  children,
  className,
  ref,
}: DropdownMenuProps) {
  const [open, setOpen] = useControl(openControl, false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  const focusRequestRef = useRef<'first' | 'last' | null>(null);

  const handleSetOpen = useOpenWithChange(open, setOpen, onOpenChange);

  // Imperative surface: `ref.current?.open()/close()/focusTrigger()` —
  // routes through handleSetOpen so onOpenChange fires on imperative
  // toggles, same as the trigger and items.
  useFloatingHandle({ ref, setOpen: handleSetOpen, triggerRef });

  // Stable identity: useFloatingPosition re-runs its effect on every
  // change of this object.
  const collision = useMemo(
    () => toCollisionStrategy(collisionPadding),
    [collisionPadding]
  );

  const floating = useFloating({
    open,
    setOpen: handleSetOpen,
    triggerRef,
    panelRef: contentRef,
    animated: true,
    collision,
  });

  return (
    <DropdownMenuProvider
      value={{
        open,
        setOpen: handleSetOpen,
        triggerRef,
        contentRef,
        contentId,
        focusRequestRef,
        floating,
        classNames,
      }}
    >
      <div
        data-slot='dropdown-menu'
        x-class={[wrapper, classNames?.root, className]}
      >
        {items !== undefined ? (
          <>
            <DropdownMenuTrigger>⋯</DropdownMenuTrigger>
            <DropdownMenuContent>
              {renderMenuDataItems(items, dropdownMenuFamily)}
            </DropdownMenuContent>
          </>
        ) : (
          children
        )}
      </div>
    </DropdownMenuProvider>
  );
}

export type { DropdownMenuProps, DropdownMenuHandle };
export type { MenuDataItem as DropdownMenuDataItem };
