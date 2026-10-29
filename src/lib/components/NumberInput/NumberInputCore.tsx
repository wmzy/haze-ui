import type { ComponentPropsWithoutRef, Ref } from 'react';

import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';
import { fieldSizes, focusWithinRing } from '../../utils/field-skin';
import { clamp as clampToRange, quantize } from '../../utils/math';

import { btnSizes } from './number-input-styles';

type NumberInputCoreProps = {
  value: number;
  onChange: (value: number) => void;
  /** Native change event passthrough — invoked with the DOM event after
   * `onChange`, so a spread can never override the controlled callback. */
  onNativeChange?: ComponentPropsWithoutRef<'input'>['onChange'];
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Forwarded to the inner number `<input>` (not the wrapper div). */
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'onChange' | 'size'>;

/* The wrapper keeps its own border/radius/fill delta (no background —
 * the inner input and the step buttons paint their own surfaces) and
 * wears the shared :focus-within ring from utils/field-skin.ts. */
const wrapper = css`
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  overflow: hidden;
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);
`;

const input = css`
  border: none;
  outline: none;
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  text-align: center;
  width: 100%;
  min-width: 0;
  -moz-appearance: textfield;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }
`;

const stepBtn = css`
  appearance: none;
  border: none;
  background: var(--haze-color-bg-subtle);
  color: var(--haze-color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
  transition: background var(--haze-duration-fast);
  user-select: none;

  &:hover {
    background: var(--haze-color-bg-muted);
  }

  &:active {
    background: var(--haze-color-border);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function NumberInputCore({
  value,
  onChange,
  onNativeChange,
  min,
  max,
  step = 1,
  size = 'md',
  className,
  ref,
  ...rest
}: NumberInputCoreProps) {
  const strings = useStrings('numberInput');
  // Round away binary-float noise (0.30000000000000004) at 1e10
  // precision, then clamp via the shared clamp — an undefined bound is
  // passed as ±Infinity, i.e. unbounded.
  const clamp = (n: number) =>
    clampToRange(quantize(n, 1e10), min ?? -Infinity, max ?? Infinity);

  return (
    <div data-slot='number-input' x-class={[focusWithinRing, wrapper, className]}>
      <button
        type='button'
        data-slot='step-down'
        x-class={[stepBtn, btnSizes[size]]}
        onClick={() => onChange(clamp(value - step))}
        disabled={min !== undefined && value <= min}
        aria-label={strings.decrease}
      >
        −
      </button>
      <input
        ref={ref}
        type='number'
        data-slot='input'
        x-class={[input, fieldSizes[size]]}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(clamp(n));
          onNativeChange?.(e);
        }}
        {...rest}
      />
      <button
        type='button'
        data-slot='step-up'
        x-class={[stepBtn, btnSizes[size]]}
        onClick={() => onChange(clamp(value + step))}
        disabled={max !== undefined && value >= max}
        aria-label={strings.increase}
      >
        +
      </button>
    </div>
  );
}

export type { NumberInputCoreProps };
