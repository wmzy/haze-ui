import type { ComponentPropsWithoutRef, KeyboardEvent as ReactKeyboardEvent, ReactNode, Ref } from 'react';
import type { VirtualListHandle } from '../VirtualList';
import type { SelectClassNames } from './Select';

import type { SelectEntryData, SelectOptionData } from './select-options';

import { css } from '@linaria/core';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { FloatingPanel, useFloating } from '../../utils/floating';
import {
  PickerCaret,
  PickerTrigger,
  pickerEmptyBlock,
  pickerGroupLabel,
  pickerListbox,
  pickerListboxVirtual,
  pickerLoadingBlock,
  pickerOptionRow,
  pickerOverflowBadge,
  pickerPanelWidth,
  pickerSearchInput,
  pickerTrigger,
  pickerVirtualRow,
} from '../../utils/picker-trigger';
import { mergeRefs } from '../../utils/refs';
import { useHighlightScroll } from '../../utils/use-highlight-scroll';
import { useListboxNavigation } from '../../utils/use-listbox-navigation';
import { useSearchReport } from '../../utils/use-search-report';
import Chip from '../Chip/Chip';
import { useStrings } from '../LocaleProvider';
import { formatString } from '../LocaleProvider/locale';
import Spinner from '../Spinner/Spinner';
import { VirtualList } from '../VirtualList';

import { filterSelectEntries, flattenSelectEntries, selectOptionText } from './select-options';

/** Metrics override for the `virtualized` option list of the floating
 * Select paths (multiple, or single with `searchable`). */
type SelectVirtualizedConfig = {
  /**
   * Row height in px of one option row. Defaults to 29 — the measured
   * natural box of an option row: space-1 padding top+bottom (4+4) plus
   * the taller of the text-sm line box (21px at leading-normal) and the
   * 1.125rem visual checkbox (18px). Virtualization math needs it as a
   * JS number; rows are stretched to fill it (`pickerVirtualRow`,
   * utils/picker-trigger), so the two cannot drift apart.
   */
  itemHeight?: number;
  /** Extra rows kept mounted above/below the visible window. Defaults
   * to VirtualList's 5. */
  overscan?: number;
};

type SelectFloatingProps<T extends string | number = string> = {
  /**
   * Current selection — `T[]` in multiple mode, `T` in single mode. A
   * stray value of the other shape is normalized (empty selection /
   * empty value) rather than crashing.
   */
  value: T | T[];
  /**
   * Notifies the next value: `T[]` in multiple mode, `T` in single
   * mode — the single-mode option pick also closes the panel.
   */
  onChange: (value: T | T[]) => void;
  /** Extracted <Option>/<option>/<OptionGroup> children of the owning
   * Select, grouping structure preserved. */
  entries: SelectEntryData<T>[];
  /** Multiple selection mode: chips in the trigger, toggling options,
   * panel stays open across picks. Single mode closes on pick. */
  multiple: boolean;
  /**
   * Tags mode (see SelectProps.tags in ./Select): implies multiple
   * selection — the search input moves into the trigger, which renders
   * the selected chips and the inline input as one field. Typing
   * filters the panel's options; Enter commits the highlighted option
   * or, when nothing matches, creates a new tag from the trimmed query
   * (deduped against existing option values and the current
   * selection). Backspace on an empty query removes the last chip.
   */
  tags?: boolean;
  /** Falls back to the `select.placeholder` locale string. */
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Slot classes, following data-slot names (see SelectProps.classNames
   * in ./Select; the Select wrapper merges its ConfigProvider section
   * under this prop already). */
  classNames?: SelectClassNames;
  /**
   * Render a search input at the top of the panel that filters the
   * options (case-insensitive substring over the label text). Typing
   * filters and auto-highlights the first match; ↑/↓ move the
   * highlight, Enter picks it, Escape closes. The input is focused
   * when the panel opens.
   */
  searchable?: boolean;
  /**
   * Show a pointer-only × clear affordance at the trigger's inline end
   * while a value is selected (revealed on hover/focus-within).
   * Clicking it empties the value (`[]` / `''`) without toggling the
   * panel and keeps focus on the trigger. Keyboard parity: Backspace on
   * the single-mode trigger clears the value; multiple mode keeps
   * Backspace removing the last chip.
   */
  clearable?: boolean;
  /**
   * Async option state: the options area shows a Spinner with
   * `aria-busy="true"` on the panel instead of the list, and search
   * filtering is skipped (an empty result while loading would be a
   * lie). Keyboard navigation is inert until loading finishes.
   */
  loading?: boolean;
  /**
   * Remote search: while set, local query filtering is suspended — the
   * panel renders exactly the options received through `entries`, and
   * every query transition of the panel's search input is reported
   * here instead: each keystroke, clearing the field, and the reset
   * back to `''` when the panel closes (so the consumer can restore
   * the full list before the next open). The consumer owns the
   * options end to end; pair with `loading` for the pending state.
   * Debouncing is the consumer's concern.
   */
  onSearch?: (query: string) => void;
  /**
   * Multiple mode only: render at most this many chips; the rest
   * collapse into a `+N` badge whose `title` tooltip lists the
   * overflow labels. Selection semantics are unchanged — the badge is
   * presentational.
   */
  maxTagCount?: number;
  /**
   * Multiple/tags mode only: once the selection reaches this count,
   * options that are not currently selected are disabled — dimmed,
   * `aria-disabled`, clicks and Enter rejected — until something is
   * deselected. Selected options stay removable; the tags create row
   * is suppressed at the cap. Single mode ignores it.
   */
  maxCount?: number;
  /**
   * Render the options list through VirtualList so thousand-option
   * listboxes mount only the visible window (plus overscan) instead of
   * the full DOM list. `false`/omitted (default) keeps the plain DOM
   * path byte-for-byte; an object additionally customizes row metrics.
   */
  virtualized?: boolean | SelectVirtualizedConfig;
  className?: string;
  /** Forwarded to the trigger — the `<button>` element, or the inline
   * `<input>` in tags mode. */
  ref?: Ref<HTMLButtonElement | HTMLInputElement>;
  /**
   * Native passthrough re-hosted on the button trigger. The owning
   * SelectCore forwards its select-typed rest here — only the
   * element-generic event handler types differ between the two
   * attribute sets, so the widening happens at that boundary.
   */
} & Omit<
  ComponentPropsWithoutRef<'button'>,
  'value' | 'onChange' | 'size' | 'type' | 'children'
