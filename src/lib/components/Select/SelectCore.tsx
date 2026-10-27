import type { ComponentPropsWithoutRef, KeyboardEvent as ReactKeyboardEvent, ReactNode, Ref } from 'react';

import type { SelectVirtualizedConfig } from './SelectFloating';
import type { SelectClassNames } from './Select';

import { css } from '@linaria/core';
import { useCallback, useRef } from 'react';

import { PickerCaret, pickerNativeCaret, pickerNativeSelect } from '../../utils/picker-trigger';
import { mergeRefs } from '../../utils/refs';
import { useStrings } from '../LocaleProvider';

import SelectFloating from './SelectFloating';
import { extractSelectEntries, extractSelectOptions } from './select-options';

type SelectCoreProps<T extends string | number = string> = {
  /** The option value type: `T` in single mode, `T[]` when `multiple`
   * is set. */
  value: T | T[];
  /** Notifies the next value: `T` in single mode, `T[]` when
   * `multiple` is set. */
  onChange: (value: T | T[]) => void;
  /** Native change event passthrough — invoked with the DOM event after
   * `onChange`, so a spread can never override the controlled callback.
   * Single mode only; the floating paths have no native select element. */
  onNativeChange?: ComponentPropsWithoutRef<'select'>['onChange'];
  /**
   * Placeholder for the floating triggers (falls back to the
   * `select.placeholder` locale string). A native `<select>` has no
   * placeholder attribute, so the plain single mode consumes and drops
   * it — single mode with `searchable` renders it like the multiple
   * trigger does.
   */
  placeholder?: string;
  /**
   * Multiple selection mode (see SelectFloatingProps.multiple): chips
   * in the trigger, toggling options, panel stays open across picks.
   * Default (`false`) keeps the native single-select path untouched.
   */
  multiple?: boolean;
  /**
   * Tags mode (see SelectProps.tags in ./Select): implies multiple and
   * searchable — routes to the floating engine with the inline search
   * input in the trigger. Ignored by the native single-select path.
   */
  tags?: boolean;
  /**
   * Multiple/tags mode only: cap the selectable count — unselected
   * options disable once the cap is reached (see
   * SelectFloatingProps.maxCount). The native single-select path
   * ignores it.
   */
  maxCount?: number;
  /**
   * Swap the single-mode native `<select>` for the floating listbox
   * engine (the one `multiple` uses) with a search input at the top of
   * the panel: typing filters the options, ↑/↓ move the highlight,
   * Enter picks and closes, Escape closes. `multiple` ignores it — the
   * multiple listbox gains the same search input instead. Default
   * (`false`) keeps the native `<select>` untouched.
   */
  searchable?: boolean;
  /**
   * Show a pointer-only × clear affordance at the trigger's inline end
   * while a value is selected (revealed on hover/focus-within; keyboard
   * parity through Backspace on the trigger). Clicking it empties the
   * value (`[]` / `''`) without toggling the panel. Works in every
   * mode — on the plain single-select path the × overlays the select's
   * caret slot instead of the floating trigger.
   */
  clearable?: boolean;
  /**
   * Async option state for the floating paths: the options area shows a
   * Spinner with `aria-busy="true"` on the panel, and search filtering
   * is suspended until loading finishes. The plain single-mode native
   * `<select>` ignores it (a native select cannot render async state).
   */
  loading?: boolean;
  /**
   * Remote search for the floating paths (see SelectFloatingProps.onSearch):
   * while set, local query filtering is suspended — options are entirely
   * whatever arrives through `children` — and every query transition of
   * the panel's search input is reported here, empty queries included
   * (the consumer restores the full list). The plain single-mode native
   * `<select>` path has no query source and ignores it.
   */
  onSearch?: (query: string) => void;
  /**
   * Multiple mode only: render at most this many value Chips in the
   * trigger; the rest collapse into a `+N` badge whose `title` tooltip
   * lists the overflow labels. Selection semantics are unchanged.
   */
  maxTagCount?: number;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Render the floating option list through VirtualList so long option
   * lists mount only the visible window (plus overscan). Default
   * (omitted/`false`) keeps the plain DOM path; the plain single-mode
   * native `<select>` ignores it — it handles long lists natively.
   */
  virtualized?: boolean | SelectVirtualizedConfig;
  /**
   * Compound `<Option>` / `<OptionGroup>` children — the owning Select
   * composes its data-driven `options` in here ahead of them. Optional
   * for callers supplying entries entirely another way.
   */
  children?: ReactNode;
  className?: string;
  /** Slot classes (see SelectProps.classNames in ./Select). */
  classNames?: SelectClassNames;
  /**
   * Forwarded to the focusable element — the native `<select>` in plain
   * and clearable single mode, the trigger `<button>` when `multiple`
   * or `searchable` render the floating engine.
   */
  ref?: Ref<HTMLSelectElement | HTMLButtonElement | HTMLInputElement>;
} & Omit<
  ComponentPropsWithoutRef<'select'>,
  'value' | 'onChange' | 'size' | 'multiple'
