import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  Ref,
} from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { VirtualListHandle } from '../VirtualList';

import { css } from '@linaria/core';
import { Fragment, useCallback, useEffect, useId, useRef, useState } from 'react';
import { isControl, useControl, useThru, watch } from 'react-use-control';

import { FloatingPanel, useFloating } from '../../utils/floating';
import { getDirection, inlineAxisKeys } from '../../utils/direction';
import { useFocusScope } from '../../utils/focus-scope';
import { menuOptionStates } from '../../utils/menu-skins';
import { panelSurfaceBare, popoverPanelHidden } from '../../utils/panel-skin';
import {
  ChevronRight,
  PickerTrigger,
  pickerArrowOpen,
  pickerCaret,
  pickerEmptyBlock,
  pickerLoadingBlock,
  pickerOptionSelected,
  pickerSearchInput,
  pickerVirtualRow,
} from '../../utils/picker-trigger';
import { mergeRefs } from '../../utils/refs';
import { truncate } from '../../utils/truncate';
import { usePanelQuery } from '../../utils/use-panel-query';
import { usePendingFocus } from '../../utils/use-pending-focus';
import { useSearchReport } from '../../utils/use-search-report';
import { useStrings } from '../LocaleProvider';
import Spinner from '../Spinner/Spinner';
import { VirtualList } from '../VirtualList';

export type CascaderOption = {
  label: ReactNode;
  value: string;
  children?: CascaderOption[];
};

/** Metrics override for the `virtualized` columns of Cascader. */
type CascaderVirtualizedConfig = {
  /**
   * Row height in px of one column item. Defaults to 37 — the natural
   * box of a column item: space-2 padding top+bottom + text-sm at
   * leading-normal = 8 + 21 + 8. Virtualization math needs it as a JS
   * number; items are stretched to fill it (`pickerVirtualRow`,
   * utils/picker-trigger), so the two cannot drift apart.
   */
  itemHeight?: number;
  /** Extra rows kept mounted above/below the visible window. Defaults
   * to VirtualList's 5. */
  overscan?: number;
};

/**
 * Semantic slot classes (AntD v6 `classNames` shape): keys mirror the
 * data-slot each part carries (`today-button`-style kebab slots surface
 * as camelCase keys). Consumer classes are appended at the end of each
 * part's class list (able to override component defaults); slots not
 * rendered by the current mode (search input, loading/empty blocks,
 * virtualized columns) are ignored.
 */
type CascaderClassNames = {
  /** The root wrapper `<div>` (no data-slot — the family's root). */
  root?: string;
  /** The trigger `<button>` (`data-slot='trigger'`). */
  trigger?: string;
  /** The path-label row inside the trigger (`data-slot='value'`). */
  value?: string;
  /** Placeholder text while no value is committed (`data-slot='placeholder'`). */
  placeholder?: string;
  /** Path separators between levels (`data-slot='separator'`), and the
   * option chevrons / trigger caret (`data-slot='icon'`). */
  separator?: string;
  /** The trigger caret and option chevrons (`data-slot='icon'`). */
  icon?: string;
  /** The floating drill-down panel (`data-slot='content'`). */
  content?: string;
  /** Search input of the remote-search panel (`data-slot='input'`). */
  input?: string;
  /** Columns host of the searchable panel (`data-slot='columns'`). */
  columns?: string;
  /** One drill-down column (`data-slot='column'`). */
  column?: string;
  /** One option row button (`data-slot='option'`). */
  option?: string;
  /** An option's label span (`data-slot='label'`). */
  label?: string;
  /** Loading state block (`data-slot='loading'`). */
  loading?: string;
  /** No-match block of the searchable panel (`data-slot='empty'`). */
  empty?: string;
};

