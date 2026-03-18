import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type MenuItemProps = {
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

const item = css`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--pbl-space-2) var(--pbl-space-3);
  border: none;
  background: transparent;
  color: var(--pbl-color-text);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: var(--pbl-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    background: var(--pbl-color-bg-subtle);
    box-shadow: inset 0 0 0 2px var(--pbl-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function MenuItem({
  onSelect,
  disabled = false,
  className,
  children,
}: MenuItemProps) {
  return (
    <button
      type='button'
      role='menuitem'
      x-class={[item, className]}
      disabled={disabled}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

export type {MenuItemProps};
