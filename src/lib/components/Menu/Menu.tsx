import type { KeyboardEvent as ReactKeyboardEvent, ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { MenuDataItem } from '../../utils/menuItems';
import type { VirtualListHandle } from '../VirtualList';
import type { MenuClassNames } from './MenuContext';

import { css } from '@linaria/core';
import { isValidElement, useCallback, useEffect, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { FloatingPanel, useFloating } from '../../utils/floating';
import { useFocusScope } from '../../utils/focus-scope';
import { useMenuKeyboard, useRovingTabindex } from '../../utils/menuKeyboard';
import { renderMenuDataItems } from '../../utils/menuItems';
import { menuPanelLg } from '../../utils/menu-skins';
import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';
import { VirtualList } from '../VirtualList';

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
   * Opt-in: render the data-driven `items` list through VirtualList so
   * thousand-entry menus mount only the visible window (plus overscan)
   * instead of the full DOM list. `false`/omitted keeps the plain DOM
   * path byte-for-byte. The keyboard model follows the data — arrows,
   * Home/End and typeahead reach rows outside the window by scrolling
   * them in (`scrollToIndex`) and focusing them after the commit.
   *
   * Scope (correctness first — fixed-height rows only):
   * - requires the `items` data API; composed `children` cannot be
   *   windowed and render through the plain path (dev-only error);
   * - `group` entries keep their plain path too — group/radio-group
   *   semantics need the DOM wrapper a windowed row cannot provide
   *   (dev-only error);
   * - every remaining entry is a fixed-height row (`item`, `checkbox`,
   *   `divider`, `sub`); variable-height content is not supported.
   *   Submenus render as single rows whose panels are plain DOM, so
   *   nested levels keep full keyboard/typeahead behavior.
   */
  virtualized?: boolean;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape): declared once
   * here and distributed to every family part through context (see
   * {@link MenuClassNames}). Slot classes are appended at the end of
   * each part's class list; per-part `className` props still land after
   * the slot class. Not passing it renders identical output. A
   * ConfigProvider `Menu.classNames` section merges under the prop,
   * per key.
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

/* Fixed row height of the virtualized path: the natural item box —
   space-2 padding block (8+8) plus the text-sm line box at
   leading-normal (14 × 1.5 = 21). Rows are stretched to fill it
   (`virtualizedBody`), so item and row heights cannot drift apart. */
const VIRTUAL_ROW_HEIGHT = 37;

/* Scrollport height of the virtualized list: eight rows (8 × 37).
   Shorter lists size to their rows through Math.min at the call site
   (Select's listbox precedent). */
const VIRTUAL_MAX_HEIGHT = 296;

/** Typeahead buffer lifetime — the same 500ms window the plain
 *  keyboard layer (utils/menuKeyboard) uses. */
const TYPEAHEAD_WINDOW_MS = 500;

/**
 * Virtualized list chrome: every item kind is stretched over its
 * absolutely-positioned, fixed-height row wrapper so hover/focus cover
 * the full row (Select's virtualRow precedent). border-box keeps the
 * stretched height inclusive of the item's own padding (buttons default
 * to content-box). The sub trigger stretches inside its wrapper — the
 * submenu panel itself is out of flow (native popover / fixed), so it
 * never contributes row height.
 */
const virtualizedBody = css`
  & [data-index] > :where(
      [data-slot='menu-item'],
      [data-slot='menu-checkbox-item'],
      [data-slot='menu-radio-item'],
      [data-slot='menu-sub']
    ) {
    height: 100%;
    box-sizing: border-box;
  }

  & [data-index] > [data-slot='menu-sub'] > [data-slot='menu-sub-trigger'] {
    height: 100%;
    box-sizing: border-box;
  }
`;

/** Typeahead text of a data entry: its label flattened to a string.
 *  Rows outside the virtual window have no DOM to read textContent
 *  from, so the match runs against the data model. */
function menuEntryText(entry: MenuDataItem): string {
  return entry.type === 'divider' ? '' : reactNodeText(entry.label);
}

/** Flatten a ReactNode to its text content (strings/numbers joined
 *  across children trees; non-text nodes contribute nothing). */
function reactNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(reactNodeText).join('');
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return reactNodeText(node.props.children);
  }
  return '';
}

/** Rows that can take focus: everything but dividers and disabled
 *  entries (mirrors the `[role^="menuitem"]:not([disabled])` DOM
 *  selector the plain keyboard layer uses). `group` entries never
 *  reach the virtualized path but are excluded for totality. */