>;

const wrapper = css`
  position: relative;
  display: inline-block;
  width: 100%;
`;

/** Trigger deltas over the shared picker base
 * (utils/picker-trigger): the chip-wrapping flex row and the dual
 * focus arm — `:focus` for the button, `:focus-within` for the tags
 * box whose inline input owns focus (on the button trigger the two
 * pseudo-classes coincide — it has no focusable descendants). The
 * font-size/padding metrics ride the `sizes` variants. */
const trigger = css`
  flex-wrap: wrap;
  gap: var(--haze-space-1);
  appearance: none;

  &:hover {
    border-color: var(--haze-color-border-hover);
  }

  &:focus,
  &:focus-within {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Tags-mode box: the div has no native disabled attribute — the
     forwarded disabled state renders as aria-disabled and gates
     pointer interaction (the inline input itself carries the real
     disabled attribute, keeping it out of the tab order). */
  &[aria-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
  }
`;

const sizes = {
  sm: css`
    padding: var(--haze-space-1) var(--haze-space-2);
    font-size: var(--haze-text-sm);
  `,
  md: css`
    padding: var(--haze-space-2) var(--haze-space-3);
    font-size: var(--haze-text-sm);
  `,
  lg: css`
    padding: var(--haze-space-3) var(--haze-space-4);
    font-size: var(--haze-text-base);
  `,
} as const;

const placeholderText = css`
  color: var(--haze-color-text-muted);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

/** The single-mode trigger's selected label — same clipping contract as
 * the placeholder, plus min-width so it can shrink inside the flex
 * trigger and ellipsize instead of stretching it. */
const triggerLabel = css`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

/**
 * The tags-mode trigger's inline search input (Mantine TagsInput /
 * AntD mode="tags" shape): chromeless, growing into whatever inline
 * space the chips leave — with a small floor so it stays typeable
 * after the chips wrap. Focus feedback is the box's focus-within ring;
 * the input itself must not draw a second outline.
 */
const inlineInput = css`
  flex: 1 1 auto;
  min-width: 4ch;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: inherit;
  line-height: var(--haze-leading-normal);
  cursor: text;

  &::placeholder {
    color: var(--haze-color-text-muted);
  }

  &:focus {
    outline: none;
  }
`;

/** One selected value: the Chip capsule plus its pointer-only remove ×. */
const chipItem = css`
  display: inline-flex;
  align-items: center;
`;

/**
 * Pointer-only remove affordance. A real button here would nest
 * interactive controls inside the trigger button — invalid HTML, an axe
 * `nested-interactive` violation, and a screen-reader mess. The span is
 * aria-hidden and unreachable by Tab on purpose: keyboard users remove
 * values with Backspace on the trigger or by toggling the option in the
 * listbox (the same trade-off Ant Design's multiple select makes).
 */
