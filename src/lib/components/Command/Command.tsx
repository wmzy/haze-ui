import type { ReactNode, Ref, RefObject } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { Children, createContext, useContext, useEffect, useId, useMemo, useRef } from 'react';
import { useControl } from 'react-use-control';

import { fieldFocusRing } from '../../utils/field-skin';
import { focusListEdge, useMenuKeyboard, useRovingTabindex } from '../../utils/menuKeyboard';
import { menuOptionStates } from '../../utils/menu-skins';
import { mergeRefs } from '../../utils/refs';
import { stateOptionRow } from '../../utils/state-option-skin';
import Kbd from '../Kbd/Kbd';
import { useStrings } from '../LocaleProvider';
import { VirtualList } from '../VirtualList';

import {
  collectCommandItems,
  commandItemScore,
  flattenCommandChildren,
  isCommandItemElement,
  orderCommandChildren,
} from './command-filter';

type CommandContextValue = {
  query: string;
  setQuery: (q: string) => void;
  /**
   * Whether items filter themselves against `query`. Carried through
   * the context so `CommandItem`/`CommandGroup` render consistently
   * with the palette-level `shouldFilter` prop.
   */
  shouldFilter: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  listRef: RefObject<HTMLDivElement | null>;
  /** Id of the listbox element — wires the container's aria-controls. */
  listId: string;
  /**
   * Palette-level select hook (the CommandDialog wiring): invoked after
   * a consumer's `onSelect` when an item activates. Unset on a bare
   * `Command` — zero effect unless a composition opts in.
   */
  onItemSelect?: () => void;
};

/** Command options are listbox options, not menu items. */
const OPTION_SELECTOR = '[role="option"]';

const CommandContext = createContext<CommandContextValue | undefined>(undefined);

function useCommandContext() {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error('Command sub-components must be used within <Command>');
  return ctx;
}

type CommandProps = {
  /**
   * The palette's search query (controlled `Control<string>` or plain
   * uncontrolled initial value). Drives built-in filtering and is
   * writable through `CommandInput`; consumers may also drive it
   * themselves — filtering only reads the value.
   */
  query?: ControlOrValue<string>;
  /**
   * Whether items filter themselves against `query` (case-insensitive
   * fuzzy subsequence match over the item's `value`/children text and
   * `keywords`, ranked best-first while a query is active). Default
   * `true` — the palette's historical behavior; pass `false` when the
   * consumer filters externally (e.g. server-side search).
   */
  shouldFilter?: boolean;
  /**
   * Palette-level select hook: invoked after any item's own `onSelect`
   * when it activates (click or Enter/Space). The composition channel
   * `CommandDialog` uses to close itself on selection; on a bare
   * `Command` it is a convenient place for logging/focus handoff.
   */
  onItemSelect?: () => void;
  children: ReactNode;
  className?: string;
};

/**
 * Component-level tokens: Command can be rethemed per-component by
 * setting `--haze-command-*` custom properties on any ancestor (the
 * `CommandDialog` palette shell uses the same channel to go borderless
 * and full-width). The library never defines them — the stylesheet
 * only carries fallback chains:
 *
 * - `--haze-command-width` — root max-width (fallback `400px`)
 * - `--haze-command-border` — root border (fallback `1px solid var(--haze-color-border)`)
 * - `--haze-command-list-max-height` — CommandList scroll cap (fallback
 *   `300px`; the virtualized path caps through its JS metrics instead)
 */
const base = css`
  display: flex;
  flex-direction: column;
  border: var(--haze-command-border, 1px solid var(--haze-color-border));
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  font-family: var(--haze-font-sans);
  overflow: hidden;
  width: 100%;
  max-width: var(--haze-command-width, 400px);
`;

