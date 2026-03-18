import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

type NumberInputProps = {
  value?: Control<number> | number;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'size'>;

const wrapper = css`
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  overflow: hidden;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:focus-within {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const input = css`
  border: none;
  outline: none;
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  text-align: center;
  width: 60px;
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
  transition: background 0.1s;
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

const inputSizes = {
  sm: css`
    padding: var(--haze-space-1);
    font-size: var(--haze-text-sm);
  `,
  md: css`
    padding: var(--haze-space-2);
    font-size: var(--haze-text-sm);
  `,
  lg: css`
    padding: var(--haze-space-3);
    font-size: var(--haze-text-base);
  `,
} as const;

const btnSizes = {
  sm: css`
    padding: 0 var(--haze-space-2);
    font-size: var(--haze-text-sm);
  `,
  md: css`
    padding: 0 var(--haze-space-3);
    font-size: var(--haze-text-sm);
  `,
  lg: css`
    padding: 0 var(--haze-space-3);
    font-size: var(--haze-text-base);
  `,
} as const;

export default function NumberInput({
  value: valueControl,
  min,
  max,
  step = 1,
  size = 'md',
  className,
  onChange,
  ...rest
}: NumberInputProps) {
  const [value, setValue] = useControl(valueControl as Control<number>, 0);

  const clamp = (n: number) => {
    const clamped = Math.round(n * 1e10) / 1e10;
    if (min !== undefined && clamped < min) return min;
    if (max !== undefined && clamped > max) return max;
    return clamped;
  };

  return (
    <div x-class={[wrapper, className]}>
      <button
        type='button'
        x-class={[stepBtn, btnSizes[size]]}
        onClick={() => setValue(clamp(value - step))}
        disabled={min !== undefined && value <= min}
        aria-label='Decrease'
      >
        −
      </button>
      <input
        type='number'
        x-class={[input, inputSizes[size]]}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) setValue(clamp(n));
          onChange?.(e);
        }}
        {...rest}
      />
      <button
        type='button'
        x-class={[stepBtn, btnSizes[size]]}
        onClick={() => setValue(clamp(value + step))}
        disabled={max !== undefined && value >= max}
        aria-label='Increase'
      >
        +
      </button>
    </div>
  );
}

export type { NumberInputProps };