const chipRemove = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: var(--haze-radius-full);
  background: transparent;
  color: var(--haze-color-text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  margin-inline-start: var(--haze-space-1);
  opacity: 0.6;
  transition: opacity var(--haze-duration-fast);

  &:hover {
    opacity: 1;
  }
`;

/**
 * Pointer-only clear affordance (same nested-interactive rationale as
 * `chipRemove`). Revealed on trigger hover/focus-within through the
 * `[data-clearable]` ancestor selector (the `[role='option']:hover &`
 * pattern from the option rows); hidden otherwise — `visibility` +
 * `pointer-events` keep the invisible affordance from eating clicks
 * aimed at the caret. The solid background chip masks the painted caret
 * slot it occupies, on both the floating trigger and the native-select
 * overlay in SelectCore.
 */
const clearBtn = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-bg);
  color: var(--haze-color-text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity var(--haze-duration-fast);

  [data-clearable]:hover &,
  [data-clearable]:focus-within & {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  &:hover {
    color: var(--haze-color-text);
  }
`;

/** Caret deltas over the shared caret base (utils/picker-trigger): a
 * centered box pushed to the trigger's inline end, inert to pointers
 * (the open toggle belongs to the trigger, not the glyph). */
const caret = css`
  align-items: center;
  justify-content: center;
  margin-inline-start: auto;
  pointer-events: none;
`;

/**
 * Searchable panel chrome on top of the shared tier-aware width
 * cascade (`pickerPanelWidth`): the panel itself stays a plain
 * container (a `display` declaration here would override the UA
 * sheet's `[popover]:not(:popover-open) { display: none }` and paint
 * the closed popover into the document flow) — the search input
 * (`pickerSearchInput`, utils/picker-trigger) and the inner listbox
 * stack as plain block flow inside the padding.
 */
const panelSearch = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);
  padding: var(--haze-space-2);
`;

/** Scroll box of the searchable list — the plain listbox's `max-height`
 * cap re-applied to the inner element that now owns scrolling. */
const listboxInner = css`
  max-height: 200px;
  overflow-y: auto;
`;

/** Plain-path group heading row: the shared group-heading typography
 * (`pickerGroupLabel`, utils/picker-trigger) plus the option-row inset. */
const groupLabelRow = css`
  padding: var(--haze-space-1) var(--haze-space-3);
`;

/** Scrollport height of the virtualized list — the plain listbox's
 * `max-height` cap, so both modes cap out equally tall; shorter lists
 * size to their rows through `Math.min` at the call site. */
const LISTBOX_MAX_HEIGHT = 200;

/** Fixed row height for the virtualized path: the natural option-row
 * box — space-1 padding top+bottom (4+4) plus max(text-sm line box at
 * leading-normal 21, checkbox 1.125rem = 18) = 29. Rows are stretched
 * to fill it (`pickerVirtualRow`, utils/picker-trigger), so the two
 * cannot drift apart. */
const OPTION_ROW_HEIGHT = 29;

/** The shared option-row skeleton (`pickerOptionRow`,
 * utils/picker-trigger) — this file adds only the highlighted state
 * (the keyboard highlight is not hover) and the selected styles. */
const optionActive = css`
  background: var(--haze-color-bg-subtle);
`;

/** Single-mode selected option: the multiple mode shows its visual
 * checkbox instead — one selectedness cue per mode, never both. */
const optionSelected = css`
  color: var(--haze-color-primary);
  font-weight: var(--haze-weight-medium);
