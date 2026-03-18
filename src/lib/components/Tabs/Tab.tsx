import type {ReactNode} from 'react';

import {css} from '@linaria/core';

import {useTabsContext} from './TabsContext';

type TabProps = {
  value: string;
  className?: string;
  children: ReactNode;
};

const base = css`
  padding: var(--pbl-space-2) var(--pbl-space-4);
  border: none;
  background: transparent;
  color: var(--pbl-color-text-muted);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  font-weight: var(--pbl-weight-medium);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: var(--pbl-color-text);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
  }
`;

const active = css`
  color: var(--pbl-color-primary);
  border-bottom-color: var(--pbl-color-primary);
`;

export default function Tab({value, className, children}: TabProps) {
  const {value: current, setValue} = useTabsContext();
  const isActive = current === value;

  return (
    <button
      type='button'
      role='tab'
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      x-class={[base, isActive && active, className]}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
}

export type {TabProps};
