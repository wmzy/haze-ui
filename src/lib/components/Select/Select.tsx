import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { SelectVirtualizedConfig } from './SelectFloating';

import { useControl } from 'react-use-control';

import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';

import { NativeHiddenFields } from '../../utils/native-form';

import SelectCore from './SelectCore';

/**
 * Semantic slot classes (AntD v6 `classNames` shape), following the
 * data-slot names: `trigger` is the focusable control (native `<select>`
 * in plain mode, trigger `<button>` in floating modes); `content` is the
 * floating panel; `option`, `clearButton`, `item`, `searchInput` cover
 * the rest. Slots not rendered by the current mode are ignored. A
 * ConfigProvider `Select.classNames` section merges under the prop.
 */
type SelectClassNames = {
  trigger?: string;
  content?: string;
  option?: string;
  clearButton?: string;
  /** Selected-value chip in multiple mode (data-slot='item'). */
  item?: string;
  /** Search input (data-slot='input'): the panel-top filter in
   * searchable mode, the inline trigger input in tags mode. */
  searchInput?: string;
};

type SelectProps<T extends string | number = string> = {
  /** The option value type: `T` in single mode, `T[]` when `multiple`
   * is set (defaults to `string`). */
  value?: ControlOrValue<T | T[]>;
  /**
   * Multiple selection mode (see SelectCoreProps.multiple). The
   * uncontrolled empty value is `[]` in this mode, `''` otherwise.
   */
  multiple?: boolean;
  /**
   * Tags mode (AntD `mode="tags"` / Mantine TagsInput shape): implies
   * `multiple` selection and `searchable` — the search input moves
   * into the trigger, which renders the selected chips and the inline
   * input as one field. Typing filters the panel's options; Enter
   * commits the highlighted option, or — when nothing matches —
   * creates a new tag from the trimmed query (highlighted `Create
   * "…"` row, deduped against existing option values and the current
   * selection). Backspace on an empty query removes the last chip.
   * Usable alone or with `multiple` set explicitly.
   */
  tags?: boolean;
  /**
   * Multiple/tags mode only: cap the selectable count. Once the
   * selection reaches `maxCount`, options that are not selected are
   * disabled — dimmed, `aria-disabled`, clicks and Enter rejected —
   * until something is deselected (selected options stay removable,
   * and the tags create row is suppressed at the cap). Works the same
   * controlled and uncontrolled; single mode ignores it.
   */
  maxCount?: number;
  /**
   * Searchable single select (see SelectCoreProps.searchable): swaps
   * the native `<select>` for the floating listbox with a panel-top
   * search input — typing filters, ↑/↓ highlight, Enter picks, Escape
   * closes. In multiple mode the same search input appears in the
   * listbox panel instead.
   */
  searchable?: boolean;
  /**
   * Clear affordance (see SelectCoreProps.clearable): a pointer-only ×
   * revealed on hover/focus-within empties the value (`[]` / `''`)
   * without toggling the panel; Backspace is the keyboard parity path.
   */
  clearable?: boolean;
  /**
   * Async option state (see SelectCoreProps.loading): the floating
   * panel's options area shows a Spinner with `aria-busy="true"` and
   * suspends search filtering until it clears.
   */
  loading?: boolean;
  /**
   * Remote search (see SelectCoreProps.onSearch): with `onSearch` set,
   * the floating panel stops filtering locally — options are entirely
   * what the consumer passes as children — and every query transition
   * of the panel's search input fires this callback (empty queries
   * included, so the consumer can restore the full list; the reset on
   * panel close reports `''` too). Pair with `loading` for the pending
   * state; debouncing is the consumer's concern. Requires `searchable`
   * (the only paths with a search input); the plain native single
   * select has no query source and ignores it.
   */
  onSearch?: (query: string) => void;
  /**
   * Multiple mode only (see SelectCoreProps.maxTagCount): cap the
   * rendered Chips; the overflow collapses into a `+N` badge whose
   * `title` lists the hidden labels.
   */
  maxTagCount?: number;
  /**
   * Render the floating option list through VirtualList so long option
   * lists mount only the visible window (plus overscan). Default
   * (omitted/`false`) keeps the plain DOM path; single mode without
   * `searchable` ignores it — the native `<select>` handles long lists
   * natively.
   */
  virtualized?: boolean | SelectVirtualizedConfig;
  /**
   * Value callback for both modes: `T` in single mode, `T[]` when
   * `multiple` is set — fired after the value updates. The native
   * select `change` event stays available through `onChange` in single
   * mode (the historical contract); the floating paths have no native
   * event.
   */
  onValuesChange?: (value: T | T[]) => void;
  /**
   * Placeholder text for the floating triggers (falls back to the
   * `select.placeholder` locale string). A native `<select>` has no
   * placeholder attribute, so plain single mode consumes and drops it.
   */
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Slot classes (see {@link SelectClassNames}); merged over any
   * ConfigProvider `Select.classNames` section, per key. */
  classNames?: SelectClassNames;
  /**
   * Forwarded to the focusable element — the native `<select>` in plain
   * and clearable single mode, the trigger `<button>` when `multiple`
   * or `searchable` render the floating engine, and the inline
   * `<input>` in tags mode. Form bridges and `ref.current.focus()`
   * reach whichever mode renders.
   */
  ref?: Ref<HTMLSelectElement | HTMLButtonElement | HTMLInputElement>;
  /**
   * Form field name: renders hidden input bridge(s) next to the control
   * so `<form action={fn}>` / `new FormData(form)` receive the value in
   * every mode — one input in single mode (String(value)), one per
   * entry under the same name in multiple mode (native repeated-field
   * semantics). The empty sentinel (`''` / `[]`) submits nothing.
   * Rerouted off the visual element because the floating trigger is a
   * `<button>`, where `name` would be submitter-scoped; react-f0rm
   * `FormItem` usage never passes it, so both worlds coexist.
   */
  name?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'select'>, 'value' | 'size' | 'multiple' | 'name'>;

export default function Select<T extends string | number = string>({
  value: valueControl,
  multiple = false,
  tags = false,
  maxCount,
  searchable = false,
  clearable = false,
  loading = false,
  onSearch,
  maxTagCount,
  virtualized,
  size,
  className,
  classNames,
  children,
  onChange,
  onValuesChange,
  placeholder,
  name,
  ref,
  ...rest
}: SelectProps<T>) {
  // Tags implies multiple semantics: the array value and the `[]`
  // uncontrolled default apply to `tags` alone as well.
  const [value, setValue] = useControl(
    valueControl,
    multiple || tags ? ([] as T[]) : ('' as T)
  );
  // ConfigProvider `Select.classNames` merges under the prop, per key.
  const config = useConfigDefaults('Select');
  const resolvedClassNames = config.classNames
    ? { ...config.classNames, ...classNames }
    : classNames;

  const handleValueChange = (next: T | T[]) => {
    setValue(next);
    onValuesChange?.(next);
  };

  // Form bridge entries: the array value verbatim in multiple mode, the
  // non-empty scalar in single mode ('' is the no-selection sentinel).
  const formEntries: T[] = Array.isArray(value)
    ? value
    : value !== ''
      ? [value]
      : [];

  return (
    <>
      <SelectCore
        ref={ref}
        value={value}
        onChange={handleValueChange}
        onNativeChange={multiple || searchable || tags ? undefined : onChange}
        multiple={multiple}
        tags={tags}
        maxCount={maxCount}
        searchable={searchable}
        clearable={clearable}
        loading={loading}
        onSearch={onSearch}
        maxTagCount={maxTagCount}
        virtualized={virtualized}
        size={size}
        className={className}
        classNames={resolvedClassNames}
        placeholder={placeholder}
        {...rest}
      >
        {children}
      </SelectCore>
      <NativeHiddenFields name={name} values={formEntries} />
    </>
  );
}

export type { SelectClassNames, SelectProps };