>;

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

/**
 * Positioning host of the native single-select paths: the inline-svg
 * caret (`pickerNativeCaret`) overlays the select's reserved inline-end
 * padding from here, replacing the painted background-image caret (a
 * `url()` cannot carry a token color). Deliberately width-less — a
 * `width: 100%` here would hijack flex-item sizing from consumer
 * classes on the select itself (PhoneInput's country select), while
 * `display: block` auto width fills block parents exactly like the
 * bare select did.
 */
const nativeWrap = css`
  position: relative;
  display: block;
`;

/**
 * Clearable single-select host: same positioning contract plus the
 * full-width lock — the × overlay and the caret anchor here. The
 * attribute selector (the `[role='option']:hover &` pattern from the
 * option rows) reaches the descendant affordance from the
 * hovering/focused wrapper; `visibility`/`pointer-events` keep the
 * hidden affordance from eating clicks aimed at the select itself.
 * The wrapper only renders while `clearable` is set, so the default
 * path's DOM stays untouched.
 */
const nativeClearWrap = css`
  position: relative;
  display: block;
  width: 100%;
`;

/** The × over the native select — same visual contract as the floating
 * trigger's clear, with a solid background chip masking the painted
 * caret it overlays. */
const nativeClear = css`
  position: absolute;
  inset-inline-end: var(--haze-space-3);
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-bg);
  color: var(--haze-color-text-secondary);
  cursor: pointer;
  line-height: 1;
  z-index: var(--haze-z-local-1);
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

export default function SelectCore<T extends string | number = string>({
  value,
  onChange,
  onNativeChange,
  multiple = false,
  tags = false,
  maxCount,
  searchable = false,
  clearable = false,
  loading = false,
  onSearch,
  maxTagCount,
  size = 'md',
  virtualized,
  className,
  classNames,
  placeholder,
  children,
  ref,
  ...rest
}: SelectCoreProps<T>) {
  const strings = useStrings('select');
  const selectRef = useRef<HTMLSelectElement>(null);
  // The consumer's ref merges onto the native select in the clearable
  // branch (the internal handle restores focus after the × clear).
  const setNativeSelectRef = useCallback(
    (node: HTMLSelectElement | null) =>
      mergeRefs(selectRef, ref as Ref<HTMLSelectElement> | undefined)(node),
    [selectRef, ref]
  );

  if (multiple || searchable || tags) {
    return (
      <SelectFloating<T>
        ref={ref as Ref<HTMLButtonElement | HTMLInputElement> | undefined}
        value={value}
        onChange={onChange}
        entries={extractSelectEntries<T>(children)}
        multiple={multiple}
        tags={tags}
        maxCount={maxCount}
        searchable={searchable}
        clearable={clearable}
        loading={loading}
        onSearch={onSearch}
        maxTagCount={maxTagCount}
        size={size}
        virtualized={virtualized}
        className={className}
        classNames={classNames}
        placeholder={placeholder}
        // Select-typed passthrough re-hosted on the floating trigger's
        // button: only the element-generic event handler types differ
        // between the two attribute sets, so this one widening cast at
        // the mode boundary is sound. Omitted to the shape
        // SelectFloating reserves for its own props, so the spread
        // cannot shadow them.
        {...(rest as Omit<
          ComponentPropsWithoutRef<'button'>,
          'value' | 'onChange' | 'size' | 'type' | 'children'
        >)}
      />
    );
  }

  // Single mode's value is the raw T (the empty sentinel stays '' for
  // every T — the uncontrolled default in ./Select); a stray array is
  // normalized to empty, the same contract as the floating path. (The
  // multiple/searchable/tags early return above already narrowed multiple
  // away, so only the array check remains.)
  const selectedValue = (!Array.isArray(value) ? value : '') as T;

  // The DOM stringifies <option> values, so the native single-mode path
  // reports the stringified form: map it back to the raw option value
  // (extraction reads the JSX props, which keep it) so a number-valued
  // Select keeps its type. An unmatched DOM value (no such option)
  // falls back to the string verbatim.
  const valueFromDom = (dom: string): T => {
    const raw = extractSelectOptions<T>(children).find(
      (o) => String(o.value) === dom
    )?.value;
    return raw !== undefined ? raw : (dom as T);
  };

  // Clearable single select without searchable: keep the native element
  // and overlay the affordance. The consumer's onKeyDown (still inside
  // `rest`) must run after the Backspace-clear branch, so it is pulled
  // out and chained here.
  if (clearable) {
    const { onKeyDown: consumerKeyDown, ...restWithoutKeyDown } = rest;

    return (
      <span
        x-class={nativeClearWrap}
        data-clearable={selectedValue !== '' || undefined}
      >
        <select
          ref={setNativeSelectRef}
          data-slot='trigger'
          x-class={[pickerNativeSelect, sizes[size], className, classNames?.trigger]}
          value={selectedValue}
          onChange={(e) => {
            onChange(valueFromDom(e.target.value));
            onNativeChange?.(e);
          }}
          onKeyDown={(e: ReactKeyboardEvent<HTMLSelectElement>) => {
            // Keyboard parity for the pointer-only × (the same
            // rationale as the floating trigger's Backspace clear).
            if (e.key === 'Backspace' && selectedValue !== '') {
              e.preventDefault();
              onChange('' as T);
              return;
            }
            consumerKeyDown?.(e);
          }}
          {...restWithoutKeyDown}
        >
          {children}
        </select>
        {selectedValue !== '' && (
          <span
            aria-hidden='true'
            data-slot='clear-button'
            title={strings.clear}
            x-class={[nativeClear, classNames?.clearButton]}
            onClick={(e) => {
              // The span is a sibling overlay, so the click never
              // reaches the select — no dropdown opens. Focus is
              // restored explicitly: clicking a non-focusable span
              // would otherwise drop it to body.
              e.stopPropagation();
              onChange('' as T);
              selectRef.current?.focus();
            }}
          >
            ×
          </span>
        )}
        <PickerCaret x-class={pickerNativeCaret} />
      </span>
    );
  }

  return (
    <span x-class={nativeWrap}>
      <select
        ref={ref as Ref<HTMLSelectElement> | undefined}
        data-slot='trigger'
        x-class={[pickerNativeSelect, sizes[size], className, classNames?.trigger]}
        value={selectedValue}
        onChange={(e) => {
          onChange(valueFromDom(e.target.value));
          onNativeChange?.(e);
        }}
        {...rest}
      >
        {children}
      </select>
      <PickerCaret x-class={pickerNativeCaret} />
    </span>
  );
}

export type { SelectCoreProps };
