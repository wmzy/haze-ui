import type { ReactNode, Ref } from 'react';

import { base, colors, tagSizes, closeBtn } from './tag-styles';

type TagProps = {
  /** Semantic status color. */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
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
  /** Forwarded to the root span (data-slot='tag'). */
  ref?: Ref<HTMLSpanElement>;
};

export default function Tag({
  color = 'default',
  size = 'md',
  closable = false,
  onClose,
  removeLabel = 'Remove',
  className,
  children,
  ref,
}: TagProps) {
  return (
    <span ref={ref} data-slot="tag" x-class={[base, colors[color], tagSizes[size], className]}>
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
