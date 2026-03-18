import type {ComponentPropsWithoutRef} from 'react';
import type {Control} from 'react-use-control';

import {css} from '@linaria/core';
import {useControl} from 'react-use-control';

type CheckboxProps = {
  checked?: Control<boolean> | boolean;
} & Omit<ComponentPropsWithoutRef<'input'>, 'checked' | 'type'>;

const base = css`
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid var(--pbl-color-border);
  border-radius: var(--pbl-radius-sm);
  background: var(--pbl-color-bg);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  flex-shrink: 0;
  position: relative;

  &:hover {
    border-color: var(--pbl-color-border-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
  }

  &:checked {
    background: var(--pbl-color-primary);
    border-color: var(--pbl-color-primary);
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 5px;
    width: 5px;
    height: 9px;
    border: solid var(--pbl-color-text-inverse);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function Checkbox({
  checked: checkedControl,
  className,
  onChange,
  ...rest
}: CheckboxProps) {
  const [checked, setChecked] = useControl(checkedControl as Control<boolean>, false);

  return (
    <input
      type='checkbox'
      x-class={[base, className]}
      checked={checked}
      onChange={(e) => {
        setChecked(e.target.checked);
        onChange?.(e);
      }}
      {...rest}
    />
  );
}

export type {CheckboxProps};
