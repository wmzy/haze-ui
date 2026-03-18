import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useId } from 'react';

type TooltipProps = {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children: ReactNode;
};

const wrapper = css`
  position: relative;
  display: inline-flex;
`;

const bubble = css`
  position: absolute;
  z-index: 1000;
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-text);
  color: var(--haze-color-text-inverse);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  line-height: var(--haze-leading-normal);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
`;

const positions = {
  top: css`
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: var(--haze-space-1);
  `,
  bottom: css`
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: var(--haze-space-1);
  `,
  left: css`
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: var(--haze-space-1);
  `,
  right: css`
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: var(--haze-space-1);
  `,
} as const;

const showOnInteract = css`
  &:hover > [role='tooltip'],
  &:focus-within > [role='tooltip'] {
    opacity: 1;
  }
`;

export default function Tooltip({
  content,
  position = 'top',
  className,
  children,
}: TooltipProps) {
  const id = useId();

  return (
    <span x-class={[wrapper, showOnInteract, className]}>
      <span aria-describedby={id}>{children}</span>
      <span id={id} role='tooltip' x-class={[bubble, positions[position]]}>
        {content}
      </span>
    </span>
  );
}

export type { TooltipProps };
