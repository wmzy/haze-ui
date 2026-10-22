import type { ReactNode } from 'react';

import { base, variants, tagSizes, closeBtn } from './tag-styles';

type TagProps = {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  closable?: boolean;
  onClose?: () => void;
  /**
   * Accessible label for the remove button. Inlined default keeps Tag
   * hook-free (RSC-safe: no useStrings); locale-aware callers pass
   * their own string.
   */
  removeLabel?: string;
  className?: string;
  children: ReactNode;
};

export default function Tag({
  variant = 'default',
  size = 'md',
  closable = false,
  onClose,
  removeLabel = 'Remove',
  className,
  children,
}: TagProps) {
  return (
    <span data-slot="tag" x-class={[base, variants[variant], tagSizes[size], className]}>
      {children}
      {closable && (
        <button
          data-slot="remove-button"
          type='button'
          className={closeBtn}
          aria-label={removeLabel}
          onClick={onClose}
        >
          ×
        </button>
      )}
    </span>
  );
}

export type { TagProps };
