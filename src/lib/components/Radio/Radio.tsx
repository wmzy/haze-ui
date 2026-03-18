import type {ComponentPropsWithoutRef} from 'react';

import {css} from '@linaria/core';

import {useRadioContext} from './RadioContext';

type RadioProps = {
  value: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'name' | 'checked' | 'onChange'>;

const radioInput = css`
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid var(--pbl-color-border);
  border-radius: var(--pbl-radius-full);
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
    border-color: var(--pbl-color-primary);
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    height: 10px;
    border-radius: var(--pbl-radius-full);
    background: var(--pbl-color-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const labelStyle = css`
  display: inline-flex;
  align-items: center;
  gap: var(--pbl-space-2);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  color: var(--pbl-color-text);
  cursor: pointer;
`;

export default function Radio({
  value,
  className,
  children,
  ...rest
}: RadioProps & {children?: React.ReactNode}) {
  const ctx = useRadioContext();

  return (
    <label x-class={[labelStyle, className]}>
      <input
        type='radio'
        className={radioInput}
        name={ctx?.name}
        value={value}
        checked={ctx ? ctx.value === value : undefined}
        onChange={() => ctx?.setValue(value)}
        {...rest}
      />
      {children}
    </label>
  );
}

export type {RadioProps};