export default function Command({
  query: queryControl,
  shouldFilter = true,
  onItemSelect,
  children,
  className,
}: CommandProps) {
  const [query, setQuery] = useControl(queryControl, '');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const value = useMemo(
    () => ({ query, setQuery, shouldFilter, onItemSelect, inputRef, listRef, listId }),
    [query, setQuery, shouldFilter, onItemSelect, listId]
  );

  return (
    <CommandContext.Provider value={value}>
      <div
        data-slot='command'
        x-class={[base, className]}
        role="combobox"
        // The palette list is always rendered, so the combobox is always
        // expanded; aria-controls points at the CommandList listbox.
        aria-expanded={true}
        aria-controls={listId}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
}

// CommandInput
type CommandInputProps = {
  placeholder?: string;
  className?: string;
  /**
   * Ref to the underlying `<input>` — the palette's focusable element
   * (Wave 1 ref-channel convention); `CommandDialog` uses it to focus
   * the input on open.
   */
  ref?: Ref<HTMLInputElement>;
};

/* WCAG 2.4.11 focus-appearance: the palette input is the component's
   tab stop yet previously showed nothing on focus — it composes the
   Input family ring (field-skin's fieldFocusRing: border tint +
   focus-ring halo) at its x-class site below. The leaf's four-side
   border-color is equivalent to a border-bottom-color tint: only the
   bottom edge has width (the other three are `border: none`). */
const inputStyle = css`
  width: 100%;
  padding: var(--haze-space-3) var(--haze-space-4);
  border: none;
  border-bottom: 1px solid var(--haze-color-border);
  background: transparent;
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  outline: none;

  &::placeholder {
    color: var(--haze-color-text-muted);
  }
`;

export function CommandInput({ placeholder, className, ref }: CommandInputProps) {
  const { query, setQuery, inputRef, listRef } = useCommandContext();
  return (
    <input
      ref={mergeRefs(inputRef, ref)}
      data-slot='input'
      x-class={[inputStyle, fieldFocusRing, className]}
      type="text"
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        // WAI-ARIA combobox pattern: arrows move focus into the list.
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        focusListEdge(
          listRef.current,
          e.key === 'ArrowDown' ? 'first' : 'last',
          OPTION_SELECTOR
        );
      }}
    />
  );
}

// CommandList
/** Metrics override for CommandList's `virtualized` prop. */
type CommandListVirtualizedConfig = {
  /**
   * Row height in px of one item row. Defaults to 37 — CommandItem's
   * natural single-line box (space-2 padding top+bottom + text-sm at
   * leading-normal = 8 + 21 + 8, the same math as Combobox's virtual
   * rows). Items are stretched to fill it, so the two cannot drift.
   */
  itemHeight?: number;
  /** Extra rows kept mounted around the visible window. Defaults to
   * VirtualList's 5. */
  overscan?: number;
  /** Scrollport height cap in px. Defaults to 300 — the plain list's
   * `max-height`, so both modes are equally tall at the limit. */
  height?: number;
};

type CommandListProps = {
  children: ReactNode;
  /**
   * Custom no-results content for the empty filtered list. Defaults to
   * the `command.noResults` locale string.
   */
  empty?: ReactNode;
  /**
   * Render the list through VirtualList — explicit opt-in for long
   * flat lists (hundreds+ items) where plain DOM rendering gets slow.
   * `true` uses the default metrics; an object customizes them.
   *
   * Flat `<CommandItem>` children only (fragments dissolve): grouped
   * or wrapped content has no stable row shape to virtualize, so it
   * logs a dev warning and renders the plain path instead. The empty
   * state and `shouldFilter={false}` work through the virtual path
   * like through the plain one; keyboard navigation reaches the
   * mounted window (focusing an option scrolls it into view, which
   * re-windows the list).
   */
  virtualized?: boolean | CommandListVirtualizedConfig;
  className?: string;
};

/** Fixed row height for the virtualized path (see CommandListVirtualizedConfig.itemHeight). */
const ITEM_ROW_HEIGHT = 37;

/** Scrollport height cap for the virtualized path — mirrors listStyle's max-height. */
const LIST_MAX_HEIGHT = 300;

const listStyle = css`
  max-height: var(--haze-command-list-max-height, 300px);
  overflow-y: auto;
  padding: var(--haze-space-1);
`;

/**
 * Virtualized list port: same padding as the plain list, but the
 * VirtualList scrollport owns scrolling (the picker family's
 * `pickerListboxVirtual` pattern — a second scroll box here could grow
 * a second scrollbar). The descendant rule stretches each CommandItem
 * over its fixed-height virtual row so hover/focus paint the full row
 * (the `pickerVirtualRow` contract, expressed as a selector so consumer
 * items keep their own `className` untouched; `[data-index]` matches
 * only VirtualList's row wrappers, never the items themselves).
 */
