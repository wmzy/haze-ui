import type { ComponentPropsWithoutRef } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

type SwitchProps = {
  checked?: Control<boolean> | boolean;
  size?: 'sm' | 'md' | 'lg';
} & Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'checked'>;

const track = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  border: none;
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-bg-muted);
  cursor: pointer;
  padding: 2px;
  transition: background 0.2s;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const trackChecked = css`
  background: var(--haze-color-primary);
`;

const thumb = css`
  display: block;
  border-radius: var(--haze-radius-full);
  background: white;
  transition: transform 0.2s;
  box-shadow: var(--haze-shadow-sm);
`;

const trackSm = css`
  width: 2.25rem;
  height: 1.25rem;
`;

const trackMd = css`
  width: 40px;
  height: 22px;
`;

const trackLg = css`
  width: 48px;
  height: 26px;
`;

const thumbSm = css`
  width: 1rem;
  height: 1rem;
`;

const thumbMd = css`
  width: 18px;
  height: 18px;
`;

const thumbLg = css`
  width: 22px;
  height: 22px;
`;

const thumbCheckedSm = css`
  transform: translateX(1rem);
`;

const thumbCheckedMd = css`
  transform: translateX(18px);
`;

const thumbCheckedLg = css`
  transform: translateX(22px);
`;

const trackSizes = {
  sm: trackSm,
  md: trackMd,
  lg: trackLg,
} as const;

const thumbSizes = {
  sm: thumbSm,
  md: thumbMd,
  lg: thumbLg,
} as const;

const thumbCheckedSizes = {
  sm: thumbCheckedSm,
  md: thumbCheckedMd,
  lg: thumbCheckedLg,
} as const;

export default function Switch({
  checked: checkedControl,
  size = 'md',
  className,
  onClick,
  ...rest
}: SwitchProps) {
  const [checked, setChecked] = useControl(
    checkedControl as Control<boolean>,
    false
  );

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
        x-class={[thumb, thumbSizes[size], checked && thumbCheckedSizes[size]]}
      />
    </button>
  );
}

export type { SwitchProps };