type CascaderProps = {
  /** Full option tree; each level becomes one column in the drill-down panel. */
  options: CascaderOption[];
  /** Selected path as an array of option values, one per level. */
  value?: ControlOrValue<string[]>;
  /** Fired with the committed path whenever a selection is made. */
  onChange?: (value: string[]) => void;
  placeholder?: string;
  /**
   * `false` (default): only leaf options commit a value. `true`: every level
   * commits its partial path the moment it is chosen (Ant Design semantics).
   */
  changeOnSelect?: boolean;
  /** Whether hovering a parent option expands its column; defaults to click. */
  expandTrigger?: 'click' | 'hover';
  /**
   * Remote search: when set, the panel opens with a search input on top
   * of the columns and all local option logic defers to the consumer —
   * typing fires this callback with the raw query (empty queries
   * included, and the reset back to `''` when the panel closes, so the
   * consumer can restore the full tree), and the panel simply renders
   * whatever `options` the consumer rebuilds in response. Selecting
   * from a rebuilt tree commits the path that tree defines. Pair with
   * `loading` for the pending state; debouncing is the consumer's
   * concern.
   */
  onSearch?: (query: string) => void;
  /**
   * Async option state: the panel's column area shows a Spinner with
   * `aria-busy="true"` on the panel instead of the (stale) columns
   * until it clears. Works with or without `onSearch` (lazy root-tree
   * loads included).
   */
  loading?: boolean;
  /**
   * Render every column through VirtualList so wide trees mount only
   * the visible window (plus overscan) per column instead of the full
   * DOM list. `false`/omitted (default) keeps the plain DOM path
   * byte-for-byte; an object additionally customizes row metrics.
   */
  virtualized?: boolean | CascaderVirtualizedConfig;
  className?: string;
  /** Slot classes (see {@link CascaderClassNames}); each key lands on the
   * part carrying the matching data-slot, after the component defaults. */
  classNames?: CascaderClassNames;
  /**
   * Forwarded to the trigger `<button>` (not the root div) — the element
   * form bridges and `ref.current.focus()` reach.
   */
  ref?: Ref<HTMLButtonElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'className'>;

const wrapper = css`
  position: relative;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
`;

/** Trigger deltas over the shared picker base
 * (utils/picker-trigger): the wider path-row gap and the sm metrics.
 * The keyboard focus arm rides the shared base. `text-align: start`
 * re-declares the base's identical value — kept local for the
 * rtl.test logical-properties sampling contract on this file. */
const trigger = css`
  gap: var(--haze-space-2);
  font-size: var(--haze-text-sm);
  padding: var(--haze-space-2) var(--haze-space-3);
  text-align: start;
`;

/** Path label row: truncates (shared truncate, utils/truncate,
 * composed at the call site) instead of growing the trigger sideways. */
const triggerValue = css`
  flex: 1;
  min-width: 0;
  text-align: start;
`;

const triggerPlaceholder = css`
  color: var(--haze-color-text-muted);
`;

const separator = css`
  color: var(--haze-color-text-muted);
`;

/** Panel deltas over the shared bare surface (`panelSurfaceBare`,
 * utils/panel-skin): the horizontal strip of scrolling columns plus
 * the typography the columns' items inherit. The popover re-hide rule
 * lives in the shared `popoverPanelHidden` (the "author display
 * outranks the UA sheet" contract) — composed alongside at the call
 * site because this delta's `display: flex` is what re-opens the
 * closed-popover hole. */
const panel = css`
  display: flex;
  align-items: stretch;
  padding: var(--haze-space-1);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
`;

/**
 * Searchable-panel deltas (`onSearch` set) over the shared bare
 * surface: a plain block flow container — the search input
 * (`pickerSearchInput`, utils/picker-trigger) stacks above the columns
 * wrapper, which owns the horizontal strip layout (an input cannot
 * live inside `role="menu"`). No `display` declaration of its own, so
 * the UA sheet's closed-popover hiding already holds here.
 */
const panelSearch = css`
  padding: var(--haze-space-2);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
`;

/**
 * The columns host of the searchable panel: the horizontal strip the
 * plain panel's own `display: flex` provides, re-applied one level down
 * so the search input can sit above it.
 */
const columnsStrip = css`
  display: flex;
  align-items: stretch;
`;

const column = css`
  display: flex;
  flex-direction: column;
  min-width: 160px;
  max-height: 220px;
  overflow-y: auto;
  padding-block: var(--haze-space-1);

  & + & {
    border-inline-start: 1px solid var(--haze-color-border);
    margin-inline-start: var(--haze-space-1);
    padding-inline-start: var(--haze-space-1);
  }
`;

/**
 * Virtualized column: same chrome (width floor, separators, padding),
 * but no scroll box of its own — the inner VirtualList scrollport owns
 * scrolling, avoiding a nested scroll container that could grow a
 * second scrollbar (the same trade-off as the picker family's
 * `pickerListboxVirtual`).
 */
const columnVirtual = css`
  max-height: none;
  overflow-y: visible;

  & + & {
    border-inline-start: 1px solid var(--haze-color-border);
    margin-inline-start: var(--haze-space-1);
    padding-inline-start: var(--haze-space-1);
  }
`;

/** Scrollport height of a virtualized column — the plain column's
 * `max-height` cap, so both modes cap out equally tall; shorter columns
 * size to their rows (min at the call site). */
const COLUMN_MAX_HEIGHT = 220;

/** Fixed row height for the virtualized path: the natural column-item
 * box — space-2 padding top+bottom (8+8) + text-sm at leading-normal
 * (21) = 37. Items are stretched to fill it (`pickerVirtualRow`,
 * utils/picker-trigger), so the two cannot drift apart. */
const ITEM_ROW_HEIGHT = 37;

/** Column option chrome: the row skeleton and sm metrics — the
 * hover/press/focus interaction states ride `menuOptionStates`
 * (utils/menu-skins), composed ahead of this delta at the call site
 * (its state arms out-specify the unconditional `background: none`
 * button reset below). */
const item = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2) var(--haze-space-3);
  border: none;
  background: none;
  border-radius: var(--haze-radius-sm);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  text-align: start;
  cursor: pointer;
  transition: background var(--haze-duration-fast);