const listVirtualPort = css`
  padding: var(--haze-space-1);

  [data-index] > [data-slot='item'] {
    height: 100%;
    box-sizing: border-box;
  }
`;

/** The empty/no-results row: an aria-disabled option keeps the listbox
 * non-empty for assistive tech. The centered muted row core is the
 * shared `stateOptionRow` (utils/state-option-skin.ts, shared with
 * Combobox's loading/empty state rows); this local delta is only the
 * roomier block padding. */
const emptyStyle = css`
  padding: var(--haze-space-4) var(--haze-space-3);
`;

export function CommandList({
  children,
  empty,
  virtualized,
  className,
}: CommandListProps) {
  const { inputRef, listRef, listId, shouldFilter, query } = useCommandContext();
  const strings = useStrings('command');

  useRovingTabindex({ menuRef: listRef, active: true, selector: OPTION_SELECTOR });
  const handleKeyDown = useMenuKeyboard({
    menuRef: listRef,
    selector: OPTION_SELECTOR,
    // The palette is always rendered — "closing" it means handing focus
    // back to the input (Escape/Tab from the list).
    onClose: () => inputRef.current?.focus(),
  });

  // Built-in filtering judges only the <CommandItem> elements it renders
  // itself: with items present but none matching, the empty row takes
  // over. Children with no items at all stay consumer-managed.
  const items = collectCommandItems(children, CommandItem);
  const showEmpty =
    shouldFilter &&
    items.length > 0 &&
    !items.some((item) => commandItemScore(item.props, query) !== null);

  // Flat item run: fragments dissolve, every remaining node must be an
  // item — the virtualized contract.
  const flat = useMemo(
    () => flattenCommandChildren(children),
    [children]
  );
  const virtualEligible = flat.every((child) =>
    isCommandItemElement(child, CommandItem)
  );

  useEffect(() => {
    if (virtualized && !virtualEligible) {
      console.warn(
        "CommandList: `virtualized` supports flat <CommandItem> children only — rendering the list without virtualization."
      );
    }
  }, [virtualized, virtualEligible]);

  // Matching items refill item slots best-score-first; non-item children
  // and the empty-query case keep source order (orderCommandChildren).
  const ordered = useMemo(
    () => orderCommandChildren(flat, CommandItem, shouldFilter, query),
    [flat, shouldFilter, query]
  );

  const emptyRow = showEmpty && (
    // The shared aria-disabled option row (stateOptionRow) plus the
    // local roomier padding — the same recipe as Combobox's state rows.
    <div data-slot='empty' role="option" aria-selected={false} aria-disabled="true" x-class={[stateOptionRow, emptyStyle]}>
      {empty ?? strings.noResults}
    </div>
  );

  if (virtualized && virtualEligible) {
    const config = typeof virtualized === 'object' ? virtualized : undefined;
    const rowHeight = config?.itemHeight ?? ITEM_ROW_HEIGHT;
    const virtualItems = ordered.filter((child) =>
      isCommandItemElement(child, CommandItem)
    );
    return (
      <div
        ref={listRef}
        data-slot='list'
        x-class={[className]}
        role="listbox"
        id={listId}
        onKeyDown={handleKeyDown}
      >
        {virtualItems.length > 0 ? (
          <VirtualList
            data-virtualized
            items={virtualItems}
            // Short lists size to their rows, matching the plain path's
            // content-driven height (Combobox's Math.min shape).
            height={Math.min(
              config?.height ?? LIST_MAX_HEIGHT,
              virtualItems.length * rowHeight
            )}
            itemHeight={rowHeight}
            overscan={config?.overscan}
            renderItem={(item) => item}
            className={listVirtualPort}
          />
        ) : (
          emptyRow
        )}
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      data-slot='list'
      x-class={[listStyle, className]}
      role="listbox"
      id={listId}
      onKeyDown={handleKeyDown}
    >
      {ordered}
      {emptyRow}
    </div>
  );
}

// CommandGroup
type CommandGroupProps = {
  /**
   * Heading rendered above the group's items. Sticky while the list
   * scrolls: pinned to the scrollport top until the next group's
   * heading pushes past it (the cmdk shape). Optional — a group may
   * exist purely to opt its items into empty-group hiding.
   */
  heading?: ReactNode;
  className?: string;
  /**
   * The group's `CommandItem` rows (and any wrappers around them).
   * Optional — a childless group renders nothing (the empty-group
   * hiding contract covers zero-item groups too).
   */
  children?: ReactNode;
};

const groupHeading = css`
  position: sticky;
  top: 0;
  z-index: var(--haze-z-local-1);
  box-sizing: border-box;
  background: var(--haze-color-bg);
  border-bottom: 1px solid var(--haze-color-border);
  padding: var(--haze-space-1) var(--haze-space-3);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
`;

export function CommandGroup({ heading, children, className }: CommandGroupProps) {
  const { shouldFilter, query } = useCommandContext();
  const headingId = useId();

  // Non-empty groups only: a group whose every item was filtered out
  // renders nothing at all, keeping the list free of orphaned headers.
  // Content without any CommandItem children is consumer-managed and
  // only hides when literally empty.
  const items = collectCommandItems(children, CommandItem);
  const visible =
    items.length === 0
      ? Children.count(children) > 0
      : !shouldFilter || items.some((item) => commandItemScore(item.props, query) !== null);
  if (!visible) return null;

  // Same relevance ordering as a flat CommandList run: matching items
  // refill the group's item slots best-score-first, non-item children
  // keep their slots.
  const ordered = orderCommandChildren(
    flattenCommandChildren(children),
    CommandItem,
    shouldFilter,
    query
  );

  return (
    <div
      data-slot='group'
      role="group"
      aria-labelledby={heading !== undefined ? headingId : undefined}
      x-class={[className]}
    >
      {heading !== undefined && (
        <div id={headingId} data-slot='group-label' x-class={[groupHeading]}>
          {heading}
        </div>
      )}
      {ordered}
    </div>
  );
}

// CommandItem
type CommandItemProps = {
  children: ReactNode;
  /**
   * Explicit filter target. Defaults to the concatenated text of the
   * item's children (icons and wrappers are walked transparently).
   */
  value?: string;
  /**
   * Extra filter targets that should surface the item even when its
   * displayed text misses the query (e.g. synonyms, aliases).
   */
  keywords?: readonly string[];
  /**
   * Shortcut hint rendered as a `Kbd` badge on the item's inline end —
   * purely decorative, the binding itself belongs to the consumer
   * (e.g. `useHotkeys`).
   */
  shortcut?: string;
  className?: string;
  onSelect?: () => void;
};

/** Item chrome: padding/radius/typography — the hover/press/focus
 * interaction states ride `menuOptionStates` (utils/menu-skins),
 * composed ahead of this delta at the call site. */
const itemStyle = css`
  padding: var(--haze-space-2) var(--haze-space-3);
  border-radius: var(--haze-radius-md);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  cursor: pointer;
  transition: background var(--haze-duration-fast);
`;

/** Row layout only while a shortcut badge is present — plain items keep the historical block flow. */
const itemWithShortcut = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--haze-space-3);
`;

export function CommandItem({
  children,
  value,
  keywords,
  shortcut,
  className,
  onSelect,
}: CommandItemProps) {
  const { shouldFilter, query, onItemSelect } = useCommandContext();
  const visible =
    !shouldFilter || commandItemScore({ value, keywords, children }, query) !== null;

  if (!visible) return null;

  const activate = () => {
    onSelect?.();
    onItemSelect?.();
  };

  return (
    <div
      data-slot='item'
      x-class={[menuOptionStates, itemStyle, shortcut !== undefined && itemWithShortcut, className]}
      role="option"
      tabIndex={-1}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        // Options are divs, not buttons — activate from the keyboard here.
        e.preventDefault();
        activate();
      }}
    >
      {children}
      {shortcut !== undefined && <Kbd size="sm">{shortcut}</Kbd>}
    </div>
  );
}

export type {
  CommandProps,
  CommandInputProps,
  CommandListProps,
  CommandListVirtualizedConfig,
  CommandGroupProps,
  CommandItemProps,
};
