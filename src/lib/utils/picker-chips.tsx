/* eslint-disable react-refresh/only-export-components --
   internal primitives module (skin classes + chip components), not a
   fast-refresh boundary; consumers re-render through their own
   files. */
import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import Chip from '../components/Chip/Chip';
import { formatString } from '../components/LocaleProvider/locale';

import { pickerOverflowBadge } from './picker-trigger';

/**
 * Shared chip-row affordances of the picker triggers (Select's
 * floating multiple/tags paths, TreeSelect's multiple trigger,
 * Combobox's overflow badge): the chip capsule row item with its
 * pointer-only remove ×, the pointer-only clear affordance (skin plus
 * the PickerClearButton glyph), and the `maxTagCount` `+N` overflow
 * badge built on `pickerOverflowBadge`
 * (utils/picker-trigger). The trigger shapes themselves (gap,
 * flex-wrap, padding, font-size) stay local per family — the drift
 * discipline of utils/picker-trigger's NOT-shared list.
 */

/** One selected value: the Chip capsule plus its pointer-only remove ×. */
export const pickerChipItem = css`
  display: inline-flex;
  align-items: center;
`;

/**
 * Pointer-only remove affordance. A real button here would nest
 * interactive controls inside the trigger button — invalid HTML, an axe
 * `nested-interactive` violation, and a screen-reader mess. The span is
 * aria-hidden and unreachable by Tab on purpose: keyboard users remove
 * values through the panel (Select's listbox toggles, TreeSelect's
 * checkboxes) or Backspace on the trigger where available — the same
 * trade-off Ant Design's multiple select makes.
 */
export const pickerChipRemove = css`
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
 * `pickerChipRemove`). Revealed on trigger hover/focus-within through
 * the `[data-clearable]` ancestor selector (the `[role='option']:hover &`
 * pattern from the option rows); hidden otherwise — `visibility` +
 * `pointer-events` keep the invisible affordance from eating clicks
 * aimed at the caret. The solid background chip masks the painted caret
 * slot it occupies (SelectCore's native-select overlay keeps its own
 * positioned copy, `nativeClear`, for the same reason).
 */
export const pickerClearBtn = css`
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

type PickerOverflowBadgeProps<T extends string | number = string> = {
  /** The committed selection (the multiple-mode value). */
  values: readonly T[];
  /** The picker's `maxTagCount` cap; `undefined` never renders the badge. */
  maxTagCount: number | undefined;
  /** Plain-text form of a value, for the badge's `title` tooltip. */
  titleOf: (value: T) => string;
  /** The `moreTags` locale template (`{count}`-shaped). */
  moreTags: string;
};

/**
 * The `+N` overflow badge of a picker trigger's `maxTagCount`: the
 * values past the cap collapsed into one pill, with the full overflow
 * label list in the native `title` tooltip. Presentational — selection
 * lives in the value, removal happens through the panel or the clear
 * affordance. Rendered internally by {@link PickerChips}; Combobox's
 * chip row keeps its own `Chip onClose` markup (a real remove button,
 * no nested-interactive constraint) and composes just this badge.
 */
export function PickerOverflowBadge<T extends string | number = string>({
  values,
  maxTagCount,
  titleOf,
  moreTags,
}: PickerOverflowBadgeProps<T>) {
  const overflow =
    maxTagCount === undefined ? [] : values.slice(Math.max(maxTagCount, 0));
  if (overflow.length === 0) return null;
  return (
    <span
      data-slot='overflow-badge'
      x-class={pickerOverflowBadge}
      title={overflow.map(titleOf).join(', ')}
    >
      {formatString(moreTags, { count: overflow.length })}
    </span>
  );
}

type PickerChipsProps<T extends string | number = string> = {
  /** The committed selection (the multiple-mode value). */
  values: readonly T[];
  /** Chip label of a value. */
  labelOf: (value: T) => ReactNode;
  /** Plain-text form of a value, for the overflow badge's `title`. */
  titleOf: (value: T) => string;
  /** The picker's `maxTagCount` cap; `undefined` renders every chip. */
  maxTagCount: number | undefined;
  /** Chip removal — receives the value of the remove × clicked. */
  onRemove: (value: T) => void;
  /** The `moreTags` locale template (`{count}`-shaped). */
  moreTags: string;
  /** Consumer slot class of the chip row item (`classNames.item`). */
  itemClassName?: string;
};

/**
 * The chip row of a multiple picker trigger (Select's floating
 * multiple/tags paths, TreeSelect): the first `maxTagCount` values as
 * Chip capsules with pointer-only remove ×s, the rest collapsed into
 * the shared overflow badge.
 */
export function PickerChips<T extends string | number = string>({
  values,
  labelOf,
  titleOf,
  maxTagCount,
  onRemove,
  moreTags,
  itemClassName,
}: PickerChipsProps<T>) {
  const visible =
    maxTagCount === undefined
      ? values
      : values.slice(0, Math.max(maxTagCount, 0));
  return (
    <>
      {visible.map((v) => (
        <span data-slot='item' x-class={[pickerChipItem, itemClassName]} key={v}>
          <Chip color='primary'>{labelOf(v)}</Chip>
          <span
            aria-hidden='true'
            data-slot='item-remove'
            x-class={pickerChipRemove}
            onClick={(e) => {
              // Keep the trigger's open toggle out of this click —
              // removing a chip must not close (or open) the panel.
              e.stopPropagation();
              onRemove(v);
            }}
          >
            ×
          </span>
        </span>
      ))}
      <PickerOverflowBadge
        values={values}
        maxTagCount={maxTagCount}
        titleOf={titleOf}
        moreTags={moreTags}
      />
    </>
  );
}

type PickerClearButtonProps = {
  /** Tooltip copy of the affordance (the locale `clear` string). */
  title: string;
  /** The clear action. The component swallows the click itself so
   * clearing never flips the panel; focus return, where the family
   * owes it, rides this closure. */
  onClear: () => void;
  /** Consumer slot class of the affordance (`classNames.clearButton`). */
  className?: string;
};

/**
 * The pointer-only clear affordance of a picker trigger
 * (`data-slot='clear-button'`, aria-hidden): the `×` that empties the
 * value (`[]` / `''`) without toggling the panel. A real button here
 * would nest interactive elements inside the trigger, so the glyph is
 * inert chrome — the keyboard parity (Backspace/clear paths) lives in
 * each family's keydown. Select's floating paths and TreeSelect render
 * it.
 */
export function PickerClearButton({
  title,
  onClear,
  className,
}: PickerClearButtonProps) {
  return (
    <span
      aria-hidden='true'
      data-slot='clear-button'
      title={title}
      x-class={[pickerClearBtn, className]}
      onClick={(e) => {
        // Keep the trigger's open toggle out of this click — clearing
        // must not flip the panel either way (the pointerdown above
        // already reached the floating handlers for race attribution,
        // so an open panel stays open and a closed one stays closed).
        e.stopPropagation();
        onClear();
      }}
    >
      ×
    </span>
  );
}

export type { PickerChipsProps, PickerClearButtonProps, PickerOverflowBadgeProps };