function isFocusableEntry(entry: MenuDataItem): boolean {
  return (
    entry.type !== 'divider' &&
    entry.type !== 'group' &&
    entry.disabled !== true
  );
}

/** One virtualized row: the entry rendered through the same
 *  data-driven mapper the plain path uses (single-entry array; React
 *  keys come from the VirtualList row wrappers). */
function renderVirtualRow(entry: MenuDataItem) {
  return renderMenuDataItems([entry], menuFamily);
}

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
  virtualized,
  classNames,
  className,
  children,
  ref,
}: MenuProps) {
  const [open, setOpen] = useControl(openControl, false);
  // ConfigProvider `Menu.classNames` merges under the prop, per key —
  // an explicit slot on the component wins over the provider's.
  const config = useConfigDefaults('Menu');
  const resolvedClassNames = config.classNames
    ? { ...config.classNames, ...classNames }
    : classNames;
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const floating = useFloating({ open, setOpen, triggerRef, panelRef, animated: true });

  useRovingTabindex({ menuRef: panelRef, active: open });
  const handleKeyDown = useMenuKeyboard({
    menuRef: panelRef,
    onClose: () => setOpen(false),
  });

  // --- virtualization ------------------------------------------------------
  // `virtualized` requires the data API and fixed-height rows; `group`
  // entries (and a missing `items`) keep the plain DOM path — the
  // group/radio-group semantics need their DOM wrapper, and composed
  // children cannot be windowed at all.
  const hasGroups = items?.some((entry) => entry.type === 'group') ?? false;
  const virtual = virtualized === true && items !== undefined && !hasGroups;

  useEffect(() => {
    if (!virtualized) return;
    if (items === undefined) {
      console.error(
        'Menu: `virtualized` requires the data-driven `items` API; composed children render through the plain DOM path.'
      );
      return;
    }
    if (hasGroups) {
      console.error(
        'Menu: `virtualized` does not support `group` entries — group/radio-group semantics need their DOM wrapper. The menu renders through the plain DOM path.'
      );
    }
  }, [virtualized, items, hasGroups]);

  const listRef = useRef<VirtualListHandle>(null);
  // Row the next commit must focus. Keyboard focus moves resolve here:
  // the target row may live outside the mounted window, so scrollToIndex
  // shifts the window first and this effect focuses the row once it is
  // mounted — the window shift and this request land in the same commit
  // (VirtualList syncs its internal offset synchronously inside
  // scrollToIndex). `attempt` bumps on every request so a repeated
  // index still re-runs the effect (Tree's pendingFocusKey pattern).
  const focusAttemptRef = useRef(0);
  const [pendingFocus, setPendingFocus] = useState<{
    index: number;
    attempt: number;
  } | null>(null);

  useEffect(() => {
    if (pendingFocus === null) return;
    const panel = panelRef.current;
    if (!panel) return;
    const row = panel.querySelector<HTMLElement>(
      `[data-index="${pendingFocus.index}"]`
    );
    const item = row?.querySelector<HTMLElement>(
      '[role^="menuitem"]:not([disabled])'
    );
    // Not mounted (the scroll could not move yet): retried on the next
    // focus request — each request carries a fresh `attempt`.
    if (!item) return;
    item.focus();
    setPendingFocus(null);
  }, [pendingFocus]);

  /** Scroll the row into the window and focus it after the commit. */
  function focusVirtualRow(index: number) {
    listRef.current?.scrollToIndex(index, 'auto');
    focusAttemptRef.current += 1;
    setPendingFocus({ index, attempt: focusAttemptRef.current });
  }

  // Typeahead buffer of the virtualized level (the plain layer keeps its
  // own inside utils/menuKeyboard).
  const typedRef = useRef('');
  const resetTimerRef = useRef(0);
  useEffect(() => () => window.clearTimeout(resetTimerRef.current), []);

  /**
   * Keyboard for the virtualized panel: the plain useMenuKeyboard walks
   * the DOM item list, but windowing keeps only a slice mounted —
   * ArrowDown from the window's edge would wrap instead of stepping
   * into the unmounted rows. This handler walks the data model: it
   * scrolls the target row into the window and focuses it after the
   * commit (focusVirtualRow). Keymap otherwise matches the plain layer:
   * wrapping arrows, Home/End, Escape/Tab close, typeahead.
   */
  function handleVirtualKeyDown(event: ReactKeyboardEvent) {
    const panel = panelRef.current;
    const rows = items;
    if (!panel || rows === undefined || rows.length === 0) return;
    // Level scoping: keydowns from inside a nested submenu never reach
    // here in practice (its contentKeyDown stops everything but Tab);
    // the guard keeps direct dispatches honest. Tab falls through to
    // the close below — it must close the whole stack.
    const target = event.target;
    if (
      event.key !== 'Tab' &&
      target instanceof Element &&
      target.closest('[role="menu"]') !== panel
    ) {
      return;
    }

    // Current row index from the DOM: the focused item's VirtualList
    // row wrapper carries data-index. -1 when focus sits elsewhere (the
    // panel itself) — the arrows then enter from the matching end.
    const active = document.activeElement;
    const rowEl =
      active instanceof HTMLElement
        ? active.closest<HTMLElement>('[data-index]')
        : null;
    const current =
      rowEl && panel.contains(rowEl) ? Number(rowEl.dataset.index) : -1;

    /** Next focusable row from `from` stepping by `step`, wrapping. */
    const advance = (from: number, step: 1 | -1): number => {
      for (let k = 1; k <= rows.length; k++) {
        const index =
          (((from + step * k) % rows.length) + rows.length) % rows.length;
        const row = rows[index];
        if (row !== undefined && isFocusableEntry(row)) return index;
      }
      return from;
    };
    const firstFocusable = rows.findIndex(isFocusableEntry);
    let lastFocusable = -1;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (isFocusableEntry(rows[i]!)) {
        lastFocusable = i;
        break;
      }
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (current < 0) {
          if (firstFocusable >= 0) focusVirtualRow(firstFocusable);
        } else {
          focusVirtualRow(advance(current, 1));
        }
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (current < 0) {
          if (lastFocusable >= 0) focusVirtualRow(lastFocusable);
        } else {
          focusVirtualRow(advance(current, -1));
        }
        return;
      case 'Home':
        event.preventDefault();
        if (firstFocusable >= 0) focusVirtualRow(firstFocusable);
        return;
      case 'End':
        event.preventDefault();
        if (lastFocusable >= 0) focusVirtualRow(lastFocusable);
        return;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        return;
      case 'Tab':
        // Close and hand focus to the trigger (the scope returns it);
        // a following Tab continues past the trigger.
        event.preventDefault();
        setOpen(false);
        return;
      default: {
        if (
          event.key.length !== 1 ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        ) {
          return;
        }
        // Space on a checkbox item must reach the native button
        // activation — the same carve-out as the plain keyboard layer.
        if (
          event.key === ' ' &&
          target instanceof Element &&
          (target.getAttribute('role') === 'menuitemcheckbox' ||
            target.getAttribute('role') === 'menuitemradio')
        ) {
          return;
        }
        event.preventDefault();
        const typed = (typedRef.current + event.key).toLowerCase();
        typedRef.current = typed;
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = window.setTimeout(() => {
          typedRef.current = '';
        }, TYPEAHEAD_WINDOW_MS);
        // Search forward from the current row, wrapping; the current
        // row itself is the last candidate so repeating a character
        // cycles between rows starting with it.
        const start = current < 0 ? 0 : current + 1;
        for (let k = 0; k < rows.length; k++) {
          const index =
            (((start + k) % rows.length) + rows.length) % rows.length;
          const row = rows[index];
          if (row === undefined || !isFocusableEntry(row)) continue;
          if (menuEntryText(row).toLowerCase().startsWith(typed)) {
            focusVirtualRow(index);
            return;
          }
        }
      }
    }
  }

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
    <MenuClassNamesProvider value={resolvedClassNames}>
      <div ref={ref} data-slot='menu' x-class={[container, resolvedClassNames?.root]}>
        <span
          ref={triggerRef}
          data-slot='trigger'
          style={floating.triggerStyle}
          className={resolvedClassNames?.trigger}
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
          visualClass={menuPanelLg}
          className={panelClassName(className, resolvedClassNames?.panel)}
          onKeyDown={virtual ? handleVirtualKeyDown : handleKeyDown}
        >
          {/* `virtual` truthy narrows `items` to defined via TS's
              aliased-condition analysis (it embeds `items !== undefined`) */}
          {virtual ? (
            <VirtualList
              ref={listRef}
              data-virtualized
              items={items}
              height={Math.min(VIRTUAL_MAX_HEIGHT, items.length * VIRTUAL_ROW_HEIGHT)}
              itemHeight={VIRTUAL_ROW_HEIGHT}
              renderItem={renderVirtualRow}
              className={virtualizedBody}
            />
          ) : items !== undefined ? (
            renderMenuDataItems(items, menuFamily)
          ) : (
            children
          )}
        </FloatingPanel>
      </div>
    </MenuClassNamesProvider>
  );
}

export type { MenuProps };
export type { MenuDataItem };
