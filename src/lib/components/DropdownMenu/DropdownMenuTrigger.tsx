import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuTriggerProps = {
  children: ReactNode;
  className?: string;
};

const trigger = css`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font: inherit;
  color: inherit;
`;

export default function DropdownMenuTrigger({ children, className }: DropdownMenuTriggerProps) {
  const { setOpen } = useDropdownMenuContext();

  return (
    <button
      x-class={[trigger, className]}
      type="button"
      onClick={() => setOpen((prev) => !prev)}
    >
      {children}
    </button>
  );
}

export type { DropdownMenuTriggerProps };
