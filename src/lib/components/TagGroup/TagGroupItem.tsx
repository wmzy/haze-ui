import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type TagGroupItemProps = {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
};

const tag = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  padding: var(--haze-space-1) var(--haze-space-3);
  background: var(--haze-color-muted);
  color: var(--haze-color-text);
  border-radius: var(--haze-radius-full);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  line-height: var(--haze-leading-tight);
`;

const closeBtn = css`
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
  padding: var(--haze-space-1);
  min-width: 1.5rem;
  min-height: 1.5rem;

  &:hover {
    color: var(--haze-color-text);
  }
`;

export default function TagGroupItem({ children, onClose, className }: TagGroupItemProps) {
  return (
    <span x-class={[tag, className]}>
      {children}
      {onClose && (
        <button x-class={[closeBtn]} type="button" onClick={onClose} aria-label="Remove">
          x
        </button>
      )}
    </span>
  );
}

export type { TagGroupItemProps };
