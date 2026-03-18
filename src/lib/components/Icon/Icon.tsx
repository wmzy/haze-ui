import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type IconProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
};

const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;

  & > svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`;

const sizes = {
  sm: css`
    width: 16px;
    height: 16px;
  `,
  md: css`
    width: 20px;
    height: 20px;
  `,
  lg: css`
    width: 24px;
    height: 24px;
  `,
} as const;

export default function Icon({
  size = 'md',
  className,
  children,
}: IconProps) {
  return (
    <span x-class={[base, sizes[size], className]} aria-hidden='true'>
      {children}
    </span>
  );
}

export type {IconProps};
