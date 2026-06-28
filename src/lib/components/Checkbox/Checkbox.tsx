import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

type CheckboxProps = {
  checked?: Control<boolean> | boolean;
  label?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'input'>, 'checked' | 'type'>;

const base = css`
  appearance: none;
  width: 1.125rem;
  height: 1.125rem;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-bg);
  cursor: pointer;
  margin: 0.4375rem;
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
  flex-shrink: 0;
  position: relative;

  &:hover {
    border-color: var(--haze-color-border-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:checked {
    background: var(--haze-color-primary);
    border-color: var(--haze-color-primary);
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 5px;
    width: 5px;
    height: 9px;
    border: solid var(--haze-color-text-inverse);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const labelText = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  cursor: pointer;
  user-select: none;
`;

export default function Checkbox({
  checked: checkedControl,
  className,
  label,
  onChange,
  ...rest
}: CheckboxProps) {
  const [checked, setChecked] = useControl(
    checkedControl as Control<boolean>,
    false
  );

  const input = (
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

  if (label === undefined) {
    return input;
  }

  return <label x-class={labelText}>{input}{label}</label>;
}

export type { CheckboxProps };
