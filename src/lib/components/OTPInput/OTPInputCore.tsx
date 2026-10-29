import type { Ref } from 'react';

import { useRef, useCallback } from 'react';
import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';
import { formatString } from '../LocaleProvider/locale';
import { mergeRefs } from '../../utils/refs';
import { fieldChrome } from '../../utils/field-skin';

type OTPInputCoreProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Forwarded to the first cell's `<input>`. */
  ref?: Ref<HTMLInputElement>;
};

const container = css`
  display: inline-flex;
  gap: var(--haze-space-2);
  font-family: var(--haze-font-sans);
`;

/* The cell surface (border/radius/fill) comes from utils/field-skin.ts;
 * the cell keeps its own box (space-10 wide, space-10 + space-1 = 44px
 * tall), mono typography and the :focus ring — as a leaf input it
 * focuses under :focus, not :focus-within, and resets its outline
 * unconditionally rather than inside the focus arm. */
const cell = css`
  width: var(--haze-space-10);
  height: calc(var(--haze-space-10) + var(--haze-space-1));
  text-align: center;
  font-size: var(--haze-text-lg);
  font-family: var(--haze-font-mono);
  color: var(--haze-color-text);
  outline: none;
  transition: border-color var(--haze-duration-fast), box-shadow var(--haze-duration-fast);

  &:focus {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/* A cell is blank when it holds no char or a space placeholder —
 * non-sequential fills pad the gap with spaces so digit positions
 * stay stable (see handleChange). */
const isBlank = (ch: string | undefined) => !ch || ch === ' ';

export default function OTPInputCore({
  length = 6,
  value,
  onChange,
  className,
  ref,
}: OTPInputCoreProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const strings = useStrings('otpInput');
  // The forwarded ref rides cell 0 — the first cell is the component's
  // focus entry point.
  const setFirstCellRef = useCallback(
    (node: HTMLInputElement | null) => mergeRefs(ref)(node),
    [ref]
  );

  const handleChange = useCallback(
    (index: number, char: string) => {
      const next = value.split('');
      // Filling a cell beyond the value's end leaves sparse holes in
      // next — join('') collapses them, so the digit would land right
      // after the last existing char while focus advances past the
      // typed cell. Pad the gap with space placeholders so each digit
      // keeps its position ('1' + typing into cell 4 → '1  4').
      const pad = index > next.length ? ' '.repeat(index - next.length) : '';
      next[index] = pad + char.slice(-1);
      const joined = next.join('').slice(0, length);
      onChange(joined);

      if (char && index < length - 1) {
        refs.current[index + 1]?.focus();
      }
    },
    [value, length, onChange],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && isBlank(value[index]) && index > 0) {
        refs.current[index - 1]?.focus();
      }
    },
    [value],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').slice(0, length);
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      refs.current[nextIndex]?.focus();
    },
    [length, onChange],
  );

  return (
    <div data-slot="otp-input" x-class={[container, className]}>
      {Array.from({ length }, (_, i) => {
        const ch = value[i] ?? '';
        return (
          <input
            key={i}
            data-slot="segment"
            ref={(el) => {
              refs.current[i] = el;
              if (i === 0) setFirstCellRef(el);
            }}
            x-class={[fieldChrome, cell]}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            aria-label={formatString(strings.digitLabel, { index: i + 1, total: length })}
            /* A space placeholder renders as an empty cell — the native
             * value must not carry the space or maxLength={1} would
             * block typing over it. */
            value={ch === ' ' ? '' : ch}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
          />
        );
      })}
    </div>
  );
}

export type { OTPInputCoreProps };