`;

/** Column item label — the clipping contract rides the shared truncate
 * class (utils/truncate), composed at the call site. */
const itemLabel = css`
  flex: 1;
  min-width: 0;
`;

// ---------------------------------------------------------------------------
// Panel DOM helpers. Focus follows the menu items themselves (roving focus,
// every item tabIndex=-1), so navigation resolves items by DOM query — the
// same approach as utils/menuKeyboard.
// ---------------------------------------------------------------------------

const ITEM_SELECTOR = '[role="menuitem"]';

function columnsOf(panel: HTMLElement | null): HTMLElement[] {
  return panel
    ? Array.from(panel.querySelectorAll<HTMLElement>('[data-haze-cascader-column]'))
    : [];
}

function itemsOf(column: HTMLElement | undefined): HTMLElement[] {
  return column
    ? Array.from(column.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
    : [];
}

/** Focus target requested by a keyboard drill step, applied after the
 * matching columns have rendered. */
type PendingFocus = { level: number; index: number; value?: string };

export default function Cascader({
  options,
  value: valueControl,
  onChange,
  placeholder,
  changeOnSelect = false,
  expandTrigger = 'click',
  onSearch,
  loading = false,
  virtualized,
  className,
  classNames,
  ref,
  ...rest
}: CascaderProps) {
  const strings = useStrings('cascader');
  // Search-mode copy rides the `select` locale section (search label/
  // placeholder/no-match/loading) — the cascader section has no search
  // strings of its own and the locale packs are out of scope here; a
  // dedicated `cascader.search` section can replace this read later.
  const searchStrings = useStrings('select');
  const [open, setOpen] = useControl(false, false);
  const controlled = isControl(valueControl);
  const [value, setValue] = useControl(
    useThru(
      controlled ? valueControl : undefined,
      watch((next) => onChange?.(next))
    ),
    controlled ? [] : valueControl ?? []
  );
  // Transient drill-down position (which parent option each open column
  // descends from) — internal UI state, resynced from `value` on open.
  const [activePath, setActivePath] = useState<string[]>([]);
  // Remote search mode: presence of `onSearch` swaps the panel for a
  // search input plus consumer-owned options (see the prop docs). The
  // query is internal panel UI state (never a prop), reset on close so
  // a stale remote result set never survives to the next open (the
  // shared usePanelQuery reset Select/TreeSelect use).
  const searchMode = onSearch !== undefined;
  const [query, setQuery] = usePanelQuery(open);
  // `virtualized` resolution: object config enables and customizes,
  // `true` enables with defaults, anything else keeps the plain DOM.
  const virtual = virtualized !== undefined && virtualized !== false;
  const virtualConfig = typeof virtualized === 'object' ? virtualized : undefined;
  const itemRowHeight = virtualConfig?.itemHeight ?? ITEM_ROW_HEIGHT;
  const overscan = virtualConfig?.overscan;

  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The consumer's ref rides the same trigger button the floating
  // behavior anchors on.
  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => mergeRefs(triggerRef, ref)(node),
    [triggerRef, ref]
  );
  const panelRef = useRef<HTMLDivElement>(null);
  // Keyboard-requested focus targets, applied through the shared
  // retry loop once the matching columns (or their virtualized
  // windows) have rendered — the attempt resolves the pending step
  // against the panel DOM and reports whether it landed.
  const pendingFocus = usePendingFocus((pending: PendingFocus) => {
    const items = itemsOf(columnsOf(panelRef.current)[pending.level]);
    const index =
      pending.value !== undefined
        ? items.findIndex((el) => el.dataset.value === pending.value)
        : pending.index;
    const target = index >= 0 ? items[index] : items[0];
    if (!target) return false;
    target.focus();
    return true;
  });
  // Search input of the remote-search panel (search mode only).
  const searchRef = useRef<HTMLInputElement>(null);
  // VirtualList handles per column level (virtualized mode only) —
  // keyboard focus steps scroll the target row into the window before
  // focusing it.
  const listRefs = useRef(new Map<number, VirtualListHandle>());
  const focusedOpenRef = useRef(false);

  const floating = useFloating({
    open,
    setOpen,
    triggerRef,
    panelRef,
    animated: true,
  });

  // Focus scope: no auto focus (the initial item is focused below, gated on
  // `shown`) — its job is returning focus to the trigger when the panel
  // closes while an item holds it.
  const setScope = useFocusScope({
    enabled: open,
    autoFocus: false,
    returnFocus: true,
  });

  // Opening the panel resets the drill position to the committed path.
  const prevOpenRef = useRef(false);
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = open;
    if (justOpened) setActivePath(value);
  }, [open, value]);

  // Panel focus: one-shot initial focus when the panel opens (deepest
  // selected item when a value exists, else the first option) — the
  // keyboard-requested moves ride the pendingFocus retry loop above.
  // Gated on `shown` — on the native path the popover is display:none
  // until showPopover() runs, and focus on a hidden element is silently
  // dropped. Depends on `activePath` because opening resyncs activePath
  // from `value` in a separate (earlier) effect: on the just-opened
  // commit the deeper columns are not rendered yet, so the
  // deepest-selected target is absent and the effect must retry on the
  // next commit instead of falling back to the first option.
  useEffect(() => {
    if (!open) {
      focusedOpenRef.current = false;
      pendingFocus.clear();
      return;
    }
    if (!floating.shown) return;
    if (focusedOpenRef.current) return;
    const panel = panelRef.current;
    if (!panel) return;
    // Search mode: initial focus lands in the panel's search input, so
    // typing a query works straight away — arrow keys then roam into
    // the columns below through the bubbled panel keydown handler.
    if (searchMode) {
      focusedOpenRef.current = true;
      searchRef.current?.focus();
      return;
    }
    const items = Array.from(panel.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
    const level = value.length - 1;
    const last = value[level];
    let target: HTMLElement | undefined;
    if (last !== undefined) {
      // Virtualized columns only mount the visible window: scroll the
      // deepest selected row into it first, then let the pending focus
      // land on the re-rendered window (the scroll state update and the
      // queued request commit together; the retry loop re-applies until
      // the window mounts the target). Only once the target column has
      // rendered — earlier runs fall through to the DOM miss below and
      // retry on the next commit, before focusedOpenRef latches.
      if (virtual && listRefs.current.has(level)) {
        let levelOptions = options;
        for (let i = 0; i < level; i++) {
          levelOptions =
            levelOptions.find((o) => o.value === value[i])?.children ?? [];
        }
        const index = levelOptions.findIndex((o) => o.value === last);
        if (index >= 0) {
          listRefs.current.get(level)?.scrollToIndex(index, 'auto');
          focusedOpenRef.current = true;
          pendingFocus.request({ level, index, value: last });
          return;
        }
      }
      // Wait for the committed path's columns to render before focusing;
      // the fallback only applies when there is no value at all.
      target = items.find(
        (el) => el.dataset.level === String(level) && el.dataset.value === last
      );
      if (!target) return;
    } else {
      target = items.find((el) => el.dataset.level === '0');
    }
    if (!target) return;
    focusedOpenRef.current = true;
    target.focus();
  }, [open, floating.shown, activePath, value, virtual, options, searchMode, pendingFocus]);

  useSearchReport(onSearch, query);

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      setScope(node);
    },
    [panelRef, setScope]
  );

  // Per-level VirtualList handle registration (virtualized mode).
  const setListRef = useCallback((level: number) => {
    return (handle: VirtualListHandle | null) => {
      if (handle) listRefs.current.set(level, handle);
      else listRefs.current.delete(level);
    };
  }, []);

  // Visible columns: the root options plus the children of every active
  // path segment, one column per level.
  const columns: CascaderOption[][] = [options];
  for (const segment of activePath) {
    const children = columns
      .at(-1)!
      .find((option) => option.value === segment)?.children;
    if (!children?.length) break;
    columns.push(children);
  }

  // Move column focus to `index` (a data index, valid across the whole
  // column). Plain columns focus the mounted item directly; virtualized
  // columns scroll the row into the window first and route through
  // pendingFocus, whose retry loop applies the request once the
  // re-rendered window has mounted the target (scrollToIndex's internal
  // state update batches with the queued request, so one commit carries
  // both).
  const focusColumnItem = (level: number, index: number) => {
    const option = columns[level]?.[index];
    if (!option) return;
    if (virtual) {
      listRefs.current.get(level)?.scrollToIndex(index, 'auto');
      pendingFocus.request({ level, index, value: option.value });
      return;
    }
    const items = itemsOf(columnsOf(panelRef.current)[level]);
    items[index]?.focus();
  };

  // Options along the committed value path, for the trigger label.
  const selectedPath: CascaderOption[] = [];
  let seek = options;
  for (const segment of value) {
    const found = seek.find((option) => option.value === segment);
    if (!found) break;
    selectedPath.push(found);
    seek = found.children ?? [];
  }

  const activate = (option: CascaderOption, level: number) => {
    const path = [...activePath.slice(0, level), option.value];
    if (option.children?.length) {
      setActivePath(path);
      if (changeOnSelect) setValue(path);
    } else {
      setValue(path);
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleItemEnter = (option: CascaderOption, level: number) => {
    if (expandTrigger !== 'hover') return;
    setActivePath([...activePath.slice(0, level), option.value]);
  };

  const handleTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    pickerArrowOpen(open, setOpen, e);
  };

  const handlePanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const panel = panelRef.current;
    if (!panel) return;
    const active =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const itemEl = active?.closest<HTMLElement>(ITEM_SELECTOR) ?? undefined;
    const level = itemEl ? Number(itemEl.dataset.level) : 0;

    // Drill/back arrows mirror under RTL (← drills into the submenu that
    // opens on the physical left) — direction read from the panel's DOM
    // subtree at event time (`inlineAxisKeys`, the same contract as
    // TabList's overflow menu).
    const { next: drillKey, prev: backKey } = inlineAxisKeys(
      'horizontal',
      getDirection(panel)
    );

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        // Resolve against the column data, not the mounted DOM: under
        // virtualization only a window of the column is mounted, so DOM
        // indexes would misalign past the window edge.
        const levelOptions = columns[level] ?? [];
        if (levelOptions.length === 0) return;
        const current = itemEl
          ? levelOptions.findIndex((o) => o.value === itemEl.dataset.value)
          : -1;
        const next =
          current < 0
            ? e.key === 'ArrowDown'
              ? 0
              : levelOptions.length - 1
            : (current + (e.key === 'ArrowDown' ? 1 : -1) + levelOptions.length) %
              levelOptions.length;
        focusColumnItem(level, next);
        return;
      }
      case drillKey: {
        // Drill into the focused parent option (toward the inline-end
        // column the submenu opens on).
        if (itemEl?.getAttribute('aria-haspopup') !== 'true') return;
        e.preventDefault();
        setActivePath([...activePath.slice(0, level), itemEl.dataset.value!]);
        pendingFocus.request({ level: level + 1, index: 0 });
        return;
      }
      case backKey: {
        if (!itemEl || activePath.length === 0) return;
        e.preventDefault();
        const removed = activePath[activePath.length - 1]!;
        setActivePath(activePath.slice(0, -1));
        pendingFocus.request({
          level: activePath.length - 1,
          index: 0,
          value: removed,
        });
        return;
      }
      case 'Home':
      case 'End': {
        e.preventDefault();
        const levelOptions = columns[level] ?? [];
        if (levelOptions.length === 0) return;
        focusColumnItem(
          level,
          e.key === 'Home' ? 0 : levelOptions.length - 1
        );
        return;
      }
      case 'Enter': {
        // Keyboard activation: drill with focus following into the first
        // child; leaves commit. preventDefault suppresses the button's
        // synthesized click so activation runs exactly once (mouse clicks
        // keep their activate() path, where focus intentionally stays).
        if (!itemEl) return;
        e.preventDefault();
        const option = columns[level]?.find(
          (candidate) => candidate.value === itemEl.dataset.value
        );
        if (!option) return;
        if (option.children?.length) {
          setActivePath([...activePath.slice(0, level), option.value]);
          pendingFocus.request({ level: level + 1, index: 0 });
        } else {
          activate(option, level);
        }
        return;
      }
      case 'Escape':
      case 'Tab': {
        // Tab closes instead of tabbing out of the menu; focus returns to
        // the trigger through the focus scope.
        e.preventDefault();
        setOpen(false);
        return;
      }
    }
  };

  // One column item, shared by the plain list and the virtualized
  // renderItem so both paths stay in lockstep (data hooks for keyboard
  // resolution, expand semantics, activation). In virtualized mode the
  // windowed rows additionally carry aria-setsize/aria-posinset — the
  // unmounted remainder of the column stays semantically addressable.
  const renderColumnItem = (option: CascaderOption, level: number, index: number) => {
    const hasChildren = !!option.children?.length;
    const inPath = activePath[level] === option.value;
    return (
      <button
        key={option.value}
        data-slot='option'
        type='button'
        role='menuitem'
        tabIndex={-1}
        data-level={level}
        data-value={option.value}
        aria-haspopup={hasChildren ? 'true' : undefined}
        aria-expanded={hasChildren ? inPath : undefined}
        aria-setsize={virtual ? columns[level]?.length : undefined}
        aria-posinset={virtual ? index + 1 : undefined}
        x-class={[menuOptionStates, item, inPath && pickerOptionSelected, virtual && pickerVirtualRow, classNames?.option]}
        onClick={() => activate(option, level)}
        onMouseEnter={() => handleItemEnter(option, level)}
      >
        <span data-slot='label' x-class={[truncate, itemLabel, classNames?.label]}>{option.label}</span>
        {hasChildren && (
          <span role='img' data-slot='icon' x-class={[pickerCaret, classNames?.icon]} aria-label={strings.expand}>
            <ChevronRight />
          </span>
        )}
      </button>
    );
  };

  // The columns area of the panel. Loading swaps it for a Spinner block
  // (stale columns would lie about the fetch in flight); search mode
  // additionally shows a no-match block when the consumer's rebuilt
  // tree came back empty.
  const columnsBody = columns.map((columnOptions, level) => (
    <div
      key={level}
      data-slot='column'
      role='menu'
      data-haze-cascader-column={level}
      x-class={[column, virtual && columnVirtual, classNames?.column]}
    >
      {virtual ? (
        <VirtualList
          ref={setListRef(level)}
          data-virtualized
          items={columnOptions}
          height={Math.min(
            COLUMN_MAX_HEIGHT,
            columnOptions.length * itemRowHeight
          )}
          itemHeight={itemRowHeight}
          overscan={overscan}
          renderItem={(option, i) => renderColumnItem(option, level, i)}
        />
      ) : (
        columnOptions.map((option, i) => renderColumnItem(option, level, i))
      )}
    </div>
  ));

  const panelBody = loading ? (
    <div data-slot='loading' x-class={[pickerLoadingBlock, classNames?.loading]}>
      <Spinner size='sm' />
      <span>{searchStrings.loading}</span>
    </div>
  ) : searchMode && options.length === 0 ? (
    <div data-slot='empty' x-class={[pickerEmptyBlock, classNames?.empty]}>{searchStrings.noMatch}</div>
  ) : (
    columnsBody
  );

  return (
    <div x-class={[wrapper, className, classNames?.root]} {...rest}>
      <PickerTrigger
        ref={setTriggerRef}
        behavior={floating}
        popup='menu'
        open={open}
        controlsId={id}
        onKeyDown={handleTriggerKeyDown}
        caretClassName={classNames?.icon}
        x-class={[trigger, classNames?.trigger]}
      >
        <span data-slot='value' x-class={[truncate, triggerValue, classNames?.value]}>
          {selectedPath.length === 0 ? (
            <span data-slot='placeholder' x-class={[triggerPlaceholder, classNames?.placeholder]}>{placeholder}</span>
          ) : (
            selectedPath.map((option, i) => (
              <Fragment key={option.value}>
                {i > 0 && (
                  <span data-slot='separator' x-class={[separator, classNames?.separator]}>{' / '}</span>
                )}
                {option.label}
              </Fragment>
            ))
          )}
        </span>
      </PickerTrigger>
      <FloatingPanel
        ref={setPanelRef}
        behavior={floating}
        placement='bottom'
        className={classNames?.content}
        // Search mode re-hosts the menu role (and the trigger's
        // aria-controls target) on the columns wrapper — the search
        // input cannot sit inside a menu. Loading drops the role from
        // whichever element carries it: a menu whose only child is the
        // Spinner block would be an aria-required-children violation.
        id={searchMode ? undefined : id}
        role={searchMode || loading ? undefined : 'menu'}
        aria-busy={loading || undefined}
        visualClass={`${panelSurfaceBare} ${popoverPanelHidden} ${
          searchMode ? panelSearch : panel
        }`}
        onKeyDown={handlePanelKeyDown}
      >
        {searchMode ? (
          <>
            <input
              ref={searchRef}
              data-slot='input'
              type='text'
              aria-label={searchStrings.searchLabel}
              placeholder={searchStrings.searchPlaceholder}
              x-class={[pickerSearchInput, classNames?.input]}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div
              id={id}
              data-slot='columns'
              role={!loading && options.length > 0 ? 'menu' : undefined}
              x-class={[columnsStrip, classNames?.columns]}
            >
              {panelBody}
            </div>
          </>
        ) : (
          panelBody
        )}
      </FloatingPanel>
    </div>
  );
}

export type { CascaderProps, CascaderVirtualizedConfig, CascaderClassNames };
