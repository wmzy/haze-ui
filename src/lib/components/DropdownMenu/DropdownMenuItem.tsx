import type { ReactNode } from 'react';
import { useDropdownMenuContext } from './DropdownMenuContext';
import { css } from '@linaria/core';

type DropdownMenuItemProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

const item = css`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--haze-space-2) var(--haze-space-3);
  border: none;
  background: none;
  cursor: pointer;
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
  border-radius: var(--haze-radius-sm);
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: var(--haze-color-muted);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function DropdownMenuItem({ children, onClick, disabled, className }: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setOpen(false);
  };

  return (
    <button x-class={[item, className]} type="button" onClick={handleClick} disabled={disabled}>
      {children}
    </button>
  );
}

export type { DropdownMenuItemProps };
