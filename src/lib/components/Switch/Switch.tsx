import type {ComponentPropsWithoutRef} from 'react';
import type {Control} from 'react-use-control';

import {css} from '@linaria/core';
import {useControl} from 'react-use-control';

type SwitchProps = {
  checked?: Control<boolean> | boolean;
  size?: 'sm' | 'md' | 'lg';
} & Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'checked'>;

const track = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  border: none;
  border-radius: var(--pbl-radius-full);
  background: var(--pbl-color-bg-muted);
  cursor: pointer;
  padding: 2px;
  transition: background 0.2s;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const trackChecked = css`
  background: var(--pbl-color-primary);
`;

const thumb = css`
  display: block;
  border-radius: var(--pbl-radius-full);
  background: white;
  transition: transform 0.2s;
  box-shadow: var(--pbl-shadow-sm);
`;

const trackSizes = {
  sm: css`
    width: 32px;
    height: 18px;
  `,
  md: css`
    width: 40px;
    height: 22px;
  `,
  lg: css`
    width: 48px;
    height: 26px;
  `,
} as const;

const thumbSizes = {
  sm: css`
    width: 14px;
    height: 14px;
  `,
  md: css`
    width: 18px;
    height: 18px;
  `,
  lg: css`
    width: 22px;
    height: 22px;
  `,
} as const;

const thumbCheckedSizes = {
  sm: css`
    transform: translateX(14px);
  `,
  md: css`
    transform: translateX(18px);
  `,
  lg: css`
    transform: translateX(22px);
  `,
} as const;

export default function Switch({
  checked: checkedControl,
  size = 'md',
  className,
  onClick,
  ...rest
}: SwitchProps) {
  const [checked, setChecked] = useControl(checkedControl as Control<boolean>, false);

  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      x-class={[track, trackSizes[size], checked && trackChecked, className]}
      onClick={(e) => {
        setChecked((prev) => !prev);
        onClick?.(e);
      }}
      {...rest}
    >
      <span
        x-class={[
          thumb,
          thumbSizes[size],
          checked && thumbCheckedSizes[size],
        ]}
      />
    </button>
  );
}

export type {SwitchProps};