`;

/**
 * Purely visual checkbox in front of each option, mirroring
 * CheckboxCore's look token for token. It cannot be a real input: a
 * focusable control inside the interactive option row is an axe
 * `no-focusable-content` violation (negative tabindex and aria-hidden
 * do not exempt it), so selection semantics live on the option row
 * alone — the trigger owns focus, Enter/Space toggle the highlighted
 * option.
 */
const checkboxVisual = css`
  display: inline-block;
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  box-sizing: border-box;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-bg);
  position: relative;
  transition:
    background var(--haze-duration-fast),
    border-color var(--haze-duration-fast);

  [role='option']:hover & {
    border-color: var(--haze-color-border-hover);
  }

  &::after {
    content: '';
    position: absolute;
    display: none;
    top: 2px;
    /* physical: the checkmark is drawn from physical borders +
       rotate(45) and stays unmirrored under RTL by industry convention
       (same primitive as CheckboxCore). */
    left: 5px;
    width: 5px;
    height: 9px;
    border: solid var(--haze-color-text-inverse);
    /* physical: drawing primitive of the same unmirrored checkmark. */
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const checkboxChecked = css`
  background: var(--haze-color-primary);
  border-color: var(--haze-color-primary);

  &::after {
    display: block;
  }
`;

export default function SelectFloating<T extends string | number = string>({
  value,
  onChange,
  entries,
  multiple,
  tags = false,
  maxCount,
  placeholder,
  searchable = false,
  clearable = false,
  loading = false,
  onSearch,
  maxTagCount,
  size = 'md',
  virtualized,
  className,
  classNames,
  ref,
  ...rest
}: SelectFloatingProps<T>) {
  const strings = useStrings('select');
  // The create row's copy reuses the Combobox section's localized
  // `create` string — Select has no own key for it and layering a new
  // one would ripple through every built-in locale pack for the same
  // sentence.
  const comboboxStrings = useStrings('combobox');
  // Tags implies multiple semantics (chips, array value, toggling) on
  // top of its own trigger shape — every `multiple` consumer below
  // reads this resolved flag instead.
  const isMulti = multiple || tags;
  // Tags moves the search input into the trigger, so the panel-top
  // search input renders only for searchable-without-tags.
  const showPanelSearch = searchable && !tags;
  const selected: T[] = isMulti && Array.isArray(value) ? value : [];
  // Single mode's raw value; '' is the empty sentinel for every T (the
  // uncontrolled default in ./Select) — 0 stays a real selection.
  const selectedValue: T = !isMulti && !Array.isArray(value) ? value : ('' as T);
  // maxCount cap: unselected options are locked once the selection
  // reaches it (selected entries stay removable).
  const maxCountReached =
    isMulti && maxCount !== undefined && selected.length >= maxCount;
  // Panel visibility stays internal to the trigger — the pointer-safe
  // open path lives in floating's onTriggerPointerDown/onTriggerClick.
  const [open, setOpen] = useControl(undefined, false);
  // The search query is internal UI state (never a prop), so useState
  // is the correct primitive here, not useControl.
  const [query, setQuery] = useState('');
  const [prevQuery, setPrevQuery] = useState(query);
  const id = useId();
  // The floating trigger host: the button in every mode but tags, the
  // chip-box div there. HTMLElement-typed because of that split.
  const triggerRef = useRef<HTMLElement>(null);
  // The consumer's ref rides the same trigger button the floating
  // behavior anchors on.
  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => mergeRefs(triggerRef, ref)(node),
    [triggerRef, ref]
  );
  // Tags mode: the box hosts the floating anchor while the consumer's
  // ref merges onto the focusable inline input instead.
  const setTagsBoxRef = useCallback(
    (node: HTMLDivElement | null) => {
      triggerRef.current = node;
    },
    [triggerRef]
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const setTagsInputRef = useCallback(
    (node: HTMLInputElement | null) =>
      mergeRefs(
        searchRef,
        ref as Ref<HTMLInputElement> | undefined
      )(node),
    [searchRef, ref]
  );
  const activeOptionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<VirtualListHandle>(null);

  // `virtualized` resolution: object config enables and customizes,
  // `true` enables with defaults, anything else keeps the plain DOM.
  const virtual = virtualized !== undefined && virtualized !== false;
  const virtualConfig = typeof virtualized === 'object' ? virtualized : undefined;
  const rowHeight = virtualConfig?.itemHeight ?? OPTION_ROW_HEIGHT;
  const overscan = virtualConfig?.overscan;

  const floating = useFloating({
    open,
    setOpen,
    triggerRef,
    panelRef,
    animated: true,
  });

  const allOptions = flattenSelectEntries(entries);
  // While loading the options area shows a Spinner — no filtering runs
  // (an empty pass would claim "no matches" about options we simply
  // have not received yet) and keyboard navigation is inert. Remote
  // mode (onSearch set) never filters locally either: the visible set
  // is exactly the consumer's current entries, refetched per query.
  const visibleEntries = loading
    ? []
    : onSearch
      ? entries
      : filterSelectEntries(entries, query);
  const visibleOptions = flattenSelectEntries(visibleEntries);

  // Tags creation row (Combobox's creatable contract): offered when a
  // non-blank query matches nothing — not while loading, not at the
  // maxCount cap, not when the trimmed query already exists as an
  // option value or a selected tag (dedupe: committing it would be a
  // no-op, so it is not offered at all). It leads the navigable list,
  // so keyboard and aria-set semantics treat it as a regular option.
  const trimmedQuery = query.trim();
  const createValue = trimmedQuery as T;
  const showCreateItem =
    tags &&
    !loading &&
    trimmedQuery !== '' &&
    visibleOptions.length === 0 &&
    !maxCountReached &&
    !selected.includes(createValue) &&
    !allOptions.some((o) => String(o.value) === trimmedQuery);
  const createOption: SelectOptionData<T> | undefined = showCreateItem
    ? {
        value: createValue,
        label: formatString(comboboxStrings.create, { query: trimmedQuery }),
      }
    : undefined;
  // The entry set the panel renders and the keyboard walks: the
  // consumer's filtered entries, with the create row prepended when
  // offered. Non-tags paths are byte-identical (no row is layered).
  const panelEntries: SelectEntryData<T>[] =
    showCreateItem && createOption
      ? [{ kind: 'option', option: createOption }, ...visibleEntries]
      : visibleEntries;
  const navigableOptions = flattenSelectEntries(panelEntries);

  // The clamped flat-index highlight shared with Combobox
  // (utils/use-listbox-navigation); every consumed navigation key also
  // opens the panel from the closed state (a no-op while open).
  const { activeIndex, setActiveIndex, handleNavigationKey } =
    useListboxNavigation(navigableOptions.length, () => setOpen(true));

  // Flat index at which each entry's options begin — the bridge between
  // the grouped render structure and the flat keyboard/aria order.
  const entryOffsets = panelEntries.reduce<{ offsets: number[]; flat: number }>(
    (acc, entry) => ({
      offsets: [...acc.offsets, acc.flat],
      flat: acc.flat + (entry.kind === 'group' ? entry.options.length : 1),
    }),
    { offsets: [], flat: 0 }
  ).offsets;

  // Stable, SSR-safe DOM id per option row (Combobox's scheme): the
  // trigger's aria-activedescendant points here so screen readers
  // announce the keyboard highlight on rows that never receive focus.
  const optionId = (index: number) => `${id}-option-${index}`;

  // Only while the popup is open — a closed listbox must not own the
  // trigger's active descendant. No (or out-of-range) highlight omits
  // the attribute entirely.
  const activeDescendant =
    open && navigableOptions[activeIndex] ? optionId(activeIndex) : undefined;

  // The searchable panel hosts the listbox one level down (the search
  // input must not sit inside a listbox), so the trigger's
  // aria-controls targets the inner element there.
  const listboxId = `${id}-listbox`;

  useHighlightScroll({
    shown: floating.shown,
    highlightIndex: activeIndex,
    virtualized: virtual,
    listRef,
    rowRef: activeOptionRef,
  });

  // Focus lands in the panel's search input whenever the searchable
  // popup is actually shown (gated on `shown` — focus on a still-hidden
  // popover is silently dropped by real engines), so typing filters
  // straight away. Tags keeps focus in its always-mounted trigger
  // input instead.
  useEffect(() => {
    if (showPanelSearch && open && floating.shown) {
      searchRef.current?.focus();
    }
  }, [showPanelSearch, open, floating.shown]);

  useSearchReport(onSearch, query);

  // A closed panel starts the next open with a fresh query — a stale
  // filter surviving close/reopen would hide the very value the user
  // just picked. Adjusted during render (the same React-endorsed reset
  // as the highlight below) instead of an effect, per the repo's
  // set-state-in-effect lint posture.
  if (!open && query !== '') {
    setQuery('');
  }

  // Typing a new query invalidates the highlight — adjust during render
  // (React-endorsed reset) so the first filtered frame already carries
  // the auto-highlight of the first match (MUI Autocomplete behavior:
  // Enter right after typing picks it without an arrow press first).
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(navigableOptions.length > 0 ? 0 : -1);
  }

  const toggleOption = (optionValue: T) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
      return;
    }
    // maxCount rejection: the click/keyboard paths also carry the
    // visual disabled state, but the guard here is what enforces it
    // for controlled and uncontrolled consumers alike.
    if (maxCountReached) return;
    onChange([...selected, optionValue]);
  };

  const removeValue = (optionValue: T) => {
    onChange(selected.filter((v) => v !== optionValue));
  };

  const labelFor = (optionValue: T): ReactNode =>
    allOptions.find((o) => o.value === optionValue)?.label ?? optionValue;

  const clearValue = () => {
    onChange(isMulti ? [] : ('' as T));
  };

  /** Tags creation: append the trimmed query as a new tag and clear the
   * input so the next keystroke starts fresh. Dedupe is guaranteed by
   * the offer condition (showCreateItem), the includes check is belt
   * and braces for programmatic callers. */
  const commitCreate = () => {
    if (!selected.includes(createValue)) {
      onChange([...selected, createValue]);
    }
    setQuery('');
  };

  /** Focus return target after a close-from-panel path: the trigger
   * button everywhere, the inline input in tags mode (focus already
   * lives there and should survive the close). */
  const returnFocus = () => {
    if (tags) searchRef.current?.focus();
    else triggerRef.current?.focus();
  };

  /** Pick one option: multiple toggles and keeps the panel open, single
   * commits the value, closes the panel and returns focus to the
   * trigger. The tags create row routes to commitCreate instead of the
   * toggle semantics (re-creating an existing tag must not deselect
   * it). Option-level disabled rows are inert — the keyboard path
   * lands here instead of the click's rowDisabled gate. */
  const choose = (optionValue: T) => {
    if (showCreateItem && optionValue === createValue) {
      commitCreate();
      return;
    }
    if (allOptions.find((o) => o.value === optionValue)?.disabled) return;
    if (isMulti) {
      toggleOption(optionValue);
      // Tags keeps typing: the query that produced the pick is spent.
      if (tags) setQuery('');
      return;
    }
    onChange(optionValue);
    setOpen(false);
    returnFocus();
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    // The shared Arrow/Home/End skeleton (clamped highlight + open from
    // the closed state) consumes the navigation keys; the site keys
    // below compose after it.
    if (handleNavigationKey(e)) return;
    // No typeahead on the trigger: options are also reachable by
    // scrolling the open panel, and searchable mode types into the
    // panel's search input — the single-mode native select keeps its
    // own typeahead.
    if (
      // Space arrives as ' ' from real browsers; user-event's {Space}
      // reports the legacy 'Space' key name — accept both.
      (e.key === 'Enter' || e.key === ' ' || e.key === 'Space') &&
      open &&
      navigableOptions[activeIndex]
    ) {
      // Suppress the button's native activation, or the follow-up click
      // would run onTriggerClick and close the panel mid-selection.
      // With no highlight (fresh open), fall through to the click path
      // so Enter/Space keep toggling the panel like any button.
      e.preventDefault();
      choose(navigableOptions[activeIndex].value);
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Backspace') {
      // Keyboard parity for the pointer-only affordances: multiple
      // drops the most recently selected chip, single (clearable)
      // empties the value — see chipRemove/clearBtn.
      if (isMulti && selected.length > 0) {
        e.preventDefault();
        onChange(selected.slice(0, -1));
      } else if (!isMulti && clearable && selectedValue !== '') {
        e.preventDefault();
        clearValue();
      }
    }
  };

  // The tags trigger's inline input owns focus permanently (panel open
  // or closed), so it drives the full navigation itself: the shared
  // skeleton's arrows/Home/End also open the panel from the closed
  // state, Enter commits the highlighted row (option or create row —
  // both are plain rows in `navigableOptions`), Escape closes while
  // keeping focus in the field, and Backspace on an empty query removes
  // the last chip (Combobox parity — the pointer-only chip × has no
  // keyboard twin).
  const handleTagsKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (handleNavigationKey(e)) return;
    if (e.key === 'Enter') {
      // Always suppressed — an unhandled Enter in the input would
      // submit an enclosing form.
      e.preventDefault();
      if (navigableOptions[activeIndex]) {
        choose(navigableOptions[activeIndex].value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'Backspace' && query === '' && selected.length > 0) {
      e.preventDefault();
      onChange(selected.slice(0, -1));
    }
  };

  // The panel search input owns focus while the searchable popup is
  // open, so it drives the same navigation: the shared skeleton's
  // arrows/Home/End move the highlight (caret motion suppressed),
  // Enter picks, Escape closes and returns focus to the trigger. Plain
  // typing filters through onChange.
  const handleSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (handleNavigationKey(e)) return;
    if (e.key === 'Enter') {
      // Always suppressed while the popup is open — an unhandled Enter
      // in the input would submit an enclosing form.
      e.preventDefault();
      if (navigableOptions[activeIndex]) {
        choose(navigableOptions[activeIndex].value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      returnFocus();
    }
  };

  // One option row, shared by the plain list and the virtualized
  // renderItem so both paths stay in lockstep (aria ids, set semantics,
  // active styling, choosing). `i` is the flat index across groups —
  // the same coordinate aria-activedescendant and the keyboard use.
  const renderOption = (option: SelectOptionData<T>, i: number) => {
    const isSelected = isMulti
      ? selected.includes(option.value)
      : option.value === selectedValue;
    // The create row is neither toggleable-disabled (it is suppressed
    // at the cap instead) nor checkbox-carrying — it is a commit
    // affordance, not a set member. Option-level disabled (from
    // `<Option disabled>` or the `options` prop) joins the maxCount
    // lock under the same inert-row contract.
    const isCreateRow = showCreateItem && i === 0;
    const rowDisabled =
      option.disabled === true ||
      (isMulti && maxCountReached && !isSelected && !isCreateRow);
    return (
      <div
        key={option.value}
        data-slot='option'
        ref={i === activeIndex ? activeOptionRef : undefined}
        role='option'
        id={optionId(i)}
        aria-selected={isSelected}
        aria-disabled={rowDisabled || undefined}
        data-disabled={rowDisabled || undefined}
        aria-setsize={navigableOptions.length}
        aria-posinset={i + 1}
        x-class={[
          pickerOptionRow,
          i === activeIndex && optionActive,
          !isMulti && isSelected && optionSelected,
          virtual && pickerVirtualRow,
          classNames?.option,
        ]}
        onClick={() => {
          if (!rowDisabled) choose(option.value);
        }}
      >
        {isMulti && !isCreateRow && (
          <span
            aria-hidden='true'
            data-slot='indicator'
            x-class={[checkboxVisual, isSelected && checkboxChecked]}
          />
        )}
        {option.label}
      </div>
    );
  };

  const showClear =
    clearable && (isMulti ? selected.length > 0 : selectedValue !== '');

  const clearAffordance = showClear ? (
    <span
      aria-hidden='true'
      data-slot='clear-button'
      title={strings.clear}
      x-class={[clearBtn, classNames?.clearButton]}
      onClick={(e) => {
        // Keep the trigger's open toggle out of this click — clearing
        // must not flip the panel either way (the pointerdown above
        // already reached the floating handlers for race attribution,
        // so an open panel stays open and a closed one stays closed).
        e.stopPropagation();
        clearValue();
        returnFocus();
      }}
    >
      ×
    </span>
  ) : undefined;

  // The chip set of a multiple/tags trigger, shared by both shapes —
  // the overflow badge of `maxTagCount` included.
  const chips = (
    <>
      {(maxTagCount === undefined
        ? selected
        : selected.slice(0, Math.max(maxTagCount, 0))
      ).map((v) => (
        <span data-slot='item' x-class={[chipItem, classNames?.item]} key={v}>
          <Chip color='primary'>{labelFor(v)}</Chip>
          <span
            aria-hidden='true'
            data-slot='item-remove'
            x-class={chipRemove}
            onClick={(e) => {
              // Keep the trigger's open toggle out of this click —
              // removing a chip must not close the panel.
              e.stopPropagation();
              removeValue(v);
            }}
          >
            ×
          </span>
        </span>
      ))}
      {maxTagCount !== undefined && selected.length > Math.max(maxTagCount, 0) && (
        <span
          data-slot='overflow-badge'
          x-class={pickerOverflowBadge}
          title={selected
            .slice(Math.max(maxTagCount, 0))
            .map((v) => selectOptionText(labelFor(v)))
            .join(', ')}
        >
          {formatString(strings.moreTags, {
            count: selected.length - Math.max(maxTagCount, 0),
          })}
        </span>
      )}
    </>
  );

  const triggerBody = isMulti ? (
    // Tags always renders the input (it carries the placeholder when
    // the selection is empty), so the chip-less state is just the
    // empty fragment there.
    tags || selected.length > 0 ? (
      chips
    ) : (
      <span data-slot='placeholder' x-class={placeholderText}>
        {placeholder ?? strings.placeholder}
      </span>
    )
  ) : selectedValue === '' ? (
    <span data-slot='placeholder' x-class={placeholderText}>{placeholder ?? strings.placeholder}</span>
  ) : (
    <span data-slot='value' x-class={triggerLabel}>{labelFor(selectedValue)}</span>
  );

  // The options area of the panel. An empty visible list (loading, or a
  // query without matches) renders a state block instead of the
  // listbox: an option-less element wearing role="listbox" is an axe
  // aria-required-children violation, and while loading the Spinner's
  // role="status" announces the state on its own. The create row counts
  // as a visible option (tags mode).
  const hasVisibleOptions = !loading && navigableOptions.length > 0;

  const optionsList = virtual ? (
    <VirtualList
      ref={listRef}
      data-virtualized
      items={navigableOptions}
      groups={
        panelEntries.some((entry) => entry.kind === 'group')
          ? panelEntries.flatMap((entry, ei) =>
              entry.kind === 'group'
                ? [
                    {
                      startIndex: entryOffsets[ei] ?? 0,
                      key: `group-${entry.label}-${entryOffsets[ei] ?? 0}`,
                      render: () => (
                        <div data-slot='group-label' x-class={pickerGroupLabel}>{entry.label}</div>
                      ),
                    },
                  ]
                : []
            )
          : undefined
      }
      height={Math.min(LISTBOX_MAX_HEIGHT, navigableOptions.length * rowHeight)}
      itemHeight={rowHeight}
      overscan={overscan}
      renderItem={renderOption}
    />
  ) : (
    panelEntries.map((entry, ei) => {
      const base = entryOffsets[ei] ?? 0;
      if (entry.kind === 'option') {
        return renderOption(entry.option, base);
      }
      return (
        <div key={`group-${entry.label}`} data-slot='group' role='group' aria-label={entry.label}>
          <div data-slot='group-label' x-class={[groupLabelRow, pickerGroupLabel]}>{entry.label}</div>
          {entry.options.map((option, i) => renderOption(option, base + i))}
        </div>
      );
    })
  );

  const listboxBody = loading ? (
    <div data-slot='loading' x-class={pickerLoadingBlock}>
      <Spinner size='sm' />
      <span>{strings.loading}</span>
    </div>
  ) : (
    <div data-slot='empty' x-class={pickerEmptyBlock}>{strings.noMatch}</div>
  );

  // Tags mode: the forwardable `disabled` rides the input (a div has
  // no native disabled), the box mirrors it as aria-disabled for the
  // visual + pointer gate (see the trigger css). The accessible name
  // routes to the input too — the box div carries no role, so an
  // aria-label spread there would name nothing.
  const {
    disabled: disabledProp,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...restWithoutDisabled
  } = rest;
  const disabled = Boolean(disabledProp);

  // The tags inline input — the focusable field of the chip-box
  // trigger (an input nested in a button would be invalid HTML, hence
  // the div box). Focus opens the panel, typing filters and re-opens,
  // and the input's own click keeps the panel open instead of letting
  // the box's handler run for it.
  const tagsInput = (
    <input
      ref={setTagsInputRef}
      data-slot='input'
      type='text'
      role='combobox'
      aria-haspopup='listbox'
      aria-expanded={open}
      aria-controls={id}
      aria-autocomplete='list'
      aria-activedescendant={activeDescendant}
      aria-label={ariaLabel ?? placeholder ?? strings.placeholder}
      aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
      placeholder={selected.length === 0 ? (placeholder ?? strings.placeholder) : ''}
      disabled={disabled}
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        setOpen(true);
      }}
      onFocus={() => setOpen(true)}
      // Clicking the field itself always means "open" (even when focus
      // already sits here — e.g. after an Escape close — no focus event
      // would fire), and the stop keeps the box's toggle from closing
      // the panel from inside the field.
      onClick={(e) => {
        e.stopPropagation();
        setOpen(true);
      }}
      onKeyDown={handleTagsKeyDown}
      x-class={[inlineInput, classNames?.searchInput]}
    />
  );

  return (
    <div x-class={wrapper}>
      {tags ? (
        <div
          // Spread first — the floating handlers below must win over a
          // spread (same rationale as the button trigger). The select →
          // button-typed rest needs the same element widening cast as
          // SelectCore's mode boundary — only the handler generics
          // differ between the two attribute sets.
          {...(restWithoutDisabled as Omit<
            ComponentPropsWithoutRef<'div'>,
            'ref' | 'children' | 'contentEditable' | 'dangerouslySetInnerHTML'
          >)}
          ref={setTagsBoxRef}
          data-slot='trigger'
          style={floating.triggerStyle}
          aria-disabled={disabled || undefined}
          data-clearable={clearable || undefined}
          onPointerDown={floating.onTriggerPointerDown}
          onClick={() => {
            // Tags boxes never toggle closed from inside: the field is
            // for typing, so any box click (input, chips gutter, caret)
            // means open — closing belongs to Escape and outside
            // pointers (Mantine TagsInput contract). The refocus also
            // survives the blur a gutter mousedown causes in real
            // engines; its focus event re-opens in the same direction.
            setOpen(true);
            searchRef.current?.focus();
          }}
          x-class={[pickerTrigger, trigger, sizes[size], className, classNames?.trigger]}
        >
          {triggerBody}
          {tagsInput}
          {clearAffordance}
          <PickerCaret x-class={caret} />
        </div>
      ) : (
        <PickerTrigger
          // Spread first — the wiring inside PickerTrigger must win
          // over a spread, or a stray onClick could disable the open
          // toggle entirely (same rationale as SelectCore's onChange
          // ordering).
          {...rest}
          ref={setTriggerRef}
          behavior={floating}
          role='combobox'
          popup='listbox'
          open={open}
          controlsId={searchable ? listboxId : id}
          activeDescendant={activeDescendant}
          data-clearable={clearable || undefined}
          onKeyDown={handleKeyDown}
          caretClassName={caret}
          x-class={[trigger, sizes[size], className, classNames?.trigger]}
        >
          {triggerBody}
          {clearAffordance}
        </PickerTrigger>
      )}
      {showPanelSearch ? (
        <FloatingPanel
          ref={panelRef}
          behavior={floating}
          placement='bottom-span'
          aria-busy={loading || undefined}
          visualClass={`${pickerPanelWidth} ${panelSearch}`}
          className={classNames?.content}
        >
          <input
            ref={searchRef}
            data-slot='input'
            type='text'
            aria-label={strings.searchLabel}
            placeholder={strings.searchPlaceholder}
            // aria-controls/aria-autocomplete reference the listbox
            // element, which only renders while options are visible —
            // dangling ids (loading, no-match) are axe violations.
            {...(hasVisibleOptions && {
              'aria-controls': listboxId,
              'aria-autocomplete': 'list' as const,
            })}
            aria-activedescendant={activeDescendant}
            x-class={[pickerSearchInput, classNames?.searchInput]}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {hasVisibleOptions ? (
            <div
              id={listboxId}
              data-slot='list'
              role='listbox'
              aria-multiselectable={isMulti || undefined}
              aria-label={strings.listboxLabel}
              x-class={virtual ? undefined : listboxInner}
            >
              {optionsList}
            </div>
          ) : (
            listboxBody
          )}
        </FloatingPanel>
      ) : (
        <FloatingPanel
          ref={panelRef}
          behavior={floating}
          placement='bottom-span'
          id={id}
          role={hasVisibleOptions ? 'listbox' : undefined}
          aria-multiselectable={hasVisibleOptions && isMulti ? 'true' : undefined}
          aria-label={strings.listboxLabel}
          aria-busy={loading || undefined}
          visualClass={
            virtual
              ? `${pickerPanelWidth} ${pickerListboxVirtual}`
              : `${pickerPanelWidth} ${pickerListbox}`
          }
          className={classNames?.content}
        >
          {hasVisibleOptions ? optionsList : listboxBody}
        </FloatingPanel>
      )}
    </div>
  );
}

export type { SelectFloatingProps, SelectVirtualizedConfig };
