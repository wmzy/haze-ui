import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { VirtualListHandle } from '../VirtualList';

import type { ComboboxOptionData } from './combobox-options';

import { css } from '@linaria/core';
import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { useControl } from 'react-use-control';


import { FloatingPanel, useFloating } from '../../utils/floating';
import { fieldChrome, fieldSizes, nativeFieldChrome } from '../../utils/field-skin';
import { PickerOverflowBadge } from '../../utils/picker-chips';
import {
  pickerGroupLabel,
  pickerListbox,
  pickerListboxVirtual,
  pickerPanelWidth,
  pickerVirtualRow,
} from '../../utils/picker-trigger';
import { mergeRefs } from '../../utils/refs';
import { findMatchRanges } from '../../utils/text-match';
import { useHighlightScroll } from '../../utils/use-highlight-scroll';
import { useListboxNavigation } from '../../utils/use-listbox-navigation';
import { useSearchReport } from '../../utils/use-search-report';
import Chip from '../Chip/Chip';
import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';
import { useStrings } from '../LocaleProvider';
import { formatString } from '../LocaleProvider/locale';
import Spinner from '../Spinner/Spinner';
import { VirtualList } from '../VirtualList';

import ComboboxGroup from './ComboboxGroup';
import ComboboxOption from './ComboboxOption';
import { extractComboboxOptions } from './combobox-options';

/** Metrics override for the `virtualized` option list of Combobox. */
type ComboboxVirtualizedConfig = {
  /**
   * Row height in px of one option row. Defaults to 37 —
   * ComboboxOption's natural box: space-2 padding top+bottom + text-sm
   * at leading-normal = 8 + 21 + 8. Virtualization math needs it as a
   * JS number; rows are stretched to fill it (`pickerVirtualRow`,
   * utils/picker-trigger), so the two cannot drift apart.
   */
  itemHeight?: number;
  /** Extra rows kept mounted above/below the visible window. Defaults
   * to VirtualList's 5. */
  overscan?: number;
};

/**
 * Semantic slot classes for Combobox (keys follow the data-slot names;
 * see the `classNames` prop on {@link ComboboxProps}).
 */
type ComboboxClassNames = {
  root?: string;
  input?: string;
  item?: string;
  empty?: string;
};

