import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type ComboboxOptionProps = {
  value: string;
  highlighted?: boolean;
  selected?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
  children: ReactNode;
};

const option = css`
  display: flex;
  align-items: center;
  padding: var(--pbl-space-2) var(--pbl-space-3);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  color: var(--pbl-color-text);
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: var(--pbl-color-bg-subtle);
  }
`;

const highlightedStyle = css`
  background: var(--pbl-color-bg-subtle);
`;

const selectedStyle = css`
  font-weight: var(--pbl-weight-medium);
  color: var(--pbl-color-primary);
`;

export default function ComboboxOption({
  value,
  highlighted = false,
  selected = false,
  onSelect,
  className,
  children,
}: ComboboxOptionProps) {
  return (
    <div
      role='option'
      aria-selected={selected}
      x-class={[option, highlighted && highlightedStyle, selected && selectedStyle, className]}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  );
}

export type {ComboboxOptionProps};
