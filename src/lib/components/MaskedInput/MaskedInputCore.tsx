import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import { useLayoutEffect, useRef } from 'react';

import InputCore from '../Input/InputCore';
import { mergeRefs } from '../../utils/refs';

import { applyEdit, formatMask, unmask } from './mask';

type MaskedInputCoreProps = {
  value: string;
  onChange: (value: string) => void;
  /** Native change event passthrough — invoked with the DOM event after
   * `onChange`, so a spread can never override the controlled callback. */
  onNativeChange?: ComponentPropsWithoutRef<'input'>['onChange'];
  /** Mask pattern: `9` digit, `a` letter, `A` letter uppercased, `*`
   * alphanumeric, any other char a literal, `\\` escapes the next one.
   * Changing it re-formats the current slot content under the new
   * pattern. */
  mask: string;
  size?: 'sm' | 'md' | 'lg';
  /** See {@link InputCoreProps.leftSection}. */
  leftSection?: ReactNode;
  /** See {@link InputCoreProps.rightSection}. */
  rightSection?: ReactNode;
  className?: string;
  /** Forwarded to the underlying `<input>` — the element form bridges,
   * tests and `ref.current.focus()` reach. */
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'size'>;

/**
 * Headless masked text input — the value engine over `InputCore`'s
 * skin. Every edit is diffed against the committed value and applied
 * through the pure `applyEdit` engine: rejected input restores the DOM
 * imperatively (a controlled React input only snaps back on the next
 * render, and a rejected edit triggers none), accepted edits commit
 * the masked value and place the caret after the edited character in
 * the same tick, so jsdom and browsers agree on `selectionStart`.
 */
export default function MaskedInputCore({
  value,
  onChange,
  onNativeChange,
  mask,
  size = 'md',
  className,
  leftSection,
  rightSection,
  onKeyDown,
  onKeyUp,
  ref,
  ...rest
}: MaskedInputCoreProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Which delete key produced the change event being processed — read
  // once, then cleared; keyup clears it when no change ever fired
  // (Backspace on an empty field must not poison the next edit).
  const deleteDirectionRef = useRef<'backward' | 'forward' | null>(null);
  const prevMaskRef = useRef(mask);

  const commit = (next: string, caret: number) => {
    const el = inputRef.current;
    if (!el) return;
    el.value = next;
    el.setSelectionRange(caret, caret);
  };

  const handleChange = (raw: string) => {
    const el = inputRef.current;
    const caret = el?.selectionStart ?? raw.length;
    const direction = deleteDirectionRef.current;
    deleteDirectionRef.current = null;
    const result = applyEdit(value, raw, caret, mask, direction);
    if (result.type === 'edit') {
      onChange(result.value);
      commit(result.value, result.caret);
      return;
    }
    // reject: hard no-op; skip: caret-only move. Both keep the value.
    commit(value, result.caret);
  };

  // Re-format when the mask changes or an external value arrives
  // non-conforming: slot content is extracted under the mask the value
  // was last formatted with, then re-placed under the current one
  // (already-conforming values round-trip identically, so user edits
  // never echo back mangled).
  useLayoutEffect(() => {
    const prevMask = prevMaskRef.current;
    prevMaskRef.current = mask;
    const formatted = formatMask(unmask(value, prevMask), mask);
    if (formatted !== value) onChange(formatted);
  });

  return (
    <InputCore
      ref={(node: HTMLInputElement | null) => mergeRefs(inputRef, ref)(node)}
      data-slot='input'
      value={value}
      onChange={handleChange}
      onNativeChange={onNativeChange}
      size={size}
      className={className}
      leftSection={leftSection}
      rightSection={rightSection}
      onKeyDown={(e) => {
        deleteDirectionRef.current =
          e.key === 'Backspace'
            ? 'backward'
            : e.key === 'Delete'
              ? 'forward'
              : null;
        onKeyDown?.(e);
      }}
      onKeyUp={(e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          deleteDirectionRef.current = null;
        }
        onKeyUp?.(e);
      }}
      {...rest}
    />
  );
}

export type { MaskedInputCoreProps };