type ComboboxProps<T extends string | number = string> = {
  /**
   * The option value type: `T` in single mode, `T[]` when `multiple`
   * is set (defaults to `string`). The uncontrolled empty value is `''`
   * in single mode, `[]` in multiple mode.
   */
  value?: ControlOrValue<T | T[]>;
  open?: ControlOrValue<boolean>;
  /**
   * Data-driven option entries (the Select `options` / Menu `items`
   * precedent): `{value, label, disabled?, group?}` objects. Optional
   * when compound children supply the rows — the two forms compose,
   * with the data options rendering first and the children after.
   */
  options?: ComboboxOptionData<T>[];
  /**
   * Declarative compound children (the Select authoring form):
   * `<ComboboxOption value>` rows, optionally inside
   * `<ComboboxGroup label>` sections, flatten into the same option
   * data the `options` prop takes — both forms behave identically.
   */
  children?: ReactNode;
  /**
   * Multiple-selection mode: selected values render as chips inside
   * the trigger, Enter toggles the highlighted option without closing
   * the panel, and Backspace on an empty query drops the most recently
   * selected chip.
   */
  multiple?: boolean;
  /**
   * Multiple mode only: cap the selectable count. Once the selection
   * reaches `maxCount`, options that are not selected are disabled —
   * dimmed, `aria-disabled`, clicks and Enter rejected — until
   * something is deselected (selected options stay removable, and the
   * creatable row is suppressed at the cap). Works the same
   * controlled and uncontrolled; single mode ignores it.
   */
  maxCount?: number;
  /**
   * Multiple mode only: cap the rendered chips; the rest collapse into
   * a `+N` badge whose `title` tooltip lists the overflow labels.
   * Selection semantics are unchanged — the badge is presentational
   * (removal stays through the panel, a chip's ×, or Backspace).
   */
  maxTagCount?: number;
  /**
   * Value callback for both modes — `T` in single mode, `T[]` when
   * `multiple` is set — fired after the value updates.
   */
  onValuesChange?: (value: T | T[]) => void;
  /**
   * Offer the current query as a creatable option: when nothing
   * matches a non-blank query, a localized `Create "…"` row renders at
   * the top of the list. Committing it calls `onCreate` and appends the
   * new value to a local option set layered on top of `options` — the
   * controlled `options` array is never mutated, and local creations
   * are dropped when the component unmounts (re-pass `options` to own
   * them permanently).
   */
  creatable?: boolean;
  /** Fired with the created query when the creatable row is committed. */
  onCreate?: (query: string) => void;
  /**
   * Remote search: while set, local query filtering is suspended — the
   * list renders exactly the `options` the consumer passes — and every
   * query transition fires this callback instead: each keystroke,
   * clearing the input, and the resets that follow a selection (the
   * empty query restores the full list). The consumer owns the options
   * end to end; pair with `loading` for the pending state. Debouncing
   * is the consumer's concern.
   */
  onSearch?: (query: string) => void;
  /**
   * Async-search pending state: the combobox input carries
   * `aria-busy` and the panel shows a spinner row instead of the
   * (stale) option list.
   */
  loading?: boolean;
  /**
   * Wrap the case-insensitive query match inside each option label in
   * a token-styled `<mark>` (first occurrence; the label stays one
   * text node otherwise). Off by default so the un-enabled rendering
   * stays byte-identical; works through the virtualized path too.
   */
  highlightMatches?: boolean;
  /**
   * Custom no-results content for the empty filtered list. Defaults to
   * the `combobox.noResults` locale string.
   */
  empty?: ReactNode;
  /**
   * Panel max height in px: caps the plain listbox's scroll box and
   * the virtualized scrollport alike. Defaults to 200 (the historical
   * cap); omitted leaves the DOM untouched.
   */
  maxHeight?: number;
  placeholder?: string;
  /**
   * Render the dropdown through VirtualList once the filtered list is
   * longer than this many options. Defaults to 100; 0 disables
   * virtualization entirely (plain DOM rendering at any length).
   */
  virtualThreshold?: number;
  /**
   * Explicit VirtualList override, bypassing `virtualThreshold`: `true`
   * (or an object) always renders the list virtually — at any length,
   * including below the threshold — while an object additionally
   * customizes row metrics; `false` never virtualizes, even past the
   * threshold. Omitted (default) keeps the threshold behavior
   * untouched.
   */
  virtualized?: boolean | ComboboxVirtualizedConfig;
  className?: string;
  /**
   * Slot classes (AntD v6 `classNames` shape), following the data-slot
   * names: `root` (the positioning wrapper), `input` (the combobox
   * field), `item` (each option row), `empty` (the no-match state
   * block). A ConfigProvider `Combobox.classNames` section merges under
   * the prop, per key.
   */
  classNames?: ComboboxClassNames;
  /**
   * Forwarded to the combobox `<input>` — the focusable field in both
   * single and multiple mode (multiple mode's chip box wraps it but is
   * not itself the combobox) — so form bridges and
   * `ref.current.focus()` reach.
   */
  ref?: Ref<HTMLInputElement>;
};

const wrapper = css`
  position: relative;
  display: inline-block;
  width: 100%;
`;

/**
 * The single-mode trigger input over the shared field recipe
 * (utils/field-skin: `fieldChrome` + `nativeFieldChrome` +
 * `fieldSizes.md`): only the box-sizing delta Input keeps local — the
 * shared classes carry the surface, sizing, typography, focus ring,
 * placeholder token, hover and disabled arms.
 */
const input = css`
  box-sizing: border-box;
`;

/**
 * Multiple-mode trigger: a chip box wrapping the bare search input.
 * The box owns the border/focus chrome (`:focus-within` mirrors the
 * single input's ring token for token) and the floating anchor; the
 * input inside is chromeless and grows to fill the remaining row
 * (`min-width` keeps it typeable once chips wrap).
 */
const multiBox = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--haze-space-1);
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  cursor: text;
  padding: var(--haze-space-1) var(--haze-space-2);
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &:focus-within {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/** The bare query input inside the multiple-mode chip box. */
const multiInput = css`
  flex: 1;
  min-width: 4rem;
  border: none;
  outline: none;
  background: transparent;
  padding: var(--haze-space-1) 0;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);

  &::placeholder {
    color: var(--haze-color-text-muted);
  }
`;

/**
 * Query-match highlight inside an option label. Only token colors —
 * the `mark` element's UA chrome (yellow/black) is fully replaced.
 */
const matchMark = css`
  background: var(--haze-color-primary-subtle);
  color: var(--haze-color-primary);
  border-radius: var(--haze-radius-sm);
  padding: 0;
`;

/**
 * Loading spinner row / no-results row. Rendered as an aria-disabled
 * option so the listbox's owned-element contract stays satisfied while
 * nothing is actually selectable (PromptInput's pattern).
 */
const stateRow = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2) var(--haze-space-3);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
  cursor: default;
