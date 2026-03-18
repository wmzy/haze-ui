import type {ComponentPropsWithoutRef} from 'react';
import type {Control} from 'react-use-control';

import {css} from '@linaria/core';
import {useControl} from 'react-use-control';

type SliderProps = {
  value?: Control<number> | number;
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value'>;

const base = css`
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: var(--pbl-radius-full);
  background: var(--pbl-color-bg-muted);
  outline: none;
  cursor: pointer;
  transition: background 0.15s;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: var(--pbl-radius-full);
    background: var(--pbl-color-primary);
    border: 2px solid var(--pbl-color-bg);
    box-shadow: var(--pbl-shadow-sm);
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: var(--pbl-radius-full);
    background: var(--pbl-color-primary);
    border: 2px solid var(--pbl-color-bg);
    box-shadow: var(--pbl-shadow-sm);
    cursor: pointer;
  }

  &:focus-visible {
    &::-webkit-slider-thumb {
      box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
    }
    &::-moz-range-thumb {
      box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function Slider({
  value: valueControl,
  className,
  onChange,
  ...rest
}: SliderProps) {
  const [value, setValue] = useControl(valueControl as Control<number>, 50);

  return (
    <input
      type='range'
      x-class={[base, className]}
      value={value}
      onChange={(e) => {
        setValue(Number(e.target.value));
        onChange?.(e);
      }}
      {...rest}
    />
  );
}

export type {SliderProps};