`;

/** Scrollport height of the virtualized list — the plain listbox's
 * `max-height` cap (`pickerListbox`, utils/picker-trigger), so both
 * modes are equally tall at the limit; shorter lists size to their rows
 * (min at the call site), matching the non-virtualized content-driven
 * height. */
const VIRTUAL_LIST_HEIGHT = 200;

/** Fixed row height for the virtualized path: ComboboxOption's natural
 * box — space-2 padding top+bottom + text-sm at leading-normal =
 * 8 + 21 + 8. Virtualization math needs it as a JS number; rows are
 * stretched to fill it (`pickerVirtualRow`, utils/picker-trigger), so
 * the two cannot drift apart. */
const OPTION_ROW_HEIGHT = 37;

/**
 * Wraps the first case-insensitive occurrence of `query` inside
 * `label` with a token-styled `<mark>` — the first range of the shared
 * matcher (utils/text-match, the same primitive Highlight and Tree
 * search use). An empty query or a miss returns the label verbatim —
 * the un-highlighted DOM stays byte-identical to the historical
 * plain-text children.
 */
function highlightLabel(label: string, query: string): ReactNode {
  const [range] = findMatchRanges(label, query);
  if (!range) return label;
  const [start, end] = range;
  return (
    <>
      {label.slice(0, start)}
      <mark data-slot='match' x-class={[matchMark]}>{label.slice(start, end)}</mark>
      {label.slice(end)}
    </>
  );
}

/** One flat option row plus its index in the navigable item list. */
type IndexedOption<T extends string | number = string> = {
  option: ComboboxOptionData<T>;
  index: number;
};

/** A labelled group section, or a run of groupless direct rows. */
type OptionSection<T extends string | number = string> = {
  key: string;
  label: string | undefined;
  rows: IndexedOption<T>[];
};

export default function Combobox<T extends string | number = string>({
  value: valueControl,
  open: openControl,
  options,
  children,
  multiple = false,
  maxCount,
  maxTagCount,
  onValuesChange,
  creatable = false,
  onCreate,
  onSearch,
  loading = false,
  empty,
  highlightMatches = false,
  maxHeight,
  placeholder,
  virtualThreshold = 100,
  virtualized: virtualizedProp,
  className,
  classNames,
  ref,
}: ComboboxProps<T>) {
  // ConfigProvider `Combobox.classNames` merges under the prop, per key.
  const comboboxConfig = useConfigDefaults('Combobox');
  const resolvedClassNames = comboboxConfig.classNames
    ? { ...comboboxConfig.classNames, ...classNames }
    : classNames;
  const strings = useStrings('combobox');
  // The `+N` overflow badge shares Select's `moreTags` string —
  // Combobox has no own key for it and layering a new one would
  // ripple through every built-in locale pack for the same symbol
  // (the mirror of Select's tags row reusing `combobox.create`).
  const selectStrings = useStrings('select');
  const [value, setValue] = useControl(valueControl, multiple ? ([] as T[]) : ('' as T));
  // Locally created options (creatable) layered on top of `options` —
  // see the `creatable` prop doc for the lifetime contract.
  const [created, setCreated] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useControl(openControl, false);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  // The consumer's ref rides the same combobox input the floating
  // behavior anchors on (the focusable field in both modes).
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => mergeRefs(inputRef, ref)(node),
    [inputRef, ref]
  );
  const boxRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<VirtualListHandle>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

  const floating = useFloating({
    open,
    setOpen,
    // The multiple-mode chip box anchors the panel (its width, not the
    // shrunken input's); single mode anchors the input itself.
    triggerRef: multiple ? boxRef : inputRef,
    panelRef,
    animated: true,
  });

  // In multiple mode the selection is the array value; single mode
  // compares against the string value directly.
  const selected = Array.isArray(value) ? value : [];

  // maxCount cap: unselected options are locked once the selection
  // reaches it (selected entries stay removable) — Select's contract.
  const maxCountReached =
    multiple && maxCount !== undefined && selected.length >= maxCount;

  // The base option set: the data-driven `options` first, then the
  // declarative compound children flattened into the same shape — one
  // authoring pipeline, both forms composing (Select's contract).
  const dataOptions = useMemo(
    () => [...(options ?? []), ...extractComboboxOptions<T>(children)],
    [options, children]
  );

  // Creatable appends live until unmount — the composed base is never
  // mutated (it is controlled by the consumer), and additions dedupe
  // against it by value. Created values are the typed query (a
  // string): for a non-string T the consumer receives it through
  // `onCreate` and owns promoting it into `options`.
  const effectiveOptions = useMemo(() => {
    if (created.length === 0) return dataOptions;
    const existing = new Set<unknown>(dataOptions.map((o) => o.value));
    const additions = created
      .filter((v) => !existing.has(v))
      .map((v): ComboboxOptionData<T> => ({ value: v as T, label: v }));
    return additions.length > 0 ? [...dataOptions, ...additions] : dataOptions;
  }, [dataOptions, created]);

  // Remote mode (onSearch set) never filters locally — the visible
  // list is exactly the consumer's current options, refetched per
  // query. Creatable's local layering still applies on top.
  // Local filtering mirrors Select's filterSelectEntries contract:
  // the needle trims first, so a blank (whitespace-only) query keeps
  // the full list instead of matching nothing.
  const trimmedQuery = query.trim();
  const filtered = onSearch
    ? effectiveOptions
    : trimmedQuery === ''
      ? effectiveOptions
      : effectiveOptions.filter((o) =>
          o.label.toLowerCase().includes(trimmedQuery.toLowerCase())
        );

  // Creatable row: offered only when nothing matches a non-blank query
  // (an exact label match is itself an `includes` match, so it suppresses
  // the row) and only below the maxCount cap (Select's contract: the
  // create row is suppressed once the selection is full). It leads the
  // navigable list, so keyboard and aria-set semantics treat it as a
  // regular option.
  const showCreateItem =
    creatable &&
    !loading &&
    !maxCountReached &&
    query.trim() !== '' &&
    filtered.length === 0;
  const createText = formatString(strings.create, { query: trimmedQuery });
  const listItems: ComboboxOptionData<T>[] = showCreateItem
    ? // The creatable row's value is the raw string query layered on
      // top of T-typed options (see the creatable note above).
      [{ value: trimmedQuery as T, label: trimmedQuery }, ...filtered]
    : filtered;

  // The clamped flat-index highlight shared with Select
  // (utils/use-listbox-navigation); every consumed navigation key also
  // opens the panel from the closed state (a no-op while open). Home/
  // End join the skeleton here — Select always had them. A changed
  // query clears the highlight during render, so the first filtered
  // frame drops any stale highlight without an extra effect pass.
  const { activeIndex: highlightIndex, handleNavigationKey } =
    useListboxNavigation(listItems.length, () => setOpen(true), {
      query,
      reset: 'none',
    });

  // Explicit `virtualized` override: object config enables at any
  // length and customizes metrics, `true` enables with defaults,
  // `false` disables outright. Omitted keeps the threshold behavior
  // (byte-identical to the historical rendering path).
  const virtualConfig =
    typeof virtualizedProp === 'object' ? virtualizedProp : undefined;
  const forced =
    virtualizedProp === undefined ? undefined : !!virtualizedProp;
  const virtualized =
    forced ?? (virtualThreshold > 0 && listItems.length > virtualThreshold);
  const rowHeight = virtualConfig?.itemHeight ?? OPTION_ROW_HEIGHT;
  const overscan = virtualConfig?.overscan;

  // Stable, SSR-safe DOM id per option row: listbox id + index, both
  // deterministic across renders and re-opens (no random values). The
  // input's aria-activedescendant points here so screen readers announce
  // the keyboard highlight on options that never receive DOM focus.
  const optionId = (index: number) => `${id}-option-${index}`;

  // Only while the popup is open — a closed listbox must not own the
  // input's active descendant, even though the highlight itself persists
  // for reopen recovery. No highlight (or an out-of-range one after the
  // option list shrank) omits the attribute entirely.
  const activeDescendant =
    open && listItems[highlightIndex] ? optionId(highlightIndex) : undefined;

  // Cluster the flat item list into sections: consecutive items sharing
  // a `group` label fall under one heading; groupless items stay direct
  // listbox children. Keyboard order stays the flat order, so arrows
  // cross group boundaries continuously.
  const sections: OptionSection<T>[] = [];
  for (let i = 0; i < listItems.length; i++) {
    const option = listItems[i];
    if (option === undefined) continue;
    const prev = sections[sections.length - 1];
    if (option.group !== undefined && prev?.label === option.group) {
      prev.rows.push({ option, index: i });
      continue;
    }
    sections.push(
      option.group === undefined
        ? { key: `row-${option.value}`, label: undefined, rows: [{ option, index: i }] }
        : {
            key: `group-${option.group}`,
            label: option.group,
            rows: [{ option, index: i }],
          }
    );
  }
  const hasGroups = sections.some((s) => s.label !== undefined);

  useHighlightScroll({
    shown: floating.shown,
    highlightIndex,
    virtualized,
    listRef,
    rowRef: activeRowRef,
  });

  useSearchReport(onSearch, query);

  const isSelected = (val: T) =>
    multiple ? selected.includes(val) : value === val;

  const labelFor = (optionValue: T): string =>
    effectiveOptions.find((o) => o.value === optionValue)?.label ??
    String(optionValue);

  const selectOption = (val: T, labelOverride?: string) => {
    const label =
      labelOverride ??
      effectiveOptions.find((o) => o.value === val)?.label ??
      String(val);
    if (multiple) {
      // maxCount rejection: the row's aria-disabled state already
      // stops the pointer path; this guard is what enforces the cap
      // for the keyboard path and controlled values alike (Select's
      // toggleOption contract).
      if (maxCountReached && !selected.includes(val)) return;
      // Toggle in place; the panel stays open for the next pick and the
      // query clears so the full list is reachable again.
      const next = selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val];
      setValue(next);
      onValuesChange?.(next);
      setQuery('');
    } else {
      setValue(val);
      onValuesChange?.(val);
      setQuery(label);
      setOpen(false);
    }
    inputRef.current?.focus();
  };

  const commitCreate = () => {
    onCreate?.(trimmedQuery);
    setCreated((prev) =>
      prev.includes(trimmedQuery) ? prev : [...prev, trimmedQuery]
    );
    selectOption(trimmedQuery as T, trimmedQuery);
  };

  // Click and Enter funnel through one path: the create row commits a
  // creation; a disabled option is inert (the same contract the click
  // row's aria-disabled state promises); anything else
  // selects/toggles the option.
  const handleSelect = (val: T) => {
    // The create row (when shown) leads the list and carries the raw
    // string query as its value.
    if (showCreateItem && val === (trimmedQuery as T)) {
      commitCreate();
      return;
    }
    if (effectiveOptions.find((o) => o.value === val)?.disabled) return;
    selectOption(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // The shared Arrow/Home/End skeleton (clamped highlight + open from
    // the closed state) consumes the navigation keys; the site keys
    // below compose after it.
    if (handleNavigationKey(e)) return;
    if (
      e.key === 'Enter' &&
      highlightIndex >= 0 &&
      listItems[highlightIndex]
    ) {
      e.preventDefault();
      handleSelect(listItems[highlightIndex].value);
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (
      // Keyboard parity for the chips' pointer ×: Backspace on an empty
      // query drops the most recently selected value.
      e.key === 'Backspace' &&
      multiple &&
      query === '' &&
      selected.length > 0
    ) {
      e.preventDefault();
      const next = selected.slice(0, -1);
      setValue(next);
      onValuesChange?.(next);
    }
  };

  // One option row, shared by the plain sections and the virtualized
  // renderItem so both paths stay in lockstep (aria ids, set semantics,
  // highlight, matching-mark children).
  const renderRow = (o: ComboboxOptionData<T>, i: number, virtual: boolean) => (
    <ComboboxOption
      key={o.value}
      ref={!virtual && i === highlightIndex ? activeRowRef : undefined}
      value={o.value}
      disabled={
        o.disabled === true ||
        // The maxCount lock joins the option-level disabled under the
        // same inert-row contract (Select's renderOption); the create
        // row is never locked — it is suppressed at the cap instead.
        (multiple && maxCountReached && !isSelected(o.value))
      }
      id={optionId(i)}
      setSize={listItems.length}
      posInSet={i + 1}
      highlighted={i === highlightIndex}
      selected={isSelected(o.value)}
      onSelect={handleSelect}
      x-class={[virtual && pickerVirtualRow, resolvedClassNames?.item]}
    >
      {showCreateItem && i === 0
        ? createText
        : highlightMatches
          ? highlightLabel(o.label, query)
          : o.label}
    </ComboboxOption>
  );

  // The shared combobox input. In single mode it is the trigger itself;
  // in multiple mode it sits chromeless inside the chip box, which owns
  // the pointer open/toggle path (an input click must not double-fire
  // through both elements).
  const triggerInput = (
    <input
      ref={setInputRef}
      data-slot='input'
      role="combobox"
      style={multiple ? undefined : floating.triggerStyle}
      aria-expanded={open}
      aria-controls={id}
      aria-autocomplete="list"
      aria-activedescendant={activeDescendant}
      aria-busy={loading || undefined}
      x-class={
        multiple
          ? [multiInput, resolvedClassNames?.input]
          : [
              fieldChrome,
              nativeFieldChrome,
              fieldSizes.md,
              input,
              resolvedClassNames?.input,
            ]
      }
      value={query}
      placeholder={placeholder}
      onChange={(e) => {
        setQuery(e.target.value);
        setOpen(true);
      }}
      onPointerDown={multiple ? undefined : floating.onTriggerPointerDown}
      onClick={multiple ? undefined : floating.onTriggerClick}
      onKeyDown={handleKeyDown}
    />
  );

  return (
    <div data-slot='combobox' x-class={[wrapper, className, resolvedClassNames?.root]}>
      {multiple ? (
        <div
          ref={boxRef}
          data-slot='trigger'
          style={floating.triggerStyle}
          x-class={multiBox}
          // Open on click (via the suppression-aware toggle), never on
          // pointer-driven focus — the same race the single input avoids.
          onPointerDown={floating.onTriggerPointerDown}
          onClick={() => {
            floating.onTriggerClick();
            inputRef.current?.focus();
          }}
        >
          {(maxTagCount === undefined
            ? selected
            : selected.slice(0, Math.max(maxTagCount, 0))
          ).map((v) => (
            <span
              key={v}
              data-slot='item'
              // Swallow the box's toggle so removing a chip never closes
              // (or opens) the panel. Pointerdown still bubbles: floating
              // attributes the gesture to the trigger, keeping light
              // dismiss away from chip removals.
              onClick={(e) => e.stopPropagation()}
            >
              <Chip color="primary" onClose={() => {
                const next = selected.filter((x) => x !== v);
                setValue(next);
                onValuesChange?.(next);
              }}>
                {labelFor(v)}
              </Chip>
            </span>
          ))}
          <PickerOverflowBadge
            values={selected}
            maxTagCount={maxTagCount}
            titleOf={labelFor}
            moreTags={selectStrings.moreTags}
          />
          {triggerInput}
        </div>
      ) : (
        triggerInput
      )}
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement="bottom-span"
        id={id}
        role="listbox"
        aria-multiselectable={multiple ? 'true' : undefined}
        visualClass={
          virtualized
            ? `${pickerPanelWidth} ${pickerListboxVirtual}`
            : `${pickerPanelWidth} ${pickerListbox}`
        }
        style={
          maxHeight !== undefined && !virtualized
            ? { maxHeight: `${maxHeight}px` }
            : undefined
        }
      >
        {loading ? (
          <div
            role="option"
            data-slot='loading'
            aria-selected={false}
            aria-disabled="true"
            x-class={[stateRow]}
          >
            <Spinner size="sm" />
          </div>
        ) : listItems.length === 0 ? (
          <div
            role="option"
            data-slot='empty'
            aria-selected={false}
            aria-disabled="true"
            x-class={[stateRow, resolvedClassNames?.empty]}
          >
            {empty ?? strings.noResults}
          </div>
        ) : virtualized ? (
          <VirtualList
            ref={listRef}
            data-virtualized
            items={listItems}
            height={Math.min(
              maxHeight ?? VIRTUAL_LIST_HEIGHT,
              listItems.length * rowHeight
            )}
            itemHeight={rowHeight}
            overscan={overscan}
            groups={
              hasGroups
                ? sections
                    .filter((s) => s.label !== undefined)
                    .map((s) => ({
                      startIndex: s.rows[0]?.index ?? 0,
                      key: s.key,
                      render: () => (
                        <div data-slot='group-label' x-class={[pickerGroupLabel]}>{s.label}</div>
                      ),
                    }))
                : undefined
            }
            renderItem={(o, i) => renderRow(o, i, true)}
          />
        ) : (
          sections.flatMap((section) =>
            section.label === undefined
              ? section.rows.map(({ option, index }) =>
                  renderRow(option, index, false)
                )
              : [
                  <ComboboxGroup key={section.key} label={section.label}>
                    {section.rows.map(({ option, index }) =>
                      renderRow(option, index, false)
                    )}
                  </ComboboxGroup>,
                ]
          )
        )}
      </FloatingPanel>
    </div>
  );
}

export type { ComboboxClassNames, ComboboxProps, ComboboxVirtualizedConfig, ComboboxOptionData };
